import { supabaseServer } from '../supabase/server';

const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;
const TIKTOK_OPEN_ID = process.env.TIKTOK_OPEN_ID;

export async function syncTikTokAnalytics() {
  const startedAt = new Date().toISOString();

  if (!TIKTOK_ACCESS_TOKEN) {
    console.error('TikTok credentials missing');
    await supabaseServer.from('sync_runs').insert({
      platform: 'TikTok',
      status: 'skipped',
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      error: 'Credentials missing'
    });
    return { success: false, error: 'Credentials missing' };
  }

  const { data: syncRun } = await supabaseServer
    .from('sync_runs')
    .insert({
      platform: 'TikTok',
      status: 'running',
      started_at: startedAt
    })
    .select()
    .single();

  try {
    // 1. Fetch User Info
    const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=display_name,username,follower_count,avatar_url', {
      headers: { Authorization: `Bearer ${TIKTOK_ACCESS_TOKEN}` }
    });
    const userData = await userRes.json();

    if (userData.error) {
      throw new Error(`TikTok API error (user): ${userData.error.message}`);
    }

    const userInfo = userData.data.user;
    const followersCount = userInfo.follower_count || 0;

    await supabaseServer.from('platform_accounts').upsert({
      platform: 'TikTok',
      username: userInfo.username,
      display_name: userInfo.display_name,
      followers_count: followersCount,
      last_synced_at: new Date().toISOString()
    }, { onConflict: 'platform, username' });

    // 2. Fetch Video List
    const videoRes = await fetch('https://open.tiktokapis.com/v2/video/list/?fields=id,video_description,create_time,cover_image_url,share_url,view_count,like_count,comment_count,share_count', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TIKTOK_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ max_results: 10 })
    });
    const videoData = await videoRes.json();

    if (videoData.error) {
      throw new Error(`TikTok API error (videos): ${videoData.error.message}`);
    }

    const videos = videoData.data.videos || [];
    let itemsProcessed = 0;

    for (const video of videos) {
      const views = video.view_count || 0;
      const likes = video.like_count || 0;
      const comments = video.comment_count || 0;
      const shares = video.share_count || 0;

      // Upsert raw post
      await supabaseServer.from('raw_platform_posts').upsert({
        platform: 'TikTok',
        external_post_id: video.id,
        account_username: userInfo.username,
        title: video.video_description,
        published_at: new Date(video.create_time * 1000).toISOString(),
        url: video.share_url,
        raw_json: video
      }, { onConflict: 'platform, external_post_id' });

      // Upsert normalized post
      const { data: post } = await supabaseServer.from('posts').upsert({
        platform: 'TikTok',
        external_post_id: video.id,
        title: video.video_description?.slice(0, 80) || 'TikTok Video',
        format: 'video_script',
        topic: 'Other',
        language: 'en',
        publish_date: new Date(video.create_time * 1000).toISOString(),
        post_url: video.share_url,
        views,
        likes,
        comments,
        shares,
        source: 'api',
        last_synced_at: new Date().toISOString()
      }, { onConflict: 'platform, external_post_id' }).select().single();

      if (post) {
        // Insert snapshot
        await supabaseServer.from('post_metric_snapshots').insert({
          platform: 'TikTok',
          external_post_id: video.id,
          post_id: post.id,
          views,
          likes,
          comments,
          shares,
          followers: followersCount,
          raw_json: video
        });
      }

      itemsProcessed++;
    }

    // Update sync run
    await supabaseServer
      .from('sync_runs')
      .update({
        status: 'success',
        finished_at: new Date().toISOString(),
        items_processed: itemsProcessed,
        raw_json: { user: userData, videos: videoData }
      })
      .eq('id', syncRun.id);

    return { success: true, itemsProcessed };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('TikTok sync error:', error);
    if (syncRun) {
      await supabaseServer
        .from('sync_runs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          error: errorMessage
        })
        .eq('id', syncRun.id);
    }
    return { success: false, error: errorMessage };
  }
}
