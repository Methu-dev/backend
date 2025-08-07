const { customError } = require('../helpers/customErorr');
const user = require('../models/user.model')
const { asyncHandler } = require('../utils/asyncHandler')
exports.registation = asyncHandler((req, res)=>{
    throw new customError(401, "email missing")
})