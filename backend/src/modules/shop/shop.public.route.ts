import { Router } from "express";
import * as shopController from "./shop.controller.js";

// Mounted at /api/shop. Read-only and unauthenticated — writes stay behind
// the admin router, which applies auth("ADMIN").
const router = Router();

router.get("/categories", shopController.listPublicCategories);
router.get("/products", shopController.listPublicProducts);
router.get("/products/:slug", shopController.getPublicProductBySlug);

export default router;
