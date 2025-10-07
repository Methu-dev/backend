const Joi = require("joi");
const { customError } = require("../helpers/customErorr");

const variantValidationSchema = Joi.object(
  {
    variantName: Joi.string().trim().min(2).max(50).required().messages({
      "string.empty": "Variant name cannot be empty.",
      "string.min": "Variant name must be at least 2 characters long.",
      "string.max": "Variant name cannot be longer than 50 characters.",
      "any.required": "Variant name is required.",
    }),

    product: Joi.string().trim().required().messages({
      "string.empty": "Product ID is required.",
      "any.required": "Product field is required.",
    }),

    sku: Joi.string().trim().required().messages({
      "string.empty": "SKU cannot be empty.",
      "any.required": "SKU is required.",
    }),

    barCode: Joi.string().allow("", null),
    qrCode: Joi.string().allow("", null),

    size: Joi.array().items(Joi.string().trim()).messages({
      "array.includes": "Each size must be a string.",
    }),

    colorList: Joi.array().items(Joi.string().trim()).messages({
      "array.includes": "Each color must be a string.",
    }),

    stockVariant: Joi.number().min(0).default(0).messages({
      "number.base": "Stock variant must be a number.",
      "number.min": "Stock variant cannot be negative.",
    }),

    warehouseLocation: Joi.string().allow("", null),

    alertVariantStock: Joi.number().min(0).default(0).messages({
      "number.base": "Alert variant stock must be a number.",
    }),

    purchasePrice: Joi.number().min(100).required().messages({
      "number.base": "Purchase price must be a number.",
      "number.min": "Purchase price must be at least 100.",
      "any.required": "Purchase price is required.",
    }),

    retailPrice: Joi.number().min(0).required().messages({
      "number.base": "Retail price must be a number.",
      "any.required": "Retail price is required.",
    }),

    wholeSalePrice: Joi.number().min(0).optional().messages({
      "number.base": "Wholesale price must be a number.",
    }),

    stockAlert: Joi.boolean().default(false),
    instock: Joi.boolean().default(true),
    isActive: Joi.boolean().default(true),
  },
  { abortEarly: true }
).unknown(true);

// Validation Function
exports.variantValidateUser = async (req) => {
  try {
    const value = await variantValidationSchema.validateAsync(req.body);

    // image validation
    const image = req?.files?.image;
    const allowFormat = ["image/jpg", "image/png", "image/jpeg", "image/webp"];

    if (image && image.length > 5) {
      throw new customError(401, "Maximum 5 images can be uploaded.");
    }

    if (image && image.length > 0) {
      image.forEach((img) => {
        if (img.size > 5 * 1024 * 1024) {
          throw new customError(401, "Each image must be below 5MB.");
        }
        if (!allowFormat.includes(img.mimetype)) {
          throw new customError(
            401,
            "Invalid image format. Use jpg, jpeg, png or webp."
          );
        }
      });
    }

    return { ...value, image: image || [] };
  } catch (error) {
    if (error.data == null) {
      throw new customError(401, error.message || error);
    } else {
      throw new customError(
        401,
        "Variant Validation Error: " +
          error.details.map((err) => err.message).join(", ")
      );
    }
  }
};
