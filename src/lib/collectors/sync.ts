import { syncTelegramAnalytics } from './telegram';
import { syncXAnalytics } from './x';
import { syncTikTokAnalytics } from './tiktok';

export async function syncAllAnalytics() {
  const [telegram, x, tiktok] = await Promise.all([
    syncTelegramAnalytics(),
    syncXAnalytics(),
    syncTikTokAnalytics()
  ]);

  return {
    telegram,
    x,
    tiktok,
    timestamp: new Date().toISOString()
  };
}
