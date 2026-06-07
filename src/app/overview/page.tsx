'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/cards/MetricCard';
import { supabase } from '@/lib/supabase';
import { calculateEngagementRate, calculateConsistencyScore } from '@/lib/analytics';
import { SyncRun } from '@/types';
import { TrendingUp, RefreshCcw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function OverviewPage() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch latest subscriber snapshot
      const { data: snapshots } = await supabase
        .from('subscriber_snapshots')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      // Fetch posts
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .order('publish_date', { ascending: false });

      // Fetch latest sync runs
      const { data: latestSyncs } = await supabase
        .from('sync_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (snapshots && posts) {
        const latestSubscribers = snapshots[0]?.subscriber_count || 0;
        const previousSubscribers = snapshots[1]?.subscriber_count || 0;
        const growthToday = latestSubscribers - previousSubscribers;
        
        const subscribersWeekAgo = snapshots.find(s => {
          const d = new Date(s.date);
          return d <= oneWeekAgo;
        })?.subscriber_count || snapshots[snapshots.length-1]?.subscriber_count;
        
        const growthWeek = latestSubscribers - (subscribersWeekAgo || 0);

        const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
        const avgViews = posts.length > 0 ? Math.round(totalViews / posts.length) : 0;
        
        const totalER = posts.reduce((acc, p) => acc + calculateEngagementRate(p), 0);
        const avgER = posts.length > 0 ? (totalER / posts.length).toFixed(2) : 0;

        const postsThisWeek = posts.filter(p => new Date(p.publish_date) >= oneWeekAgo).length;
        
        // Get planned frequency from settings
        const { data: settings } = await supabase.from('settings').select('*').eq('key', 'planned_posts_per_week').single();
        const planned = settings?.value || 5;
        const consistency = calculateConsistencyScore(postsThisWeek, planned);

        setStats({
          totalSubscribers: latestSubscribers as number,
          subscriberGrowthToday: growthToday,
          subscriberGrowthWeek: growthWeek,
          totalPosts: posts.length,
          postsThisWeek,
          avgViews,
          avgEngagementRate: avgER,
          consistencyScore: consistency,
          bestPost: posts.sort((a, b) => (b.views || 0) - (a.views || 0))[0]
        });
      }

      if (latestSyncs) {
        // Group by platform and get latest for each
        const platforms = ['Telegram', 'X', 'TikTok'];
        const latestPerPlatform = platforms.map(p =>
          latestSyncs.find(s => s.platform === p)
        ).filter(Boolean) as SyncRun[];
        setSyncRuns(latestPerPlatform);
      }

      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse space-y-4">
    <div className="h-24 bg-white/5 rounded-xl" />
    <div className="grid grid-cols-2 gap-4">
      <div className="h-20 bg-white/5 rounded-xl" />
      <div className="h-20 bg-white/5 rounded-xl" />
    </div>
  </div>;

  const lastSyncedAt = syncRuns.length > 0
    ? new Date(Math.max(...syncRuns.map(r => new Date(r.finished_at || r.started_at).getTime())))
    : null;

  const typedStats = stats as any; // Temporary cast to keep it simple and avoid massive refactor

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">AEVUM Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-500">Internal analytics overview</p>
            {lastSyncedAt && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                <Clock className="w-2.5 h-2.5" />
                Synced {formatDistanceToNow(lastSyncedAt)} ago
              </span>
            )}
          </div>
        </div>
        <div className="p-2 bg-blue-500/10 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <TrendingUp className="w-5 h-5 text-blue-400" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <MetricCard 
          label="Total Subscribers" 
          value={typedStats?.totalSubscribers || 0}
          trend="up" 
          trendValue={Math.round((typedStats?.subscriberGrowthWeek / (typedStats?.totalSubscribers - typedStats?.subscriberGrowthWeek)) * 100) || 0}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Today" value={typedStats?.subscriberGrowthToday || 0} prefix="+" />
        <MetricCard label="This Week" value={typedStats?.subscriberGrowthWeek || 0} prefix="+" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Avg. Views" value={typedStats?.avgViews || 0} />
        <MetricCard label="Avg. ER" value={typedStats?.avgEngagementRate || 0} suffix="%" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Posts/Week" value={typedStats?.postsThisWeek || 0} />
        <MetricCard label="Consistency" value={typedStats?.consistencyScore || 0} suffix="%" />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold">Sync Status</h2>
          <RefreshCcw className="w-3 h-3 text-gray-500" />
        </div>
        <div className="grid grid-cols-1 gap-2">
          {syncRuns.length > 0 ? syncRuns.map(run => (
            <div key={run.id} className="bg-[#0A0C10] border border-white/5 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${
                  run.status === 'success' ? 'bg-green-500/10' :
                  run.status === 'failed' ? 'bg-red-500/10' : 'bg-gray-500/10'
                }`}>
                  {run.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> :
                   run.status === 'failed' ? <AlertCircle className="w-3.5 h-3.5 text-red-400" /> :
                   <Clock className="w-3.5 h-3.5 text-gray-400" />}
                </div>
                <div>
                  <h4 className="text-sm font-medium">{run.platform}</h4>
                  <p className="text-[10px] text-gray-500">
                    {run.status === 'success' ? `${run.items_processed} items processed` :
                     run.status === 'skipped' ? 'Credentials missing' : run.error || 'Unknown error'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-gray-500">
                {run.finished_at ? formatDistanceToNow(new Date(run.finished_at), { addSuffix: true }) : 'In progress'}
              </span>
            </div>
          )) : (
            <div className="bg-[#0A0C10] border border-white/5 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500">No sync runs yet</p>
            </div>
          )}
        </div>
      </section>

      {typedStats?.bestPost && (
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Best Performing Post</h2>
          <div className="bg-[#0A0C10] border border-white/5 rounded-xl p-4">
            <p className="text-[10px] text-blue-400 font-medium mb-1">{typedStats.bestPost.platform} • {typedStats.bestPost.topic}</p>
            <h3 className="font-semibold text-sm mb-2">{typedStats.bestPost.title}</h3>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{typedStats.bestPost.views.toLocaleString()} views</span>
              <span>{calculateEngagementRate(typedStats.bestPost).toFixed(2)}% ER</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
