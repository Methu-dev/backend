const { customError } = require("../helpers/customErorr");
const { asyncHandler } = require("../utils/asyncHandler");
const categoryModels = require("../models/cetegory.model")
const { apiRespons } = require("../utils/apiRespons");
const { categoryValidateUser } = require("../validation/category.validation");
const { uploadCloudinaryFile, deleteCloudinaryImage } = require("../helpers/cloudinary");

exports.createCategory = asyncHandler(async(req, res)=>{
  const value = await categoryValidateUser(req)
  // upload image into cloudinary
 const imgaeAsset = await uploadCloudinaryFile(value.image.path);
 // save into database
const category = await categoryModels.create({name: value.name, image: imgaeAsset})
if(!category) throw new customError(500, "category not created");
apiRespons.sendSuccess(res, 201, "category create successfully", category)
})

// get all category
exports.getAllCategory = asyncHandler(async(req, res)=>{
  const allCategory = await categoryModels.aggregate([
    {
      $lookup: {
        from: "subcategories",
        localField: "subCategory",
        foreignField: "_id",
        as: "subCategory",
      },
    },
    {
      $project: {
        name: 1,
        image: 1,
        isActive: 1,
        slug: 1,
        subCategory: 1,
      },
    },
  ]);
  if(!allCategory) throw new customError(401, "category not found!!")
    apiRespons.sendSuccess(res , 200, "get all category successfull", allCategory)
})

// get single category
exports.singleCategory = asyncHandler(async(req,res)=>{
  const {slug} = req.params;
  if(!slug) new customError(401, "slug is not found");
  const category = await categoryModels.findOne({slug});
  if(!category) new customError(401, "category not found");
  apiRespons.sendSuccess(res, 200, "single category found successfull", category)
})

// update category
exports.updateCategory = asyncHandler(async(req, res)=>{
  const {slug} = req.params;
  if(!slug) throw new customError(401, "slug not found");
  const category = await categoryModels.findOne({slug});
  if(!category) throw new customError(401, "category not found")
    if(req.body.name){
        category.name = req.body.name;
    }
    if(req?.files?.image?.length){
      // delete previous cloudinary image
     const respons = await deleteCloudinaryImage(category.image.publicId);
     console.log(respons);
     // upload new update image
     const uploadAsset = await uploadCloudinaryFile(req?.files?.image[0].path)
     category.image = uploadAsset
    }
    await category.save()
    apiRespons.sendSuccess(res, 200, "update category successfull", category)
})

// delete
exports.deleteCategory = asyncHandler(async(req, res)=>{
  const { slug } = req.params;
  if (!slug) throw new customError(401, "slug not found");
  const category = await categoryModels.findOneAndDelete({ slug });
  if (!category) throw new customError(401, "category not found");
  // delete previous cloudinary image
   await deleteCloudinaryImage(category.image.publicId);
  apiRespons.sendSuccess(res, 200, "category delete successfully", category)
})

// active category
exports.activeCategory = asyncHandler(async(req, res)=>{
  const {active} = req.query;
  if(!active) throw new customError(401, "active category not found")
    const category = await categoryModels.find({isActive:active});
  if(!category) throw new customError(401, "category not found");
  apiRespons.sendSuccess(res, 200, "successfully active category", category)
})