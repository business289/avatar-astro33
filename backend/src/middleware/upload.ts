import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import { sendResponse } from "@/utils/responseUtils.js";
import STATUS_CODES from "@/utils/statusCodes.js";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB per image
export const MAX_IMAGES_PER_REQUEST = 10;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

// Memory storage: buffers stream straight to Cloudinary, so nothing ever
// touches this server's disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_IMAGES_PER_REQUEST },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Only JPEG, PNG, WebP and AVIF images are allowed"));
      return;
    }
    cb(null, true);
  },
});

/**
 * Accepts up to MAX_IMAGES_PER_REQUEST files on the `images` field and
 * translates multer's own errors into this API's response envelope.
 */
export const uploadTempleImages = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload.array("images", MAX_IMAGES_PER_REQUEST)(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    let message = "Image upload failed";
    if (error instanceof multer.MulterError) {
      message =
        error.code === "LIMIT_FILE_SIZE"
          ? `Each image must be ${MAX_IMAGE_BYTES / (1024 * 1024)} MB or smaller`
          : error.code === "LIMIT_FILE_COUNT"
            ? `You can upload at most ${MAX_IMAGES_PER_REQUEST} images at a time`
            : error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    sendResponse(res, false, null, message, STATUS_CODES.BAD_REQUEST);
  });
};

export default upload;
