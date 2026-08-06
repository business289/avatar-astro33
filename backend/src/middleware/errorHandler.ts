import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/responseUtils.js';
import STATUS_CODES from '../utils/statusCodes.js';

export const errorHandler = async (err: any, _req: Request, res: Response, _next: NextFunction): Promise<void> => {
  console.error("Error Handler Middleware:", err);
  const status = err.statusCode || STATUS_CODES.SERVER_ERROR;
  // Never send the error object itself — it carries the stack trace.
  sendResponse(res, false, null, err.message ?? "Internal Server Error", status);
};