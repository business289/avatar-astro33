import axios from 'axios';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface LiveCheckResult {
  isLive: boolean;
  videoId: string | null;
}

/**
 * Checks whether a channel is currently broadcasting live, via
 * search.list?eventType=live (the standard way to detect this with the
 * Data API — there is no cheaper endpoint for "is this channel live").
 * Costs 100 quota units per call, which is why callers should only use
 * this from the periodic background refresh, never per-request.
 *
 * A channel can have more than one video simultaneously marked live (e.g. a
 * stale/never-ended broadcast alongside the actual current one), so search
 * results alone aren't trustworthy — we fetch full details for every
 * candidate (1 extra quota unit total, one batched call) and only accept
 * ones that are confirmed live on the requested channel and embeddable,
 * preferring whichever actually started most recently.
 */
export async function checkChannelLive(channelId: string, apiKey: string): Promise<LiveCheckResult> {
  if (!channelId) return { isLive: false, videoId: null };

  const { data: searchData } = await axios.get(`${YOUTUBE_API_BASE}/search`, {
    params: {
      key: apiKey,
      channelId,
      eventType: 'live',
      type: 'video',
      part: 'id',
      order: 'date',
      maxResults: 5,
    },
  });

  const candidateIds: string[] = (searchData?.items ?? [])
    .map((item: any) => item?.id?.videoId)
    .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0);

  if (candidateIds.length === 0) return { isLive: false, videoId: null };

  const { data: videosData } = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
    params: {
      key: apiKey,
      id: candidateIds.join(','),
      part: 'snippet,liveStreamingDetails,status',
    },
  });

  const verifiedLive = (videosData?.items ?? []).filter(
    (item: any) =>
      item?.snippet?.channelId === channelId &&
      item?.snippet?.liveBroadcastContent === 'live' &&
      item?.status?.embeddable === true
  );

  if (verifiedLive.length === 0) return { isLive: false, videoId: null };

  verifiedLive.sort((a: any, b: any) => {
    const aTime = new Date(a?.liveStreamingDetails?.actualStartTime ?? 0).getTime();
    const bTime = new Date(b?.liveStreamingDetails?.actualStartTime ?? 0).getTime();
    return bTime - aTime; // newest actualStartTime first
  });

  return { isLive: true, videoId: verifiedLive[0].id };
}

/**
 * Confirms a video can actually be embedded before we ever hand its ID to
 * the frontend player — cheap call (1 unit) via videos.list?part=status.
 */
export async function checkVideoEmbeddable(videoId: string, apiKey: string): Promise<boolean> {
  const { data } = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
    params: {
      key: apiKey,
      id: videoId,
      part: 'status',
    },
  });

  const item = data?.items?.[0];
  if (!item) return false; // video not found / removed
  return item.status?.embeddable !== false;
}
