import { Request, Response } from "express";
import { sendResponse } from "@/utils/responseUtils.js";
import STATUS_CODES from "@/utils/statusCodes.js";
import ShopService from "./shop.service.js";
import type { UploadFile } from "./shop.types.js";
import {
  validateCreateCategorySchema,
  validateCreateProductSchema,
  validateListCategoriesSchema,
  validateListProductsSchema,
  validateUpdateCategorySchema,
  validateUpdateProductSchema,
} from "./shop.validators.js";

const shopService = new ShopService();

const fail = (res: Response, error: any) =>
  sendResponse(
    res,
    false,
    null,
    error.message,
    error.statusCode ?? STATUS_CODES.SERVER_ERROR,
  );

// ── Categories ────────────────────────────────────────────────────────────

export const listCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = validateListCategoriesSchema(req.query);
    if (error) {
      sendResponse(res, false, null, error.message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    const data = await shopService.listCategories(value);
    sendResponse(res, true, data, "Categories loaded successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const listAllActiveCategories = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = await shopService.listAllActiveCategories();
    sendResponse(res, true, data, "Categories loaded successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const getCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = await shopService.getCategoryById(req.params.id);
    sendResponse(res, true, data, "Category loaded successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = validateCreateCategorySchema(req.body);
    if (error) {
      sendResponse(res, false, null, error.message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    const data = await shopService.createCategory(value);
    sendResponse(
      res,
      true,
      data,
      "Category created successfully",
      STATUS_CODES.CREATED,
    );
  } catch (error: any) {
    fail(res, error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = validateUpdateCategorySchema(req.body);
    if (error) {
      sendResponse(res, false, null, error.message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    const data = await shopService.updateCategory(req.params.id, value);
    sendResponse(res, true, data, "Category updated successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await shopService.deleteCategory(req.params.id);
    sendResponse(res, true, null, "Category deleted successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const setCategoryImage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const file = req.file as UploadFile | undefined;
    if (!file) {
      sendResponse(
        res,
        false,
        null,
        "Select an image to upload",
        STATUS_CODES.BAD_REQUEST,
      );
      return;
    }

    const data = await shopService.setCategoryImage(req.params.id, file);
    sendResponse(res, true, data, "Category image updated successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

// ── Products ──────────────────────────────────────────────────────────────

export const listProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = validateListProductsSchema(req.query);
    if (error) {
      sendResponse(res, false, null, error.message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    const data = await shopService.listProducts({
      ...value,
      categoryId: value.categoryId || undefined,
    });
    sendResponse(res, true, data, "Products loaded successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = await shopService.getProductById(req.params.id);
    sendResponse(res, true, data, "Product loaded successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = validateCreateProductSchema(req.body);
    if (error) {
      sendResponse(res, false, null, error.message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    const data = await shopService.createProduct(value);
    sendResponse(
      res,
      true,
      data,
      "Product created successfully",
      STATUS_CODES.CREATED,
    );
  } catch (error: any) {
    fail(res, error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = validateUpdateProductSchema(req.body);
    if (error) {
      sendResponse(res, false, null, error.message, STATUS_CODES.BAD_REQUEST);
      return;
    }

    const data = await shopService.updateProduct(req.params.id, value);
    sendResponse(res, true, data, "Product updated successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await shopService.deleteProduct(req.params.id);
    sendResponse(res, true, null, "Product deleted successfully");
  } catch (error: any) {
    fail(res, error);
  }
};

export const setProductImage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const file = req.file as UploadFile | undefined;
    if (!file) {
      sendResponse(
        res,
        false,
        null,
        "Select an image to upload",
        STATUS_CODES.BAD_REQUEST,
      );
      return;
    }

    const data = await shopService.setProductImage(req.params.id, file);
    sendResponse(res, true, data, "Product image updated successfully");
  } catch (error: any) {
    fail(res, error);
  }
};
