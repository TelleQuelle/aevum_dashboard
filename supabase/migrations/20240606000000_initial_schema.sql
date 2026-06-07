-- Create tables for AEVUM Analytics Dashboard

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'Telegram', 'X', 'TikTok', 'Instagram', 'Website'
    format TEXT NOT NULL, -- 'short_post', 'long_post', 'essay', 'thread', 'slideshow', 'video_script', 'interview', 'research_note'
    topic TEXT NOT NULL, -- 'DeFi', 'Stablecoins', 'Solana', 'Infrastructure', etc.
    language TEXT DEFAULT 'ru',
    publish_date TIMESTAMPTZ,
    post_url TEXT,
    hook TEXT,
    description TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    subscriber_growth INTEGER DEFAULT 0,
    notes TEXT,
    what_worked TEXT,
    what_did_not_work TEXT,
    improvement_ideas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriber snapshots table
CREATE TABLE IF NOT EXISTS subscriber_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    subscriber_count INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform metrics table
CREATE TABLE IF NOT EXISTS platform_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    date DATE NOT NULL,
    followers INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    profile_visits INTEGER DEFAULT 0,
    link_clicks INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allowed admins table
CREATE TABLE IF NOT EXISTS allowed_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id TEXT UNIQUE NOT NULL,
    username TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
-- For this MVP, we assume the Supabase client will use the service role or a simple key since it's an internal tool.
-- However, we should at least enable RLS and add basic policies if needed.
-- For simplicity in this MVP, we will allow all authenticated users (or just rely on the API key for now)
-- but in a real app we'd lock this down.

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowed_admins ENABLE ROW LEVEL SECURITY;

-- Simple policies (allow all for now to facilitate development)
CREATE POLICY "Allow all access to authenticated users" ON posts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON subscriber_snapshots FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON platform_metrics FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON allowed_admins FOR ALL TO authenticated USING (true);
