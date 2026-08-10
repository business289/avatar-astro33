import { Request, Response } from "express";
import { sendResponse } from "@/utils/responseUtils.js";
import STATUS_CODES from "@/utils/statusCodes.js";
import PujaService from "./puja.service.js";
import type { UploadFile } from "./puja.types.js";
import {
  validateCreatePujaSchema,
  validateCreateTempleSchema,
  validateListTemplesSchema,
  validateUpdatePujaSchema,
  validateUpdateTempleSchema,
} from "./puja.validators.js";

const pujaService = new PujaService();

const fail = (res: Response, error: any) =>
  sendResponse(
    res,
    false,
    null,
    error.message,
    error.statusCode ?? STATUS_CODES.SERVER_ERROR,
  );

// ── Public (unauthenticated) ────────────────────────────────────────────────

export const listPublicTemples = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = await pujaService.listPublicTemples();
    sendResponse(res, true, data, "Temples loaded successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const getPublicTempleBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = await pujaService.getPublicTempleBySlug(req.params.slug);
    sendResponse(res, true, data, "Temple loaded successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

// ── Temples (admin) ─────────────────────────────────────────────────────────

export const listTemples = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = validateListTemplesSchema(req.query);
    if (error) {
      sendResponse(res, false, null, error.message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    const data = await pujaService.listTemples(value);
    sendResponse(res, true, data, "Temples loaded successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const getTemple = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await pujaService.getTempleById(req.params.id);
    sendResponse(res, true, data, "Temple loaded successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const createTemple = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = validateCreateTempleSchema(req.body);
    if (error) {
      sendResponse(res, false, null, error.message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    const data = await pujaService.createTemple(value);
    sendResponse(res, true, data, "Temple created successfully", STATUS_CODES.CREATED);
  } catch (error: any) {
    fail(res, error);
  }
};

export const updateTemple = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = validateUpdateTempleSchema(req.body);
    if (error) {
      sendResponse(res, false, null, error.message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    const data = await pujaService.updateTemple(req.params.id, value);
    sendResponse(res, true, data, "Temple updated successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const deleteTemple = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await pujaService.deleteTemple(req.params.id);
    const message = result.orphanedImages.length
      ? `Temple deleted, but ${result.orphanedImages.length} image(s) could not be removed from Cloudinary`
      : "Temple deleted successfully";

    sendResponse(res, true, result, message);
  } catch (error: any) {
    fail(res, error);
  }
};

// ── Images ──────────────────────────────────────────────────────────────────

export const addTempleImages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const files = (req.files as UploadFile[] | undefined) ?? [];
    const data = await pujaService.addTempleImages(req.params.id, files);
    sendResponse(
      res,
      true,
      data,
      `${data.length} image(s) uploaded successfully`,
      STATUS_CODES.CREATED,
    );
  } catch (error: any) {
    fail(res, error);
  }
};

export const deleteTempleImage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await pujaService.deleteTempleImage(req.params.imageId);
    sendResponse(res, true, null, "Image deleted successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

// ── Pujas ───────────────────────────────────────────────────────────────────

export const listPujas = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await pujaService.listPujas(req.params.id);
    sendResponse(res, true, data, "Pujas loaded successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const createPuja = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = validateCreatePujaSchema(req.body);
    if (error) {
      sendResponse(res, false, null, error.message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    const data = await pujaService.createPuja(req.params.id, value);
    sendResponse(res, true, data, "Puja created successfully", STATUS_CODES.CREATED);
  } catch (error: any) {
    fail(res, error);
  }
};

export const updatePuja = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = validateUpdatePujaSchema(req.body);
    if (error) {
      sendResponse(res, false, null, error.message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    const data = await pujaService.updatePuja(req.params.pujaId, value);
    sendResponse(res, true, data, "Puja updated successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const deletePuja = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await pujaService.deletePuja(req.params.pujaId);
    sendResponse(res, true, null, "Puja deleted successfully");
  } catch (error: any) {
    fail(res, error);
  }
};
