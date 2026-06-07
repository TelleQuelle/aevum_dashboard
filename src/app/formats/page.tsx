'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Post, FormatPerformance } from '@/types';
import { calculateEngagementRate } from '@/lib/analytics';
import { Card } from '@/components/cards/MetricCard';

export default function FormatsPage() {
  const [data, setData] = useState<FormatPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormatData = async () => {
      const { data: posts } = await supabase.from('posts').select('*');
      if (posts) {
        const formats: Record<string, any> = {};
        posts.forEach((p: Post) => {
          const f = p.format.replace('_', ' ');
          if (!formats[f]) {
            formats[f] = { format: f, totalViews: 0, totalER: 0, count: 0, totalSaves: 0, totalClicks: 0 };
          }
          formats[f].totalViews += (p.views || 0);
          formats[f].totalER += calculateEngagementRate(p);
          formats[f].count += 1;
          formats[f].totalSaves += (p.saves || 0);
          formats[f].totalClicks += (p.clicks || 0);
        });

        const performance: FormatPerformance[] = Object.values(formats).map((t: any) => ({
          format: t.format,
          avgViews: Math.round(t.totalViews / t.count),
          avgEngagementRate: parseFloat((t.totalER / t.count).toFixed(2)),
          frequency: t.count,
          totalSaves: t.totalSaves,
          totalClicks: t.totalClicks
        })).sort((a, b) => b.avgViews - a.avgViews);

        setData(performance);
      }
      setLoading(false);
    };

    fetchFormatData();
  }, []);

  if (loading) return <div className="animate-pulse space-y-4">
    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 rounded-xl" />)}
  </div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold">Format Analytics</h1>
        <p className="text-xs text-gray-500">Performance by content format</p>
      </header>

      <div className="space-y-4">
        {data.map((item) => (
          <Card key={item.format} className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm uppercase tracking-tight">{item.format}</h3>
              <div className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-400 font-bold">
                Used {item.frequency} times
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] uppercase text-gray-500 mb-0.5">Reach</p>
                  <p className="text-lg font-bold">{item.avgViews.toLocaleString()}</p>
                  <p className="text-[9px] text-gray-600">avg. views</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-gray-500 mb-0.5">Clicks</p>
                  <p className="text-lg font-bold">{item.totalClicks}</p>
                  <p className="text-[9px] text-gray-600">total</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] uppercase text-gray-500 mb-0.5">Engagement</p>
                  <p className="text-lg font-bold text-blue-400">{item.avgEngagementRate}%</p>
                  <p className="text-[9px] text-gray-600">avg. rate</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-gray-500 mb-0.5">Saves</p>
                  <p className="text-lg font-bold">{item.totalSaves}</p>
                  <p className="text-[9px] text-gray-600">total</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
