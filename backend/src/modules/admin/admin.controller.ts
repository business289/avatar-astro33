import { Response } from "express";
import { sendResponse } from "@/utils/responseUtils.js";
import STATUS_CODES from "@/utils/statusCodes.js";
import type { AuthRequest } from "@/middleware/authMiddleware.js";
import AdminService from "./admin.services.js";

const adminService = new AdminService();

export const getDashboard = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendResponse(
        res,
        false,
        null,
        "Authentication required",
        STATUS_CODES.UNAUTHORIZED,
      );
      return;
    }

    const data = await adminService.getDashboard(userId);
    sendResponse(
      res,
      true,
      data,
      "Admin dashboard loaded successfully",
      STATUS_CODES.OK,
    );
  } catch (error: any) {
    sendResponse(
      res,
      false,
      null,
      error.message,
      error.statusCode ?? STATUS_CODES.SERVER_ERROR,
    );
  }
};
