'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import { calculateEngagementRate } from '@/lib/analytics';
import { Card } from '@/components/cards/MetricCard';
import { Search, Filter, ArrowUpRight } from 'lucide-react';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('publish_date', { ascending: false });

      if (data) {
        setPosts(data);
        setFilteredPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    let result = [...posts];
    if (search) {
      result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (platformFilter !== 'All') {
      result = result.filter(p => p.platform === platformFilter);
    }
    if (topicFilter !== 'All') {
      result = result.filter(p => p.topic === topicFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      if (sortBy === 'er') return calculateEngagementRate(b) - calculateEngagementRate(a);
      if (sortBy === 'saves') return (b.saves || 0) - (a.saves || 0);
      if (sortBy === 'clicks') return (b.clicks || 0) - (a.clicks || 0);
      return 0;
    });

    setFilteredPosts(result);
  }, [search, platformFilter, topicFilter, sortBy, posts]);

  if (loading) return <div className="space-y-4 animate-pulse">
    <div className="h-10 bg-white/5 rounded-lg" />
    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
  </div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold">Content Analytics</h1>
        <p className="text-xs text-gray-500">Performance by individual post</p>
      </header>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            placeholder="Search posts..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0C10] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <select 
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="bg-[#0A0C10] border border-white/10 rounded-lg px-2 py-2 text-[10px] focus:outline-none"
          >
            <option value="All">All Platforms</option>
            <option>Telegram</option>
            <option>X</option>
            <option>TikTok</option>
            <option>Instagram</option>
          </select>
          <select 
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="bg-[#0A0C10] border border-white/10 rounded-lg px-2 py-2 text-[10px] focus:outline-none"
          >
            <option value="All">All Topics</option>
            <option>DeFi</option>
            <option>Stablecoins</option>
            <option>Solana</option>
            <option>Infrastructure</option>
            <option>AI Agents</option>
          </select>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#0A0C10] border border-white/10 rounded-lg px-2 py-2 text-[10px] focus:outline-none"
          >
            <option value="date">Newest</option>
            <option value="views">Most Views</option>
            <option value="er">Best ER</option>
            <option value="saves">Most Saves</option>
            <option value="clicks">Most Clicks</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredPosts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`}>
            <Card className="p-4 mb-3 active:bg-white/5 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
                  {post.platform}
                </span>
                <span className="text-[10px] text-gray-500">
                  {new Date(post.publish_date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-semibold text-sm mb-3 line-clamp-2">{post.title}</h3>
              <div className="flex justify-between items-center text-[11px] text-gray-400">
                <div className="flex gap-4">
                  <span><span className="text-gray-200 font-bold">{post.views.toLocaleString()}</span> views</span>
                  <span><span className="text-gray-200 font-bold">{calculateEngagementRate(post).toFixed(1)}%</span> ER</span>
                </div>
                <ArrowUpRight className="w-3 h-3 text-gray-600" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
