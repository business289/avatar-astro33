import Temple from '../models/Temple';
import { checkChannelLive } from './youtubeLiveService';

let refreshTimer: NodeJS.Timeout | null = null;

/**
 * Re-checks every temple's live status against YouTube and persists the
 * result. checkChannelLive() only ever returns a video that's confirmed
 * live on the configured channel and embeddable, so the API never hands
 * out a videoId that would render as a broken/unavailable player.
 */
export async function refreshAllTemples(): Promise<void> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn('[darshan] YOUTUBE_API_KEY not set — skipping live status refresh');
    return;
  }

  const temples = await Temple.find({ youtubeChannelId: { $ne: '' } });
  if (temples.length === 0) {
    console.warn('[darshan] No temples with a configured youtubeChannelId — nothing to refresh');
    return;
  }

  for (const temple of temples) {
    try {
      const { isLive, videoId } = await checkChannelLive(temple.youtubeChannelId, apiKey);

      temple.isLive = isLive;
      temple.currentLiveVideoId = videoId;
      temple.lastCheckedAt = new Date();
      await temple.save();
    } catch (err: any) {
      const status = err?.response?.status;
      const reason = err?.response?.data?.error?.errors?.[0]?.reason;
      console.error(`[darshan] Failed to refresh "${temple.slug}":`, status, reason || err.message);
      // Leave the temple's previous stored status untouched on a transient
      // API failure (e.g. quota exceeded) rather than flipping it offline.
      temple.lastCheckedAt = new Date();
      await temple.save();
    }
  }
}

/** Runs an immediate refresh, then repeats on an interval. Call once at server startup. */
export function startDarshanRefreshLoop(): void {
  const minutes = Number(process.env.DARSHAN_REFRESH_INTERVAL_MINUTES) || 15;
  const intervalMs = minutes * 60 * 1000;

  refreshAllTemples().catch((err) => console.error('[darshan] Initial refresh failed:', err.message));

  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    refreshAllTemples().catch((err) => console.error('[darshan] Scheduled refresh failed:', err.message));
  }, intervalMs);

  console.log(`✓ Darshan live-status refresh loop started (every ${minutes} min)`);
}

export function stopDarshanRefreshLoop(): void {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}
