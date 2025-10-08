const Joi = require("joi");
const { customError } = require("../helpers/customErorr");

// Review validation schema
const reviewValidationSchema = Joi.object(
  {
    reviewerid: Joi.string().trim().required().messages({
      "string.base": "Reviewer ID must be a string",
      "string.empty": "Reviewer ID is required",
      "any.required": "Reviewer ID is required",
    }),

    comment: Joi.string().trim().min(3).max(300).required().messages({
      "string.base": "Comment must be a string",
      "string.empty": "Comment cannot be empty",
      "string.min": "Comment must be at least 3 characters long",
      "string.max": "Comment cannot exceed 300 characters",
      "any.required": "Comment is required",
    }),

    rating: Joi.number().min(0).max(5).required().messages({
      "number.base": "Rating must be a number",
      "number.min": "Rating cannot be less than 0",
      "number.max": "Rating cannot exceed 5",
      "any.required": "Rating is required",
    }),
  },
  { abortEarly: true }
).unknown(true);

// Validate user input
exports.reviewValidateUser = async (req) => {
  try {
    const value = await reviewValidationSchema.validateAsync(req.body);

    // ✅ image validation
    const image = req?.files?.image;
    const allowFormat = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

    if (image && image.length > 5) {
      throw new customError(401, "Maximum 5 images can be uploaded");
    }

    if (image && image.length > 0) {
      image.forEach((img) => {
        if (img.size > 5 * 1024 * 1024) {
          throw new customError(401, "Each image must be below 5MB");
        }
        if (!allowFormat.includes(img.mimetype)) {
          throw new customError(
            401,
            "Invalid image format. Use jpg, jpeg, png, or webp"
          );
        }
      });
    }

    return {
      ...value,
      image: image || [],
    };
  } catch (error) {
    if (!error.details) {
      throw new customError(401, error.message || error);
    } else {
      throw new customError(
        401,
        "Review Validation Error: " +
          error.details.map((item) => item.message).join(", ")
      );
    }
  }
};
