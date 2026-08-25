import Joi from "joi";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugField = Joi.string().trim().lowercase().pattern(SLUG_PATTERN).max(120).messages({
  "string.empty": "Slug is required",
  "any.required": "Slug is required",
  "string.pattern.base":
    "Slug may only contain lowercase letters, numbers and single hyphens",
});

const templeFields = {
  name: Joi.string().trim().max(150).messages({
    "string.empty": "Temple name is required",
    "any.required": "Temple name is required",
  }),
  slug: slugField,
  location: Joi.string().trim().max(150).messages({
    "string.empty": "Location is required",
    "any.required": "Location is required",
  }),
  state: Joi.string().trim().max(100).messages({
    "string.empty": "State is required",
    "any.required": "State is required",
  }),
  deity: Joi.string().trim().max(150).messages({
    "string.empty": "Deity is required",
    "any.required": "Deity is required",
  }),
  description: Joi.string().trim().max(2000).messages({
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
  priceFrom: Joi.number().integer().min(0).messages({
    "number.base": "Starting price must be a number",
    "number.min": "Starting price cannot be negative",
    "any.required": "Starting price is required",
  }),
  gradient: Joi.string().trim().max(300).allow("", null),
};

const createTempleSchema = Joi.object({
  name: templeFields.name.required(),
  slug: templeFields.slug.required(),
  location: templeFields.location.required(),
  state: templeFields.state.required(),
  deity: templeFields.deity.required(),
  description: templeFields.description.required(),
  priceFrom: templeFields.priceFrom.required(),
  gradient: templeFields.gradient.optional(),
});

const updateTempleSchema = Joi.object({
  name: templeFields.name.optional(),
  slug: templeFields.slug.optional(),
  location: templeFields.location.optional(),
  state: templeFields.state.optional(),
  deity: templeFields.deity.optional(),
  description: templeFields.description.optional(),
  priceFrom: templeFields.priceFrom.optional(),
  gradient: templeFields.gradient.optional(),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });

const listTemplesSchema = Joi.object({
  search: Joi.string().trim().max(150).allow("").optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

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

const pujaFields = {
  name: Joi.string().trim().max(150).messages({
    "string.empty": "Puja name is required",
    "any.required": "Puja name is required",
  }),
  price: Joi.number().integer().min(0).messages({
    "number.base": "Price must be a number",
    "number.min": "Price cannot be negative",
    "any.required": "Price is required",
  }),
  duration: Joi.string().trim().max(60).messages({
    "string.empty": "Duration is required",
    "any.required": "Duration is required",
  }),
};

const createPujaSchema = Joi.object({
  name: pujaFields.name.required(),
  price: pujaFields.price.required(),
  duration: pujaFields.duration.required(),
  benefits: benefitsField.required(),
});

const updatePujaSchema = Joi.object({
  name: pujaFields.name.optional(),
  price: pujaFields.price.optional(),
  duration: pujaFields.duration.optional(),
  benefits: benefitsField.optional(),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });

export const validateCreateTempleSchema = (data: unknown) =>
  createTempleSchema.validate(data, { abortEarly: false });
export const validateUpdateTempleSchema = (data: unknown) =>
  updateTempleSchema.validate(data, { abortEarly: false });
export const validateListTemplesSchema = (data: unknown) =>
  listTemplesSchema.validate(data, { abortEarly: false });
export const validateCreatePujaSchema = (data: unknown) =>
  createPujaSchema.validate(data, { abortEarly: false });
export const validateUpdatePujaSchema = (data: unknown) =>
  updatePujaSchema.validate(data, { abortEarly: false });
