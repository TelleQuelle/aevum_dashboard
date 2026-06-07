'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/cards/MetricCard';
import { Settings, User, Globe, MessageCircle, Save } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const s: Record<string, any> = {};
        data.forEach(item => {
          s[item.key] = item.value;
        });
        setSettings(s);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleSave = async (key: string, value: any) => {
    setSaving(true);
    await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    setSettings({ ...settings, [key]: value });
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse space-y-4">
    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl" />)}
  </div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-xs text-gray-500">Dashboard configuration</p>
      </header>

      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-bold">General</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Project Name</label>
              <div className="flex gap-2">
                <input 
                  defaultValue={settings.project_name || 'AEVUM'} 
                  onBlur={(e) => handleSave('project_name', e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Primary Language</label>
              <select 
                defaultValue={settings.default_language || 'ru'}
                onChange={(e) => handleSave('default_language', e.target.value)}
                className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-2 py-2 text-sm focus:outline-none"
              >
                <option value="ru">Russian</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-bold">Telegram</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Channel Username</label>
              <input 
                defaultValue={settings.telegram_channel || '@project_aevum'} 
                onBlur={(e) => handleSave('telegram_channel', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Planned Posts / Week</label>
              <input 
                type="number"
                defaultValue={settings.planned_posts_per_week || 5} 
                onBlur={(e) => handleSave('planned_posts_per_week', parseInt(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-bold">Admin</h3>
          </div>
          <div>
            <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Allowed Admin IDs (JSON)</label>
            <textarea 
              defaultValue={JSON.stringify(settings.allowed_admin_ids || ["123456789"])} 
              onBlur={(e) => {
                try {
                  handleSave('allowed_admin_ids', JSON.parse(e.target.value));
                } catch(e) {}
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none h-20 font-mono"
            />
          </div>
        </Card>
      </div>

      <p className="text-[10px] text-center text-gray-600 mt-8">
        AEVUM Analytics MVP v1.0.0
      </p>
    </div>
  );
}
