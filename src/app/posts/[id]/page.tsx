'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import { calculateEngagementRate, calculateConversionScore, compareToAverage } from '@/lib/analytics';
import { Card, MetricCard } from '@/components/cards/MetricCard';
import { ChevronLeft, Share2, Bookmark, MessageSquare, ThumbsUp, MousePointer2, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [avgViews, setAvgViews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase.from('posts').select('*').eq('id', id).single();
      if (data) {
        setPost(data);
        
        // Fetch platform average
        const { data: platformPosts } = await supabase
          .from('posts')
          .select('views')
          .eq('platform', data.platform);
        
        if (platformPosts && platformPosts.length > 0) {
          const avg = platformPosts.reduce((acc, p) => acc + (p.views || 0), 0) / platformPosts.length;
          setAvgViews(avg);
        }
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  if (loading) return <div className="animate-pulse space-y-4">
    <div className="h-6 w-24 bg-white/5 rounded" />
    <div className="h-40 bg-white/5 rounded-xl" />
  </div>;

  if (!post) return <div>Post not found</div>;

  const er = calculateEngagementRate(post);
  const cs = calculateConversionScore(post);
  const viewDiff = compareToAverage(post.views, avgViews);

  // Engagement comparison
  const [avgER, setAvgER] = useState(0);
  useEffect(() => {
    const fetchAvgER = async () => {
      const { data: posts } = await supabase.from('posts').select('*').eq('platform', post.platform);
      if (posts && posts.length > 0) {
        const totalER = posts.reduce((acc, p) => acc + calculateEngagementRate(p), 0);
        setAvgER(totalER / posts.length);
      }
    };
    if (post) fetchAvgER();
  }, [post]);

  const erDiff = compareToAverage(er, avgER);

  return (
    <div className="space-y-6">
      <Link href="/posts" className="flex items-center gap-1 text-sm text-gray-500 hover:text-white transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to posts
      </Link>

      <header className="space-y-2">
        <div className="flex gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
            {post.platform}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
            {post.format}
          </span>
        </div>
        <h1 className="text-xl font-bold leading-tight">{post.title}</h1>
        <p className="text-xs text-gray-500">{new Date(post.publish_date).toLocaleDateString()} • {post.topic}</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard 
          label="Views" 
          value={post.views.toLocaleString()} 
          trend={viewDiff >= 0 ? 'up' : 'down'} 
          trendValue={Math.abs(viewDiff)} 
        />
        <MetricCard 
          label="Engagement Rate" 
          value={er.toFixed(2)} 
          suffix="%"
          trend={erDiff >= 0 ? 'up' : 'down'} 
          trendValue={Math.abs(erDiff)} 
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <MetricCard label="Conversion Score" value={cs} suffix="/100" />
      </div>

      <Card className="p-4">
        <h3 className="text-[10px] uppercase text-gray-500 font-bold mb-4 tracking-widest">Engagement Breakdown</h3>
        <div className="grid grid-cols-3 gap-y-6 gap-x-2">
          <div className="flex flex-col items-center">
            <ThumbsUp className="w-4 h-4 text-gray-500 mb-1" />
            <span className="text-sm font-bold">{post.likes}</span>
            <span className="text-[9px] text-gray-600 uppercase">Likes</span>
          </div>
          <div className="flex flex-col items-center">
            <MessageSquare className="w-4 h-4 text-gray-500 mb-1" />
            <span className="text-sm font-bold">{post.comments}</span>
            <span className="text-[9px] text-gray-600 uppercase">Comments</span>
          </div>
          <div className="flex flex-col items-center">
            <Share2 className="w-4 h-4 text-gray-500 mb-1" />
            <span className="text-sm font-bold">{post.shares}</span>
            <span className="text-[9px] text-gray-600 uppercase">Shares</span>
          </div>
          <div className="flex flex-col items-center">
            <Bookmark className="w-4 h-4 text-gray-500 mb-1" />
            <span className="text-sm font-bold">{post.saves}</span>
            <span className="text-[9px] text-gray-600 uppercase">Saves</span>
          </div>
          <div className="flex flex-col items-center">
            <MousePointer2 className="w-4 h-4 text-gray-500 mb-1" />
            <span className="text-sm font-bold">{post.clicks}</span>
            <span className="text-[9px] text-gray-600 uppercase">Clicks</span>
          </div>
          <div className="flex flex-col items-center">
            <UserPlus className="w-4 h-4 text-gray-500 mb-1" />
            <span className="text-sm font-bold">{post.subscriber_growth}</span>
            <span className="text-[9px] text-gray-600 uppercase">Subs</span>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
          <span className="text-xs text-gray-500">Total Engagement Rate</span>
          <span className="text-sm font-bold text-blue-400">{er.toFixed(2)}%</span>
        </div>
      </Card>

      <section className="space-y-4">
        <h3 className="text-[10px] uppercase text-gray-500 font-bold tracking-widest ml-1">Editorial Interpretation</h3>
        <div className="space-y-3">
          <Card className="p-4 border-l-2 border-l-blue-500/50">
            <h4 className="text-[10px] uppercase text-blue-400 font-bold mb-2">What Worked</h4>
            <p className="text-sm text-gray-300">{post.what_worked || 'No data recorded.'}</p>
          </Card>
          <Card className="p-4 border-l-2 border-l-red-500/50">
            <h4 className="text-[10px] uppercase text-red-400 font-bold mb-2">What Did Not Work</h4>
            <p className="text-sm text-gray-300">{post.what_did_not_work || 'No data recorded.'}</p>
          </Card>
          <Card className="p-4 border-l-2 border-l-emerald-500/50">
            <h4 className="text-[10px] uppercase text-emerald-400 font-bold mb-2">Improvement Ideas</h4>
            <p className="text-sm text-gray-300">{post.improvement_ideas || 'No data recorded.'}</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
