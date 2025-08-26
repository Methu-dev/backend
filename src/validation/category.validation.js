const Joi = require("joi");
const { customError } = require("../helpers/customErorr");

const categoryValidationSchema = Joi.object(
  {
    name: Joi.string().trim().min(2).max(50).required().messages({
      "string.empty": "Name cannot be empty.",
      "string.min": "Name must be at least 2 characters long.",
      "string.max": "Name cannot be longer than 50 characters.",
      "any.required": "Name is required.",
    }),
  },
  { abortEarly: true }
).unknown(true);

// validate user information
exports.categoryValidateUser = async (req) => {
  try {
    const value = await categoryValidationSchema.validateAsync(req.body);
    // sanitize image
    const image = req?.files?.image[0];
    allowFormat = ["image/jpg", "image/png", "image/jpeg", "image/webp"];
    if (image?.length > 1) {
      throw new customError(401, "Image must be sungle");
    }
    if (image?.size > 5 * 1024 *1024) {
      throw new customError(401, "image size upload below 2mb");
    }
    if (!allowFormat.includes(image?.mimetype)) {
      throw new customError(
        401,
        "image format not accept try image/jpg, png, webp, jpeg"
      );
    }
    return {name: value.name, image: req?.files?.image[0]}; 
  } catch (error) {
    if (error.data == null) {
      throw new customError(401, error);
    } else {
      console.log("error", error?.details?.map((item)=>item.message))
      throw new customError(
        401,
        "User Validation Error " +
          error.details.map((err) => err.message).join(", ")
      );
    }
  }
};
