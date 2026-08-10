import { Router } from "express";
import { auth } from "@/middleware/authMiddleware.js";
import * as adminController from "./admin.controller.js";

const router = Router();

// All admin routes require ADMIN (SUPERADMIN included via middleware hierarchy)
router.use(auth("ADMIN"));

router.get("/dashboard", adminController.getDashboard);

export default router;
