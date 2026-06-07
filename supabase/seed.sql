-- Seed data for AEVUM

-- Allowed Admins
INSERT INTO allowed_admins (telegram_user_id, username, role)
VALUES ('123456789', 'admin_user', 'admin')
ON CONFLICT (telegram_user_id) DO NOTHING;

-- Settings
INSERT INTO settings (key, value)
VALUES 
('project_name', '"AEVUM"'),
('telegram_channel', '"@project_aevum"'),
('default_language', '"ru"'),
('planned_posts_per_week', '5'),
('allowed_admin_ids', '["123456789"]')
ON CONFLICT (key) DO NOTHING;

-- Subscriber Snapshots (Realistic growth)
INSERT INTO subscriber_snapshots (date, subscriber_count, notes)
VALUES 
(CURRENT_DATE - INTERVAL '30 days', 1000, 'Starting point'),
(CURRENT_DATE - INTERVAL '25 days', 1050, 'Slow growth'),
(CURRENT_DATE - INTERVAL '20 days', 1120, 'Post about DeFi viral'),
(CURRENT_DATE - INTERVAL '15 days', 1180, ''),
(CURRENT_DATE - INTERVAL '10 days', 1250, 'Stablecoins post impact'),
(CURRENT_DATE - INTERVAL '5 days', 1320, ''),
(CURRENT_DATE, 1400, 'Current')
ON CONFLICT DO NOTHING;

-- Posts
INSERT INTO posts (title, platform, format, topic, language, publish_date, views, likes, comments, shares, saves, clicks, subscriber_growth, what_worked, what_did_not_work)
VALUES 
('Stablecoins as the new payment layer of the internet', 'Telegram', 'long_post', 'Stablecoins', 'ru', CURRENT_DATE - INTERVAL '12 days', 2500, 150, 25, 45, 80, 120, 35, 'Strong hook, clear relevance', 'A bit long for mobile'),
('Hubra: the power of CeFi, the freedom of DeFi', 'Telegram', 'essay', 'DeFi', 'ru', CURRENT_DATE - INTERVAL '10 days', 1800, 120, 15, 30, 55, 90, 20, 'Unique perspective', 'Technical jargon'),
('Why DeFi has not gone mainstream yet', 'X', 'thread', 'DeFi', 'en', CURRENT_DATE - INTERVAL '8 days', 5000, 450, 60, 150, 200, 300, 50, 'Controversial topic', 'None'),
('Invisible finance: the next stage of DeFi', 'Telegram', 'short_post', 'Infrastructure', 'ru', CURRENT_DATE - INTERVAL '6 days', 1500, 90, 10, 15, 40, 60, 15, 'Concise', 'Could use more visuals'),
('Crypto is not a casino, it is infrastructure', 'TikTok', 'video_script', 'Infrastructure', 'ru', CURRENT_DATE - INTERVAL '5 days', 10000, 800, 100, 250, 400, 500, 80, 'Visuals and editing', 'Audio quality'),
('Most people will understand stablecoins too late', 'Instagram', 'slideshow', 'Stablecoins', 'ru', CURRENT_DATE - INTERVAL '3 days', 4500, 350, 40, 80, 150, 200, 40, 'Clean design', 'Text too small'),
('AI agents and the next crypto UX shift', 'Telegram', 'research_note', 'AI Agents', 'ru', CURRENT_DATE - INTERVAL '1 day', 2200, 180, 30, 60, 110, 150, 30, 'Timely topic', 'Deep technical detail')
ON CONFLICT DO NOTHING;

-- Platform Metrics
INSERT INTO platform_metrics (platform, date, followers, views, profile_visits, link_clicks)
VALUES 
('Telegram', CURRENT_DATE, 1400, 12000, 500, 300),
('X', CURRENT_DATE, 2500, 45000, 1200, 800),
('TikTok', CURRENT_DATE, 5000, 150000, 3000, 1500);
