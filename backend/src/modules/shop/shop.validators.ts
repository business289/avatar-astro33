import Joi from "joi";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugField = Joi.string()
  .trim()
  .lowercase()
  .pattern(SLUG_PATTERN)
  .max(120)
  .messages({
    "string.empty": "Slug is required",
    "any.required": "Slug is required",
    "string.pattern.base":
      "Slug may only contain lowercase letters, numbers and single hyphens",
  });

// ── Categories ────────────────────────────────────────────────────────────

const categoryFields = {
  name: Joi.string().trim().max(150).messages({
    "string.empty": "Category name is required",
    "any.required": "Category name is required",
  }),
  slug: slugField,
  description: Joi.string().trim().max(1000).allow("", null),
  isActive: Joi.boolean(),
};

const createCategorySchema = Joi.object({
  name: categoryFields.name.required(),
  slug: categoryFields.slug.required(),
  description: categoryFields.description.optional(),
  isActive: categoryFields.isActive.optional(),
});

const updateCategorySchema = Joi.object({
  name: categoryFields.name.optional(),
  slug: categoryFields.slug.optional(),
  description: categoryFields.description.optional(),
  isActive: categoryFields.isActive.optional(),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });

const listCategoriesSchema = Joi.object({
  search: Joi.string().trim().max(150).allow("").optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// ── Products ──────────────────────────────────────────────────────────────

const benefitsField = Joi.array()
  .items(
    Joi.string().trim().min(1).max(200).messages({
      "string.empty": "Benefits cannot be blank",
    }),
  )
  .min(1)
  .max(20)
  .messages({
    "array.min": "Add at least one benefit",
    "any.required": "Add at least one benefit",
  });

const productFields = {
  categoryId: Joi.string().trim().messages({
    "string.empty": "Category is required",
    "any.required": "Category is required",
  }),
  name: Joi.string().trim().max(150).messages({
    "string.empty": "Product name is required",
    "any.required": "Product name is required",
  }),
  slug: slugField,
  price: Joi.number().integer().min(1).messages({
    "number.base": "Price must be a number",
    "number.min": "Price must be a positive number",
    "any.required": "Price is required",
  }),
  originalPrice: Joi.number().integer().min(1).allow(null).messages({
    "number.base": "Original price must be a number",
    "number.min": "Original price must be a positive number",
  }),
  description: Joi.string().trim().max(2000).messages({
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
  benefits: benefitsField,
  authenticity: Joi.string().trim().max(300).messages({
    "string.empty": "Authenticity is required",
    "any.required": "Authenticity is required",
  }),
  gradient: Joi.string().trim().max(300).allow("", null),
  isActive: Joi.boolean(),
};

const createProductSchema = Joi.object({
  categoryId: productFields.categoryId.required(),
  name: productFields.name.required(),
  slug: productFields.slug.required(),
  price: productFields.price.required(),
  originalPrice: productFields.originalPrice.optional(),
  description: productFields.description.required(),
  benefits: productFields.benefits.required(),
  authenticity: productFields.authenticity.required(),
  gradient: productFields.gradient.optional(),
  isActive: productFields.isActive.optional(),
}).custom((value, helpers) => {
  if (
    value.originalPrice !== undefined &&
    value.originalPrice !== null &&
    value.originalPrice <= value.price
  ) {
    return helpers.error("any.invalid", {
      message: "Original price must be greater than the selling price",
    });
  }
  return value;
}, "originalPrice > price").messages({
  "any.invalid": "Original price must be greater than the selling price",
});

const updateProductSchema = Joi.object({
  categoryId: productFields.categoryId.optional(),
  name: productFields.name.optional(),
  slug: productFields.slug.optional(),
  price: productFields.price.optional(),
  originalPrice: productFields.originalPrice.optional(),
  description: productFields.description.optional(),
  benefits: productFields.benefits.optional(),
  authenticity: productFields.authenticity.optional(),
  gradient: productFields.gradient.optional(),
  isActive: productFields.isActive.optional(),
})
  .min(1)
  .custom((value, helpers) => {
    if (
      value.originalPrice !== undefined &&
      value.originalPrice !== null &&
      value.price !== undefined &&
      value.originalPrice <= value.price
    ) {
      return helpers.error("any.invalid");
    }
    return value;
  }, "originalPrice > price")
  .messages({
    "object.min": "Provide at least one field to update",
    "any.invalid": "Original price must be greater than the selling price",
  });

const listProductsSchema = Joi.object({
  search: Joi.string().trim().max(150).allow("").optional(),
  categoryId: Joi.string().trim().allow("").optional(),
  isActive: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const validateCreateCategorySchema = (data: unknown) =>
  createCategorySchema.validate(data, { abortEarly: false });
export const validateUpdateCategorySchema = (data: unknown) =>
  updateCategorySchema.validate(data, { abortEarly: false });
export const validateListCategoriesSchema = (data: unknown) =>
  listCategoriesSchema.validate(data, { abortEarly: false });

export const validateCreateProductSchema = (data: unknown) =>
  createProductSchema.validate(data, { abortEarly: false });
export const validateUpdateProductSchema = (data: unknown) =>
  updateProductSchema.validate(data, { abortEarly: false });
export const validateListProductsSchema = (data: unknown) =>
  listProductsSchema.validate(data, { abortEarly: false });
