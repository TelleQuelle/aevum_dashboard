'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Post, TopicPerformance } from '@/types';
import { calculateEngagementRate } from '@/lib/analytics';
import { Card } from '@/components/cards/MetricCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function TopicsPage() {
  const [data, setData] = useState<TopicPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopicData = async () => {
      const { data: posts } = await supabase.from('posts').select('*');
      if (posts) {
        const topics: Record<string, any> = {};
        posts.forEach((p: Post) => {
          if (!topics[p.topic]) {
            topics[p.topic] = { topic: p.topic, totalViews: 0, totalER: 0, count: 0, totalSaves: 0, totalClicks: 0 };
          }
          topics[p.topic].totalViews += (p.views || 0);
          topics[p.topic].totalER += calculateEngagementRate(p);
          topics[p.topic].count += 1;
          topics[p.topic].totalSaves += (p.saves || 0);
          topics[p.topic].totalClicks += (p.clicks || 0);
        });

        const performance: TopicPerformance[] = Object.values(topics).map((t: any) => ({
          topic: t.topic,
          avgViews: Math.round(t.totalViews / t.count),
          avgEngagementRate: parseFloat((t.totalER / t.count).toFixed(2)),
          totalPosts: t.count,
          totalSaves: t.totalSaves,
          totalClicks: t.totalClicks
        })).sort((a, b) => b.avgViews - a.avgViews);

        setData(performance);
      }
      setLoading(false);
    };

    fetchTopicData();
  }, []);

  if (loading) return <div className="animate-pulse h-64 bg-white/5 rounded-xl" />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold">Topic Analytics</h1>
        <p className="text-xs text-gray-500">Performance by content category</p>
      </header>

      <Card className="p-4 h-64">
        <h3 className="text-[10px] uppercase text-gray-500 font-bold mb-4 tracking-widest">Avg Views by Topic</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" hide />
            <YAxis 
              dataKey="topic" 
              type="category" 
              width={80} 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#0A0C10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
            />
            <Bar dataKey="avgViews" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#60a5fa' : '#334155'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="space-y-3">
        {data.map((item) => (
          <Card key={item.topic} className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm">{item.topic}</h3>
              <span className="text-[10px] text-gray-500 uppercase font-bold">{item.totalPosts} posts</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[9px] uppercase text-gray-500 mb-1">Avg Views</p>
                <p className="text-sm font-bold">{item.avgViews.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-gray-500 mb-1">Avg ER</p>
                <p className="text-sm font-bold">{item.avgEngagementRate}%</p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-gray-500 mb-1">Saves</p>
                <p className="text-sm font-bold">{item.totalSaves}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
