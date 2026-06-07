'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/cards/MetricCard';
import { supabase } from '@/lib/supabase';
import { calculateEngagementRate, calculateConsistencyScore } from '@/lib/analytics';
import { Post, SubscriberSnapshot } from '@/types';
import { TrendingUp, Users, FileText, Target } from 'lucide-react';

export default function OverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch latest subscriber snapshot
      const { data: snapshots } = await supabase
        .from('subscriber_snapshots')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      // Fetch posts from this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .order('publish_date', { ascending: false });

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
          totalSubscribers: latestSubscribers,
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

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">AEVUM Dashboard</h1>
          <p className="text-xs text-gray-500">Internal analytics overview</p>
        </div>
        <div className="p-2 bg-blue-500/10 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <TrendingUp className="w-5 h-5 text-blue-400" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <MetricCard 
          label="Total Subscribers" 
          value={stats?.totalSubscribers || 0} 
          trend="up" 
          trendValue={Math.round((stats?.subscriberGrowthWeek / (stats?.totalSubscribers - stats?.subscriberGrowthWeek)) * 100) || 0}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Today" value={stats?.subscriberGrowthToday || 0} prefix="+" />
        <MetricCard label="This Week" value={stats?.subscriberGrowthWeek || 0} prefix="+" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Avg. Views" value={stats?.avgViews || 0} />
        <MetricCard label="Avg. ER" value={stats?.avgEngagementRate || 0} suffix="%" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Posts/Week" value={stats?.postsThisWeek || 0} />
        <MetricCard label="Consistency" value={stats?.consistencyScore || 0} suffix="%" />
      </div>

      {stats?.bestPost && (
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Best Performing Post</h2>
          <div className="bg-[#0A0C10] border border-white/5 rounded-xl p-4">
            <p className="text-[10px] text-blue-400 font-medium mb-1">{stats.bestPost.platform} • {stats.bestPost.topic}</p>
            <h3 className="font-semibold text-sm mb-2">{stats.bestPost.title}</h3>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stats.bestPost.views.toLocaleString()} views</span>
              <span>{calculateEngagementRate(stats.bestPost).toFixed(2)}% ER</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
