'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SubscriberSnapshot } from '@/types';
import { Card } from '@/components/cards/MetricCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function GrowthPage() {
  const [snapshots, setSnapshots] = useState<SubscriberSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrowth = async () => {
      const { data } = await supabase
        .from('subscriber_snapshots')
        .select('*')
        .order('date', { ascending: true });

      if (data) {
        setSnapshots(data);
      }
      setLoading(false);
    };

    fetchGrowth();
  }, []);

  if (loading) return <div className="animate-pulse h-64 bg-white/5 rounded-xl" />;

  const chartData = snapshots.map(s => ({
    date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    subscribers: s.subscriber_count
  }));

  const latest = snapshots[snapshots.length - 1]?.subscriber_count || 0;
  const initial = snapshots[0]?.subscriber_count || 0;
  const totalGrowth = latest - initial;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold">Channel Growth</h1>
        <p className="text-xs text-gray-500">Audience trajectory over time</p>
      </header>

      <Card className="p-4 h-64">
        <h3 className="text-[10px] uppercase text-gray-500 font-bold mb-4 tracking-widest">Subscribers Over Time</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#64748b', fontSize: 10 }} 
              axisLine={false}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis 
              hide
              domain={['dataMin - 100', 'dataMax + 100']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0A0C10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
            />
            <Area type="monotone" dataKey="subscribers" stroke="#60a5fa" fillOpacity={1} fill="url(#colorSub)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Net Growth</p>
          <p className="text-2xl font-bold text-blue-400">+{totalGrowth}</p>
          <p className="text-[10px] text-gray-600">past 30 days</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Growth Rate</p>
          <p className="text-2xl font-bold text-blue-400">
            {initial > 0 ? ((totalGrowth / initial) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-[10px] text-gray-600">relative increase</p>
        </Card>
      </div>

      <section className="space-y-3">
        <h3 className="text-[10px] uppercase text-gray-500 font-bold tracking-widest ml-1">Snapshot History</h3>
        <div className="space-y-2">
          {[...snapshots].reverse().map((s) => (
            <div key={s.id} className="flex justify-between items-center p-3 bg-[#0A0C10] border border-white/5 rounded-lg text-sm">
              <span className="text-gray-400">{new Date(s.date).toLocaleDateString()}</span>
              <span className="font-bold">{s.subscriber_count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
