# AEVUM Analytics Dashboard

AEVUM is a crypto research and media brand. This is an internal analytics dashboard built as a Telegram Mini App to track content performance, audience growth, and publishing consistency.

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase
- **Charts:** Recharts
- **Icons:** Lucide React
- **Platform:** Telegram Mini App SDK

## Project Structure

- `/src/app`: Next.js pages and layouts
- `/src/components`: Reusable UI components
- `/src/lib`: Utilities for Supabase, Telegram, Analytics, and Auth
- `/src/lib/collectors`: Platform-specific data scrapers/collectors
- `/src/types`: TypeScript definitions
- `/supabase`: Database migrations and seed data

## Setup Instructions

### 1. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com).
2. Run migrations from `supabase/migrations/` in order.
3. (Optional) Run `supabase/seed.sql` to populate with sample data.
4. Get your Project URL, Anon Key, and **Service Role Key** (for server-side sync).

### 2. Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHANNEL_USERNAME=@project_aevum

# X / Twitter
X_BEARER_TOKEN=your_x_bearer_token
X_USERNAME=@project_aevum
X_USER_ID=your_x_user_id

# TikTok
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token

# Sync Security
CRON_SECRET=your_random_secret_string
```

### 3. API Setup Guide

#### Telegram
1. Create bot via [@BotFather](https://t.me/BotFather).
2. Add bot as Administrator to your channel.
3. Bot API `getChatMemberCount` is used for subscriber snapshots.

#### X / Twitter
1. Create a developer account at [developer.twitter.com](https://developer.twitter.com).
2. Generate a **Bearer Token** from a v2 App.
3. Ensure the app has "User tweet" and "Users" read permissions.

#### TikTok
1. Register a developer account at [developers.tiktok.com](https://developers.tiktok.com).
2. Create an app and enable "Video List" and "User Info" scopes.
3. Use OAuth to obtain an `ACCESS_TOKEN`.

### 4. Vercel Cron Configuration

The dashboard uses Vercel Cron to automate daily sync.
In `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/sync/all?secret=CRON_SECRET",
      "schedule": "0 0 * * *"
    }
  ]
}
```
*Note: Replace `CRON_SECRET` with your environment variable value in Vercel dashboard settings for the cron job path.*

### 5. Removing Seed Data
Once real sync is working, you can clear the demo data from Supabase:
```sql
DELETE FROM posts WHERE source = 'manual';
DELETE FROM subscriber_snapshots WHERE notes = 'Starting point' OR notes = 'Current';
```

## Metrics Calculations

- **Engagement Rate:** `(likes + comments + shares + saves) / views * 100`
- **Conversion Score:** Weighted score based on saves, shares, comments, clicks, and subscriber growth.
- **Consistency Score:** Based on planned posts per week vs actual posts.

## Features
- **Real-time Sync:** Fetch metrics from Telegram, X, and TikTok APIs.
- **Sync Status:** Track success/failure of background jobs directly on Overview.
- **Manual Sync:** Trigger sync for specific platforms from the Admin Panel.
- **Server-Side Ingestion:** All API secrets are kept server-side for security.
