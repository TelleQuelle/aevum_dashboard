import { NextRequest, NextResponse } from 'next/server';
import { syncTelegramAnalytics } from '@/lib/collectors/telegram';
import { syncXAnalytics } from '@/lib/collectors/x';
import { syncTikTokAnalytics } from '@/lib/collectors/tiktok';
import { syncAllAnalytics } from '@/lib/collectors/sync';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // In a real app, you should verify the user's session here
  // For this MVP, we assume the user is authorized if they can reach this page
  // We'll use the CRON_SECRET to call the internal collectors

  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');

  try {
    let result;
    switch (platform) {
      case 'telegram':
        result = await syncTelegramAnalytics();
        break;
      case 'x':
        result = await syncXAnalytics();
        break;
      case 'tiktok':
        result = await syncTikTokAnalytics();
        break;
      case 'all':
        result = await syncAllAnalytics();
        break;
      default:
        return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
