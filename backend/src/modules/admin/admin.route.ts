import { Router } from "express";
import { auth } from "@/middleware/authMiddleware.js";
import * as adminController from "./admin.controller.js";
import pujaRoutes from "@/modules/puja/puja.route.js";

const router = Router();

// All admin routes require ADMIN (SUPERADMIN included via middleware hierarchy)
router.use(auth("ADMIN"));

router.get("/dashboard", adminController.getDashboard);

// Temple / Puja content management
router.use("/puja", pujaRoutes);

export default router;
