'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateConsistencyScore, getConsistencyLabel } from '@/lib/analytics';
import { Card, MetricCard } from '@/components/cards/MetricCard';
import { CheckCircle2, Target } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ConsistencyPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsistency = async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: posts } = await supabase
        .from('posts')
        .select('publish_date')
        .order('publish_date', { ascending: false });

      const { data: settings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'planned_posts_per_week')
        .single();

      if (posts) {
        const postsThisWeek = posts.filter(p => new Date(p.publish_date) >= oneWeekAgo).length;
        const planned = settings?.value || 5;
        const score = calculateConsistencyScore(postsThisWeek, planned);
        
        let streak = 0;
        const postedDates = new Set(posts.map(p => new Date(p.publish_date).toISOString().split('T')[0]));
        
        let current = new Date();
        // Check if we posted today or yesterday to continue streak
        if (!postedDates.has(current.toISOString().split('T')[0])) {
          current.setDate(current.getDate() - 1);
        }

        while (postedDates.has(current.toISOString().split('T')[0])) {
          streak++;
          current.setDate(current.getDate() - 1);
        }

        setData({
          postsThisWeek,
          planned,
          score,
          streak,
          label: getConsistencyLabel(score),
          last30Days: Array.from({length: 28}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            return {
              date: dateStr,
              hasPost: postedDates.has(dateStr)
            };
          }).reverse()
        });
      }
      setLoading(false);
    };

    fetchConsistency();
  }, []);

  if (loading) return <div className="animate-pulse space-y-4">
    <div className="h-40 bg-white/5 rounded-xl" />
    <div className="h-64 bg-white/5 rounded-xl" />
  </div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold">Publishing Discipline</h1>
        <p className="text-xs text-gray-500">Output consistency & streaks</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Current Streak" value={data.streak} suffix=" days" />
        <MetricCard label="Score" value={data.score} suffix="%" />
      </div>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Consistency Map</h3>
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded",
            data.score >= 70 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          )}>
            {data.label}
          </span>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {data.last30Days.map((day: any) => (
            <div 
              key={day.date} 
              className={cn(
                "aspect-square rounded-sm flex items-center justify-center",
                day.hasPost ? "bg-blue-500/40 border border-blue-500/50" : "bg-white/5 border border-white/5"
              )}
              title={day.date}
            >
              {day.hasPost && <CheckCircle2 className="w-3 h-3 text-blue-200" />}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-[9px] text-gray-600 font-bold uppercase">
          <span>28 days ago</span>
          <span>Today</span>
        </div>
      </Card>

      <section className="space-y-4">
        <h3 className="text-[10px] uppercase text-gray-500 font-bold tracking-widest ml-1">Strategy Status</h3>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-full">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold">{data.postsThisWeek} / {data.planned} posts this week</p>
            <p className="text-xs text-gray-500">Weekly production goal</p>
          </div>
        </Card>
      </section>
    </div>
  );
}
