const Joi = require("joi");
const { customError } = require("../helpers/customErorr");

// 🔹 Discount Joi Validation Schema
const discountValidationSchema = Joi.object(
  {
    discountValidFrom: Joi.date().required().messages({
      "date.base": "Discount start date must be a valid date.",
      "any.required": "Discount start date is required.",
    }),

    discountValidTo: Joi.date()
      .greater(Joi.ref("discountValidFrom"))
      .required()
      .messages({
        "date.base": "Discount end date must be a valid date.",
        "date.greater": "Discount end date must be greater than start date.",
        "any.required": "Discount end date is required.",
      }),

    discountName: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Discount name cannot be empty.",
      "string.min": "Discount name must be at least 2 characters long.",
      "string.max": "Discount name cannot be longer than 100 characters.",
      "any.required": "Discount name is required.",
    }),

    discountType: Joi.string().valid("tk", "percentance").required().messages({
      "any.only": "Discount type must be either 'tk' or 'percentance'.",
      "any.required": "Discount type is required.",
    }),

    discountValueByAmount: Joi.number().min(0).messages({
      "number.base": "Discount amount must be a number.",
      "number.min": "Discount amount cannot be negative.",
    }),

    discountValueByPercentance: Joi.number().min(0).max(100).messages({
      "number.base": "Discount percentage must be a number.",
      "number.min": "Discount percentage cannot be negative.",
      "number.max": "Discount percentage cannot exceed 100.",
    }),

    discountPlan: Joi.string()
      .valid("category", "subCategory", "product")
      .required()
      .messages({
        "any.only":
          "Discount plan must be 'category', 'subCategory', or 'product'.",
        "any.required": "Discount plan is required.",
      }),

    category: Joi.string().trim().optional().allow(null),
    subCategory: Joi.string().trim().optional().allow(null),
    product: Joi.string().trim().optional().allow(null),

    isActive: Joi.boolean().default(true),
  },
  { abortEarly: true }
).unknown(true);

// 🔹 Validate Discount User Input
exports.discountValidateUser = async (req) => {
  try {
    const value = await discountValidationSchema.validateAsync(req.body);

    // Example: if you want to handle a file/image for discount banner
    const image = req?.files?.image?.[0];
    const allowFormat = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

    if (req?.files?.image?.length > 1) {
      throw new customError(401, "Image must be single");
    }
    if (image?.size > 2 * 1024 * 1024) {
      throw new customError(401, "Image size must be below 2MB");
    }
    if (image && !allowFormat.includes(image?.mimetype)) {
      throw new customError(
        401,
        "Image format not accepted. Try jpg, jpeg, png, or webp"
      );
    }

    return {
      ...value,
      image: image || null,
    };
  } catch (error) {
    if (!error.details) {
      throw new customError(401, error.message || error);
    } else {
      throw new customError(
        401,
        error.details.map((item) => item.message).join(", ")
      );
    }
  }
};
