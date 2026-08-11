import { Request, Response } from "express";
import { sendResponse } from "@/utils/responseUtils.js";
import STATUS_CODES from "@/utils/statusCodes.js";
import ChadhawaService from "./chadhawa.service.js";
import {
  validateCreateChadhawaSchema,
  validateListChadhawasSchema,
  validateUpdateChadhawaSchema,
} from "./chadhawa.validators.js";

const chadhawaService = new ChadhawaService();

const fail = (res: Response, error: any) =>
  sendResponse(
    res,
    false,
    null,
    error.message,
    error.statusCode ?? STATUS_CODES.SERVER_ERROR,
  );

export const listChadhawas = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = validateListChadhawasSchema(req.query);
    if (error) {
      sendResponse(res, false, null, error.message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    const data = await chadhawaService.listChadhawas(value);
    sendResponse(res, true, data, "Chadhawa offerings loaded successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

/** Same listing, with the temple taken from the path instead of the query. */
export const listChadhawasByTemple = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = validateListChadhawasSchema({
      ...req.query,
      templeId: req.params.templeId,
    });
    if (error) {
      sendResponse(res, false, null, error.message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    const data = await chadhawaService.listChadhawas(value);
    sendResponse(res, true, data, "Chadhawa offerings loaded successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const getChadhawa = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = await chadhawaService.getChadhawaById(req.params.id);
    sendResponse(res, true, data, "Chadhawa offering loaded successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const createChadhawa = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = validateCreateChadhawaSchema(req.body);
    if (error) {
      sendResponse(res, false, null, error.message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    const data = await chadhawaService.createChadhawa(value);
    sendResponse(
      res,
      true,
      data,
      "Chadhawa offering created successfully",
      STATUS_CODES.CREATED,
    );
  } catch (error: any) {
    fail(res, error);
  }
};

export const updateChadhawa = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = validateUpdateChadhawaSchema(req.body);
    if (error) {
      sendResponse(res, false, null, error.message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    const data = await chadhawaService.updateChadhawa(req.params.id, value);
    sendResponse(res, true, data, "Chadhawa offering updated successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const deleteChadhawa = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await chadhawaService.deleteChadhawa(req.params.id);
    sendResponse(res, true, null, "Chadhawa offering deleted successfully");
  } catch (error: any) {
    fail(res, error);
  }
};
