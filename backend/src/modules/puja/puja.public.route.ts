import { Router } from "express";
import * as pujaController from "./puja.controller.js";

// Mounted at /api/temples. Read-only and unauthenticated — writes stay behind
// the admin router, which applies auth("ADMIN").
const router = Router();

router.get("/", pujaController.listPublicTemples);
router.get("/:slug", pujaController.getPublicTempleBySlug);

export default router;
