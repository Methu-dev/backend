const { customError } = require("../helpers/customErorr");
const { asyncHandler } = require("../utils/asyncHandler");
const { apiRespons } = require("../utils/apiRespons");
const brandModel = require("../models/brand.model");
const { validateBrand } = require("../validation/brand.validation");
const { uploadCloudinaryFile, deleteCloudinaryImage } = require("../helpers/cloudinary");
const NodeCache = require("node-cache");
const myCache = new NodeCache();

exports.createBrand = asyncHandler(async (req, res) => {
  const value = await validateBrand(req);
  // upload image
  const imageAsset = await uploadCloudinaryFile(value.image.path);
  
  const brand = new brandModel({
    name: value.name,
    image: imageAsset,
  });
  await brand.save();

  if(!brand) throw new customError(500, "brand Create not found");
  apiRespons.sendSuccess(res, 200, "brand create successfull", brand)
})

// get all brand
exports.getAllBrand = asyncHandler(async (req, res) => {
  const value = myCache.get("brands");
  if (value == undefined) {
    const brands = await brandModel.find();
    myCache.set("brands", JSON.stringify(brands), 1000);
    if (!brands || brands.length === 0) {
      throw new customError(401, "brands not fund");
    }
   return apiRespons.sendSuccess(res, 200, "brand fetched successfull", brands);
  }
  apiRespons.sendSuccess(res, 200, "brand fetched successfull", JSON.parse(value));
});

// single brand
exports.singleBrand = asyncHandler(async(req, res)=>{
    const {slug} = req.params;
    const brand = await brandModel.findOne({slug});
    if(!brand) throw new customError(401, "single brand not found");
    apiRespons.sendSuccess(res, 200, "single brand successfull", brand)
})

// upload brand
exports.uploadBrand = asyncHandler(async(req, res)=>{
    const {slug} = req.params;
    const brand = await brandModel.findOne({slug});
    if(!brand) throw new customError(401, "brand upload not found");
    if(req?.files?.image?.length !== 0){
        await deleteCloudinaryImage(brand.image.publicId);
        // upload new update image
        const uploadimage = await uploadCloudinaryFile(req?.files?.image[0].path);
        brand.image = uploadimage;
    }

    // update brand
    brand.name = req?.body?.name || brand.name;
    await brand.save();
    apiRespons.sendSuccess(res,200, "brand update successfull", brand)
})

// delete brand
exports.deleteBrand = asyncHandler(async(req, res)=>{
    const {slug} = req.params;
    if(!slug){
        throw new customError(401, "slug not found")
    }
    const brand = await brandModel.findOne({slug});
    if(!brand){
        throw new customError(401, "brand not found")
    }
    await deleteCloudinaryImage(brand.image.publicId);
    const brandDelete = await brandModel.findOneAndDelete({slug});
    if(!brandDelete){
         throw new customError(500, "brand delete failed")
    }
    apiRespons.sendSuccess(res, 200, "brand delete successfully", brand)
})