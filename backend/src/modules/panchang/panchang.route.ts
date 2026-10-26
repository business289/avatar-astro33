import { Router } from "express";
import { rateLimit } from "../../utils/rateLimit.js";
import * as controller from "./panchang.controller.js";

// Mounted at /api/panchang. Public, read-only, no database.
const router = Router();

router.get("/", rateLimit(60, 60_000), controller.getDailyPanchang);
router.get("/locations", rateLimit(30, 60_000), controller.searchLocation);

export default router;
