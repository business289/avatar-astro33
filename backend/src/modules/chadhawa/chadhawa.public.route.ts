import { Router } from "express";
import * as chadhawaController from "./chadhawa.controller.js";

// Mounted at /api/chadhawa. Read-only and unauthenticated — writes stay behind
// the admin router, which applies auth("ADMIN").
const router = Router();

router.get("/", chadhawaController.listPublicChadhawaTemples);
router.get("/:slug", chadhawaController.getPublicChadhawaTempleBySlug);

export default router;
