'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/cards/MetricCard';
import { PlusCircle, Database, Check, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSubmitPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const { error } = await supabase.from('posts').insert([{
      title: data.title,
      platform: data.platform,
      format: data.format,
      topic: data.topic,
      views: parseInt(data.views as string) || 0,
      likes: parseInt(data.likes as string) || 0,
      comments: parseInt(data.comments as string) || 0,
      shares: parseInt(data.shares as string) || 0,
      saves: parseInt(data.saves as string) || 0,
      clicks: parseInt(data.clicks as string) || 0,
      publish_date: new Date().toISOString(),
    }]);

    setLoading(false);
    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleSubmitSnapshot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const { error } = await supabase.from('subscriber_snapshots').insert([{
      date: data.date,
      subscriber_count: parseInt(data.count as string) || 0,
      notes: data.notes
    }]);

    setLoading(false);
    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleSync = async (platform: string) => {
    setSyncLoading(platform);
    setSyncError(null);
    try {
      // In a real app, we would call a server action or a protected route
      // that handles the secret. For now, we'll assume the secret is set in env
      // and we have a way to pass it or the endpoint is otherwise secured.
      // Since we can't easily pass the CRON_SECRET from client without exposing it,
      // the recommended way for MVP is a server action.
      // But we were asked to call the sync endpoints.
      // Let's use a proxy or just fetch if we had the secret.
      // To keep it secure as requested, I'll implement a simple server action-like
      // fetch to a new protected route that uses the secret server-side.

      const response = await fetch(`/api/admin/sync?platform=${platform.toLowerCase()}`, {
        method: 'POST',
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Sync failed');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setSyncError(err.message);
    } finally {
      setSyncLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <p className="text-xs text-gray-500">Manage AEVUM data & sync</p>
      </header>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg flex items-center gap-2 text-sm">
          <Check className="w-4 h-4" /> Action completed successfully
        </div>
      )}

      {syncError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" /> {syncError}
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 font-bold">
          <RefreshCw className="w-4 h-4" />
          <span>Data Synchronization</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSync('telegram')}
            disabled={!!syncLoading}
            className="flex flex-col items-center justify-center p-4 bg-[#0A0C10] border border-white/5 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <span className="text-xs font-semibold mb-1">Telegram</span>
            <span className="text-[10px] text-gray-500">{syncLoading === 'telegram' ? 'Syncing...' : 'Sync Now'}</span>
          </button>
          <button
            onClick={() => handleSync('x')}
            disabled={!!syncLoading}
            className="flex flex-col items-center justify-center p-4 bg-[#0A0C10] border border-white/5 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <span className="text-xs font-semibold mb-1">X/Twitter</span>
            <span className="text-[10px] text-gray-500">{syncLoading === 'x' ? 'Syncing...' : 'Sync Now'}</span>
          </button>
          <button
            onClick={() => handleSync('tiktok')}
            disabled={!!syncLoading}
            className="flex flex-col items-center justify-center p-4 bg-[#0A0C10] border border-white/5 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <span className="text-xs font-semibold mb-1">TikTok</span>
            <span className="text-[10px] text-gray-500">{syncLoading === 'tiktok' ? 'Syncing...' : 'Sync Now'}</span>
          </button>
          <button
            onClick={() => handleSync('all')}
            disabled={!!syncLoading}
            className="flex flex-col items-center justify-center p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl hover:bg-blue-600/20 transition-colors disabled:opacity-50"
          >
            <span className="text-xs font-semibold text-blue-400 mb-1">Sync All</span>
            <span className="text-[10px] text-blue-400/70">{syncLoading === 'all' ? 'Syncing...' : 'Run Full Sync'}</span>
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 font-bold">
          <PlusCircle className="w-4 h-4" />
          <span>Add New Post</span>
        </div>
        
        <Card className="p-4">
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Title</label>
              <input name="title" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Platform</label>
                <select name="platform" className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-2 py-2 text-sm focus:outline-none">
                  <option>Telegram</option>
                  <option>X</option>
                  <option>TikTok</option>
                  <option>Instagram</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Topic</label>
                <select name="topic" className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-2 py-2 text-sm focus:outline-none">
                  <option>DeFi</option>
                  <option>Stablecoins</option>
                  <option>Solana</option>
                  <option>Infrastructure</option>
                  <option>AI Agents</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Views</label>
                <input name="views" type="number" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Likes</label>
                <input name="likes" type="number" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Saving...' : 'Add Post'}
            </button>
          </form>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 font-bold">
          <Database className="w-4 h-4" />
          <span>Subscriber Snapshot</span>
        </div>

        <Card className="p-4">
          <form onSubmit={handleSubmitSnapshot} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Date</label>
                <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Count</label>
                <input name="count" type="number" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Saving...' : 'Add Snapshot'}
            </button>
          </form>
        </Card>
      </section>
    </div>
  );
}

import { TrendingUp } from 'lucide-react';
