const { customError } = require("../helpers/customErorr");
const { asyncHandler } = require("../utils/asyncHandler");
const { apiRespons } = require("../utils/apiRespons");
const subCategoryModel = require("../models/subCategory.model");
const { subCategoryValidateUser } = require("../validation/subCategory.validation");
const categoryModel = require("../models/cetegory.model")

// create subCategory
exports.createSubCategory = asyncHandler(async(req, res)=>{
    const value = await subCategoryValidateUser(req)
    // save subcategory
    const subCategory = await subCategoryModel.create(value)
    if(!subCategory) throw new customError(500, "failed to create sub category");
    // update category database
    await categoryModel.findOneAndUpdate(
        {_id: value.category},
        {$push: {subCategory: subCategory._id}},
        {new: true}
    )
    apiRespons.sendSuccess(res,200, "create sub category successfully", subCategory)
})

// find all sub category
exports.findAllSubCategory = asyncHandler(async(req, res)=>{
    const allCategory = await subCategoryModel.find();
    if(!allCategory) throw new customError(401, "all sub Category not found");
    apiRespons.sendSuccess(res, 200, "all sub category successfull", allCategory)
})

// single subcategory
exports.singleSubCategory = asyncHandler(async(req, res)=>{
    const {slug} = req.params;
    if(!slug) throw new customError(401, "slug not found");
    const singleCategory = await subCategoryModel.findOne({slug});
    if(!singleCategory) throw new customError(401, "single category not found");
    apiRespons.sendSuccess(
      res,
      200,
      "single subcategory found successfull",
      singleCategory
    );
})

// update sub category
exports.updateSubCategory = asyncHandler(async(req, res)=>{
    const { slug } = req.params;
    if (!slug) throw new customError(401, "slug not found");
    subCategory = await subCategoryModel.findOne({ slug });
    subCategory.name = req.body.name || subCategory.name;
    if(req.body.category){
        // find the category and remove subcategory from arry
        await categoryModel.findOneAndUpdate(
          {
            _id: subCategory.category,
          },
          {
            $pull: { subCategory: subCategory._id },
          },
          {
            new: true,
          }
        );
         
        //push the subcategory into new category
        await categoryModel.findOneAndUpdate(
          {
            _id: req.body.category,
          },
          {
            $push: { subCategory: subCategory._id },
          },
          {
            new: true,
          }
        );
        subCategory.category = req.body.category
    }
    await subCategory.save();
    apiRespons.sendSuccess(
      res,
      200,
      "update sub category successfully",
      subCategory
    );
})

// delete sub category
exports.deleteSubCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(401, "slug not found");
  subCategory = await subCategoryModel.findOne({ slug });
  
    // find the category and remove subcategory from arry
    await categoryModel.findOneAndUpdate(
      {
        _id: subCategory.category,
      },
      {
        $pull: { subCategory: subCategory._id },
      },
      {
        new: true,
      }
    );
    await subCategoryModel.deleteOne({ _id: subCategory._id});
  apiRespons.sendSuccess(
    res,
    200,
    "delete sub category successfully",
    subCategory
  );
});