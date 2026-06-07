-- Migration to add real data ingestion layer tables

-- 1. platform_accounts
CREATE TABLE IF NOT EXISTS platform_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    username TEXT NOT NULL,
    external_id TEXT,
    display_name TEXT,
    followers_count INTEGER DEFAULT 0,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(platform, username)
);

-- 2. raw_platform_posts
CREATE TABLE IF NOT EXISTS raw_platform_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    external_post_id TEXT NOT NULL,
    account_username TEXT,
    title TEXT,
    text TEXT,
    url TEXT,
    published_at TIMESTAMPTZ,
    raw_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(platform, external_post_id)
);

-- 3. update posts table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='external_post_id') THEN
        ALTER TABLE posts ADD COLUMN external_post_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='source') THEN
        ALTER TABLE posts ADD COLUMN source TEXT DEFAULT 'manual';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='last_synced_at') THEN
        ALTER TABLE posts ADD COLUMN last_synced_at TIMESTAMPTZ;
    END IF;
END $$;

-- Add unique constraint to posts
-- We use a partial index to allow multiple NULL external_post_ids (manual posts)
CREATE UNIQUE INDEX IF NOT EXISTS posts_platform_external_id_idx ON posts (platform, external_post_id) WHERE external_post_id IS NOT NULL;

-- 4. post_metric_snapshots
CREATE TABLE IF NOT EXISTS post_metric_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    external_post_id TEXT NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    followers INTEGER DEFAULT 0,
    raw_json JSONB
);

-- 5. sync_runs
CREATE TABLE IF NOT EXISTS sync_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    status TEXT NOT NULL, -- 'running', 'success', 'failed', 'skipped'
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    error TEXT,
    items_processed INTEGER DEFAULT 0,
    raw_json JSONB
);

-- Enable RLS
ALTER TABLE platform_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_platform_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_metric_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;

-- Simple policies (consistent with existing schema)
CREATE POLICY "Allow all access to authenticated users" ON platform_accounts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON raw_platform_posts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON post_metric_snapshots FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON sync_runs FOR ALL TO authenticated USING (true);
