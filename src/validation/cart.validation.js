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

    guestid: Joi.string().trim().optional().messages({
      "string.base": "Guest ID must be a string",
    }),

    items: Joi.array()
      .items(
        Joi.object({
          product: Joi.string()
            .required()
            .allow(null, "")
            .pattern(/^[0-9a-fA-F]{24}$/)
            .messages({
              "string.pattern.base": "Invalid product ObjectId format",
              "any.required": "Product ID is required",
            }),

          variant: Joi.string()
            .optional()
            .allow(null, "")
            .pattern(/^[0-9a-fA-F]{24}$/)
            .messages({
              "string.pattern.base": "Invalid variant ObjectId format",
            }),

          quantity: Joi.number().integer().min(1).required().messages({
            "number.base": "Quantity must be a number",
            "number.min": "Quantity must be at least 1",
            "any.required": "Quantity is required",
          }),

          size: Joi.string().required().messages({
            "string.base": "Size must be a string",
            "string.empty": "Size is required",
            "any.required": "Size is required",
          }),

          color: Joi.string().required().messages({
            "string.base": "Color must be a string",
            "string.empty": "Color is required",
            "any.required": "Color is required",
          }),
        })
      )
      .required()
      .messages({
        "array.base": "Items must be an array",
        "array.min": "At least one item is required",
        "any.required": "Items field is required",
      }),

    coupon: Joi.string()
      .optional()
      .messages({
        "string.pattern.base": "Invalid coupon ObjectId format",
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
      items: value.items,
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
