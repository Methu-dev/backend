const Joi = require("joi");
const { customError } = require("../helpers/customErorr");

const cartValidationSchema = Joi.object(
  {
    user: Joi.string()
      .optional()
      .allow(null, "")
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.pattern.base": "Invalid user ObjectId format",
      }),

    guestid: Joi.string().trim().optional().allow(null, "").messages({
      "string.base": "Guest ID must be a string",
    }),

    product: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .allow(null, "")
      .optional()
      .messages({
        "string.empty": "Product ID is required",
        "string.pattern.base": "Invalid Product ObjectId format",
      }),

    variant: Joi.string().allow(null, "").optional().messages({
      "string.base": "Variant must be a string",
    }),

    quantity: Joi.number().min(1).required().messages({
      "number.base": "Quantity must be a number",
      "number.min": "Quantity must be at least 1",
      "any.required": "Quantity is required",
    }),

    size: Joi.string().allow(null, "").optional().messages({
      "string.base": "Size must be a string",
    }),

    color: Joi.string().allow(null, "").optional().messages({
      "string.base": "Color must be a string",
    }),

    coupon: Joi.string().allow(null, "").optional().messages({
      "string.base": "Coupon must be a string",
    }),
  },
  { abortEarly: true }
).unknown(true);

// 🔹 Validate cart data
exports.validateCart = async (req) => {
  try {
    const value = await cartValidationSchema.validateAsync(req.body);

    return {
      user: value.user || null,
      guestid: value.guestid || null,
      product: value.product,
      variant: value.variant || null,
      quantity: value.quantity,
      size: value.size || null,
      color: value.color || null,
      coupon: value.coupon || null,
      totalPrice: value.totalPrice || 0,
      discountPrice: value.discountPrice || 0,
      afterApplyCouponPrice: value.afterApplyCouponPrice || 0,
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
