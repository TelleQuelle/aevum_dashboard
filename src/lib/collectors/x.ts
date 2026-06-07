import { supabaseServer } from '../supabase/server';

const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN;
const X_USERNAME = process.env.X_USERNAME;
const X_USER_ID = process.env.X_USER_ID;

export async function syncXAnalytics() {
  const startedAt = new Date().toISOString();

  if (!X_BEARER_TOKEN || (!X_USERNAME && !X_USER_ID)) {
    console.error('X credentials missing');
    await supabaseServer.from('sync_runs').insert({
      platform: 'X',
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
      platform: 'X',
      status: 'running',
      started_at: startedAt
    })
    .select()
    .single();

  try {
    // 1. Get User ID if not provided
    let userId = X_USER_ID;
    if (!userId && X_USERNAME) {
      const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${X_USERNAME.replace('@', '')}?user.fields=public_metrics`, {
        headers: { Authorization: `Bearer ${X_BEARER_TOKEN}` }
      });
      const userData = await userRes.json();
      if (userData.data) {
        userId = userData.data.id;
      } else {
        throw new Error(`X User not found: ${JSON.stringify(userData)}`);
      }
    }

    // 2. Fetch User Metrics
    const userMetricsRes = await fetch(`https://api.twitter.com/2/users/${userId}?user.fields=public_metrics,description,name`, {
      headers: { Authorization: `Bearer ${X_BEARER_TOKEN}` }
    });
    const userMetricsData = await userMetricsRes.json();
    const followersCount = userMetricsData.data?.public_metrics?.followers_count || 0;

    await supabaseServer.from('platform_accounts').upsert({
      platform: 'X',
      username: X_USERNAME || userMetricsData.data?.username,
      external_id: userId,
      display_name: userMetricsData.data?.name,
      followers_count: followersCount,
      last_synced_at: new Date().toISOString()
    }, { onConflict: 'platform, username' });

    // 3. Fetch Recent Tweets
    const tweetsRes = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?max_results=10&tweet.fields=public_metrics,created_at,text,entities&exclude=retweets,replies`, {
      headers: { Authorization: `Bearer ${X_BEARER_TOKEN}` }
    });
    const tweetsData = await tweetsRes.json();
    const tweets = tweetsData.data || [];

    let itemsProcessed = 0;
    for (const tweet of tweets) {
      const metrics = tweet.public_metrics || {};
      const views = metrics.impression_count || 0;
      const likes = metrics.like_count || 0;
      const comments = metrics.reply_count || 0;
      const shares = (metrics.retweet_count || 0) + (metrics.quote_count || 0);
      const saves = metrics.bookmark_count || 0;

      // Upsert into raw_platform_posts
      await supabaseServer.from('raw_platform_posts').upsert({
        platform: 'X',
        external_post_id: tweet.id,
        account_username: X_USERNAME,
        text: tweet.text,
        published_at: tweet.created_at,
        url: `https://x.com/${X_USERNAME?.replace('@', '')}/status/${tweet.id}`,
        raw_json: tweet
      }, { onConflict: 'platform, external_post_id' });

      // Upsert into posts (normalized)
      const { data: post, error: postError } = await supabaseServer.from('posts').upsert({
        platform: 'X',
        external_post_id: tweet.id,
        title: tweet.text.slice(0, 80),
        format: 'thread', // Default for X as requested, though 'short_post' might be better for single tweets
        topic: 'Other',
        language: 'en',
        publish_date: tweet.created_at,
        post_url: `https://x.com/${X_USERNAME?.replace('@', '')}/status/${tweet.id}`,
        views,
        likes,
        comments,
        shares,
        saves,
        source: 'api',
        last_synced_at: new Date().toISOString()
      }, { onConflict: 'platform, external_post_id' }).select().single();

      if (post) {
        // Insert metric snapshot
        await supabaseServer.from('post_metric_snapshots').insert({
          platform: 'X',
          external_post_id: tweet.id,
          post_id: post.id,
          views,
          likes,
          comments,
          shares,
          saves,
          followers: followersCount,
          raw_json: metrics
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
        raw_json: { user: userMetricsData, tweets: tweetsData }
      })
      .eq('id', syncRun.id);

    return { success: true, itemsProcessed };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('X sync error:', error);
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
