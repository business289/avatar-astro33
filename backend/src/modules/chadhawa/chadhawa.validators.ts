import Joi from "joi";

const chadhawaFields = {
  templeId: Joi.string().trim().max(50).messages({
    "string.empty": "Temple is required",
    "any.required": "Temple is required",
  }),
  name: Joi.string().trim().max(150).messages({
    "string.empty": "Offering name is required",
    "any.required": "Offering name is required",
  }),
  description: Joi.string().trim().max(1000).messages({
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
  // Whole rupees, and strictly positive — a free offering is never intended.
  price: Joi.number().integer().greater(0).messages({
    "number.base": "Price must be a number",
    "number.greater": "Price must be greater than 0",
    "number.integer": "Price must be a whole number",
    "any.required": "Price is required",
  }),
  emoji: Joi.string().trim().max(16).allow("", null),
  isActive: Joi.boolean(),
  displayOrder: Joi.number().integer().min(0).max(9999).messages({
    "number.base": "Display order must be a number",
    "number.min": "Display order cannot be negative",
  }),
};

const createChadhawaSchema = Joi.object({
  templeId: chadhawaFields.templeId.required(),
  name: chadhawaFields.name.required(),
  description: chadhawaFields.description.required(),
  price: chadhawaFields.price.required(),
  emoji: chadhawaFields.emoji.optional(),
  isActive: chadhawaFields.isActive.optional(),
  displayOrder: chadhawaFields.displayOrder.optional(),
});

const updateChadhawaSchema = Joi.object({
  templeId: chadhawaFields.templeId.optional(),
  name: chadhawaFields.name.optional(),
  description: chadhawaFields.description.optional(),
  price: chadhawaFields.price.optional(),
  emoji: chadhawaFields.emoji.optional(),
  isActive: chadhawaFields.isActive.optional(),
  displayOrder: chadhawaFields.displayOrder.optional(),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });

const listChadhawasSchema = Joi.object({
  templeId: Joi.string().trim().max(50).allow("").optional(),
  search: Joi.string().trim().max(150).allow("").optional(),
  isActive: Joi.boolean().optional(),
  sortBy: Joi.string()
    .valid("displayOrder", "createdAt", "price", "name")
    .default("displayOrder"),
  sortOrder: Joi.string().valid("asc", "desc").default("asc"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const validateCreateChadhawaSchema = (data: unknown) =>
  createChadhawaSchema.validate(data, { abortEarly: false });
export const validateUpdateChadhawaSchema = (data: unknown) =>
  updateChadhawaSchema.validate(data, { abortEarly: false });
export const validateListChadhawasSchema = (data: unknown) =>
  listChadhawasSchema.validate(data, { abortEarly: false });
