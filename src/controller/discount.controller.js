const { customError } = require("../helpers/customErorr");
const { asyncHandler } = require("../utils/asyncHandler");
const { apiRespons } = require("../utils/apiRespons");
const discountModel = require("../models/discount.model");
const { discountValidateUser } = require("../validation/discount.validation");
const categoryModels = require("../models/cetegory.model") 
const subCategoryModel = require("../models/subCategory.model");
const NodeCache = require("node-cache");
const myCache = new NodeCache();

exports.creatDiscount = asyncHandler(async (req, res) => {
  const value = await discountValidateUser(req);

  const discount = await discountModel.create(value); // Add await here

  if (!discount) throw new customError(401, "discount create failed");

  if (value.discountPlan === "category" && value.category) {
    await categoryModels.findOneAndUpdate(
      { _id: value.category },
      { discount: discount._id }
    );
  }

  if (value.discountPlan === "subCategory" && value.subCategory) {
    await subCategoryModel.findOneAndUpdate(
      { _id: value.subCategory },
      { discount: discount._id }
    );
  }

  apiRespons.sendSuccess(res, 200, "create discount successful", discount);
});

// get all discount
exports.getAllDiscount = asyncHandler(async(req,res)=>{
    const value = myCache.get("discount");
    if(value == undefined){
        const discount = await discountModel.find();
        myCache.set("discount", JSON.stringify(discount), 1000)
        if(!discount || discount.length === 0){
            throw new customError(401, "discount not found")
        }
     return apiRespons.sendSuccess(res,200, "discount all successful", discount)
    }
    apiRespons.sendSuccess(res, 200, "all discount successful", JSON.parse(value))
})

// get single discount
exports.singleDiscount = asyncHandler(async(req, res)=>{
    const {slug} = req.params;
    if(!slug) throw new customError(401, "slug not found");
    const discount = await discountModel.findOne({slug: slug});
    if(!discount) throw new customError(401, "discount not found");
    apiRespons.sendSuccess(res, 200, "single discount successfully done", discount)
})

// update discount
exports.updateDiscount = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const validateDiscount = await discountValidateUser(req);

  const discount = await discountModel.findOne({ slug });
  if (!discount) throw new customError(404, "discount not found");

  // Reset old category discount
  if (discount.discountPlan === "category" && discount.category) {
    await categoryModels.findOneAndUpdate(
      { _id: discount.category },
      { discount: null }
    );
  }

  // Reset old sub-category discount
  if (discount.discountPlan === "subCategory" && discount.subCategory) {
    await subCategoryModel.findOneAndUpdate(
      { _id: discount.subCategory },
      { discount: null }
    );
  }

  // Update discount document
  Object.assign(discount, validateDiscount);

  // Save document to trigger pre("save") middleware (slug will auto-update)
  await discount.save();

  // Set new category discount
  if (discount.discountPlan === "category" && discount.category) {
    await categoryModels.findOneAndUpdate(
      { _id: discount.category },
      { discount: discount._id }
    );
  }

  // Set new sub-category discount
  if (discount.discountPlan === "subCategory" && discount.subCategory) {
    await subCategoryModel.findOneAndUpdate(
      { _id: discount.subCategory },
      { discount: discount._id }
    );
  }

  apiRespons.sendSuccess(res, 200, "update discount successfully", discount);
});

//delete discount
exports.deleteDiscount = asyncHandler(async(req, res)=>{
  const {slug} = req.params;
  const discount = await discountModel.findOne({slug});
  if(!discount) throw new customError(404, "discount not found")
// reset category
  if(discount.discountPlan === "category" && discount.category){
    await categoryModels.findOneAndUpdate({_id: discount.category}, {discount: null})
  }
  // reset sub category
  if(discount.discountPlan === "subCategory" && discount.subCategory){
    await subCategoryModel.findOneAndUpdate({_id: discount.subCategory}, {discount: null})
  }
  // finally delete the discount 
  await discountModel.deleteOne({_id: discount._id})
  apiRespons.sendSuccess(res, 200, "discount deleted successfull", discount)
})