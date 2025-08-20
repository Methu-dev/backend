const { customError } = require("../helpers/customErorr");
const { asyncHandler } = require("../utils/asyncHandler");
const user = require("../models/user.model");
const { apiRespons } = require("../utils/apiRespons");
const { categoryValidateUser } = require("../validation/category.validation");


exports.createCategory = asyncHandler(async(req, res)=>{
  const value = await categoryValidateUser(req)
  console.log(value)
})