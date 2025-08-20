const Joi = require("joi");
const { customError } = require("../helpers/customErorr");
const userValidationSchema = Joi.object({
  email: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
    .message({
      "string.empty": "Email cannot be empty.",
      "string.trim": "Email cannot start or end with spaces.",
      "string.pattern.base":
        "Please enter a valid email address (e.g., example@mail.com).",
    }),
  phone: Joi.string()
    .trim()
    .empty()
    .pattern(/^(?:\+8801|8801|01)[3-9]\d{8}$/)
    .messages({
      "string.empty": "Phone number cannot be empty.",
      "string.pattern.base":
        "Please enter a valid Bangladeshi phone number (e.g., +88017XXXXXXXX).",
    }),
  password: Joi.string()
    .trim()
    .required()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .message({
      "string.empty": "Password cannot be empty.",
      "string.pattern.base":
        "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.",
      "any.required": "Password is required.",
    }),
},
{abortEarly: true}
).unknown(true)

// validate user information
const validateUser = async (req)=>{
  try {
    const value = await userValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    throw new customError(401, "User Validation Error" + error.details.map((err)=>err.message))
  }
}

module.exports = { validateUser };