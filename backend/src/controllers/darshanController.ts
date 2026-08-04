import { Request, Response } from 'express';
import Temple from '../models/Temple.js';

const toPublicShape = (temple: InstanceType<typeof Temple>) => ({
  name: temple.name,
  slug: temple.slug,
  youtubeChannelId: temple.youtubeChannelId,
  currentLiveVideoId: temple.currentLiveVideoId,
  isLive: temple.isLive,
  lastCheckedAt: temple.lastCheckedAt,
});

/**
 * List every temple's stored live status.
 * GET /api/darshan/temples
 */
export const listTemples = async (_req: Request, res: Response): Promise<void> => {
  try {
    const temples = await Temple.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: temples.map(toPublicShape) });
  } catch (error: any) {
    console.error('Error listing darshan temples:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch temples' });
  }
};

/**
 * Single temple's stored live status.
 * GET /api/darshan/temples/:slug
 */
export const getTempleBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const temple = await Temple.findOne({ slug });

    if (!temple) {
      res.status(404).json({ success: false, error: 'Temple not found' });
      return;
    }

    res.status(200).json({ success: true, data: toPublicShape(temple) });
  } catch (error: any) {
    console.error('Error fetching darshan temple:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch temple' });
  }
};
