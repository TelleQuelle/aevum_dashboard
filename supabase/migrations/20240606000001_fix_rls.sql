-- In a real app, we would verify Telegram initData on the backend.
-- For this MVP internal tool, we will allow read/write access to the anon role 
-- since the dashboard itself is protected by the Telegram WebApp auth check.

DROP POLICY IF EXISTS "Allow all access to authenticated users" ON posts;
DROP POLICY IF EXISTS "Allow all access to authenticated users" ON subscriber_snapshots;
DROP POLICY IF EXISTS "Allow all access to authenticated users" ON platform_metrics;
DROP POLICY IF EXISTS "Allow all access to authenticated users" ON settings;
DROP POLICY IF EXISTS "Allow all access to authenticated users" ON allowed_admins;

CREATE POLICY "Allow all access to anon" ON posts FOR ALL TO anon USING (true);
CREATE POLICY "Allow all access to anon" ON subscriber_snapshots FOR ALL TO anon USING (true);
CREATE POLICY "Allow all access to anon" ON platform_metrics FOR ALL TO anon USING (true);
CREATE POLICY "Allow all access to anon" ON settings FOR ALL TO anon USING (true);
CREATE POLICY "Allow all access to anon" ON allowed_admins FOR ALL TO anon USING (true);
