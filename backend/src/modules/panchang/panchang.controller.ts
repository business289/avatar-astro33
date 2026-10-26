import type { Request, Response } from "express";
import { sendResponse } from "../../utils/responseUtils.js";
import STATUS_CODES from "../../utils/statusCodes.js";
import { getPanchang } from "./panchang.service.js";
import { searchLocations } from "./location.service.js";
import { PanchangError } from "./panchang.types.js";

const asString = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

function fail(res: Response, err: unknown) {
  if (err instanceof PanchangError) {
    return sendResponse(res, false, { code: err.code }, err.message, err.statusCode);
  }
  console.error("Panchang unexpected error:", err);
  return sendResponse(res, false, { code: "CALCULATION_FAILED" }, "Something went wrong.", STATUS_CODES.SERVER_ERROR);
}

export const getDailyPanchang = (req: Request, res: Response) => {
  try {
    const data = getPanchang({
      date: asString(req.query.date),
      lat: asString(req.query.lat),
      lon: asString(req.query.lon),
      name: asString(req.query.name),
    });
    return sendResponse(res, true, data, "Panchang calculated");
  } catch (err) {
    return fail(res, err);
  }
};

export const searchLocation = async (req: Request, res: Response) => {
  try {
    const data = await searchLocations(req.query.q);
    return sendResponse(res, true, data, "Locations found");
  } catch (err) {
    return fail(res, err);
  }
};
