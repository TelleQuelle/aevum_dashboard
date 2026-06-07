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
- `/src/types`: TypeScript definitions
- `/supabase`: Database migrations and seed data

## Setup Instructions

### 1. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com).
2. Go to the SQL Editor and run the contents of `supabase/migrations/20240606000000_initial_schema.sql`.
3. (Optional) Run `supabase/seed.sql` to populate the dashboard with sample data.
4. Get your Project URL and Anon Key from Project Settings > API.

### 2. Environment Variables

Create a `.env.local` file in the root directory (use `.env.example` as a template):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 4. Telegram Mini App Configuration

1. Create a bot via [@BotFather](https://t.me/BotFather).
2. Use the `/newapp` command to create a Mini App.
3. Set the Web App URL to your deployed dashboard (or use a tunneling service like ngrok for local testing).
4. Add your Telegram User ID to the `allowed_admins` table in Supabase to gain access.

## Metrics Calculations

- **Engagement Rate:** `(likes + comments + shares + saves) / views * 100`
- **Conversion Score:** Weighted score based on saves, shares, comments, clicks, and subscriber growth.
- **Consistency Score:** Based on planned posts per week vs actual posts.

## Future Improvements

- Automatic Telegram channel stats import via Bot API.
- X/Twitter, TikTok, and Instagram analytics integration.
- AI-generated content recommendations and weekly reports.
- Content idea scoring and publishing calendar.
- Multi-agent workflow integration (Research, Content, Visual, Analytics).
