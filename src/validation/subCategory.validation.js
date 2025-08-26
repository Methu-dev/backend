const Joi = require("joi");
const { customError } = require("../helpers/customErorr");

// 🔹 SubCategory Joi Validation Schema
const subCategoryValidationSchema = Joi.object(
  {
    name: Joi.string().trim().min(2).max(50).required().messages({
      "string.empty": "Name cannot be empty.",
      "string.min": "Name must be at least 2 characters long.",
      "string.max": "Name cannot be longer than 50 characters.",
      "any.required": "Name is required.",
    }),
    category: Joi.string().trim().required().messages({
      "string.empty": "Category ID cannot be empty.",
      "any.required": "Category is required.",
    }),
   
  },
  { abortEarly: true }
).unknown(true);

// 🔹 Validate SubCategory User Input
exports.subCategoryValidateUser = async (req) => {
  try {
    const value = await subCategoryValidationSchema.validateAsync(req.body);

    return value;
  } catch (error) {
    console.log(error.details.map((item)=>item.message, "error"))
    throw new customError(
      401,
      `${error.details.map((item) => item.message)}`
    );
  }
};
