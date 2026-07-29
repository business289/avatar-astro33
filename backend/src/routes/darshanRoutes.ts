import { Router } from 'express';
import { listTemples, getTempleBySlug } from '../controllers/darshanController.js';

const router = Router();

/**
 * GET /api/darshan/temples
 * List all temples with their stored live status (public)
 */
router.get('/temples', listTemples);

/**
 * GET /api/darshan/temples/:slug
 * Single temple's stored live status (public)
 */
router.get('/temples/:slug', getTempleBySlug);

export default router;
