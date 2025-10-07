const { customError } = require("../helpers/customErorr");
const { asyncHandler } = require("../utils/asyncHandler");
const { apiRespons } = require("../utils/apiRespons");
const variantModel = require("../models/varian.model");
const productModel = require("../models/product.model");
const {
  uploadCloudinaryFile,
  deleteCloudinaryImage,
} = require("../helpers/cloudinary");
const { variantValidateUser } = require("../validation/variant.validation");

exports.createVariant = asyncHandler(async(req, res)=>{
   const data = await variantValidateUser(req)
   
   // upload cloudinary image
   const imageUrl = await Promise.all(
    data.image.map((img)=> uploadCloudinaryFile(img.path))
   );
   const variant = await variantModel.create({...data, image: imageUrl})
   if(!variant) throw new customError(500, "variant not created")
    const checkUpdateProduct = await productModel.findOneAndUpdate(
      { _id: data.product },
      { $push: { variant: variant._id} }, {new: true}
    );
    if(!checkUpdateProduct) throw new customError(500, "variant not push into product !!!")
        apiRespons.sendSuccess(res, 200, "variant created successfuly", variant)
})

// get all variant
exports.getAllVariant = asyncHandler(async(_, res)=>{
    const variants = await variantModel.find().populate("product").sort({createdAt: -1})
    if(!variants || variants?.length === 0){
        throw new customError(404, "no variant found")
    }
    apiRespons.sendSuccess(
      res,
      200,
      "All variants fetched successfully",
      variants
    );
})

//single variant
exports.getSingleVariant = asyncHandler(async(req, res)=>{
    const {slug} = req.params;
    if(!slug) throw new customError(401, "slug not found")
        const variant = await variantModel.findOne({slug}).populate("product")
    if(!variant) throw new customError(404, "variant not found")
        apiRespons.sendSuccess(res, 200, "variant fetched successfully", variant)
})

// upload image
exports.uploadVariantImage = asyncHandler(async(req, res)=>{
  const { slug } = req.params;
  const { image } = req.files;
  const variant = await variantModel.findOne({ slug });
  if (!variant) throw new customError(404, "variant not found");
  // upload cloudinary image
  const imageUrl = await Promise.all(
    image.map((img) => uploadCloudinaryFile(img.path))
  );
  // now merge the image into database
  variant.image = [...variant.image, ...imageUrl];
  await variant.save();
  apiRespons.sendSuccess(res, 200, "variant fecthed successfully", variant);
})

// update variant infomation
exports.updateVariantInfo = asyncHandler(async(req, res)=>{
  const {slug} = req.params;
  const data = req.body; 
  const existingVariant = await variantModel.findOne({slug});
  if(!existingVariant) throw new customError(404, "variant not found")
    // check product is changed
  const productChanged = data.product && data.product.toString() !==existingVariant.product.toString();
  
  // update variant 
  const updatedVariant = await variantModel.findOneAndUpdate({slug}, {...data}, {new: true})
  if(!updatedVariant) {
    throw new customError(500, "variant not updated!!!");
  }
  // remove from old product and add to new one
  if(productChanged){
    await productModel.findOneAndUpdate(existingVariant.product, {
      $pull: {variant: existingVariant._id},
    })
    // add to new product
    await productModel.findOneAndUpdate(updatedVariant.product, {
      $push: {variant: updatedVariant._id},
    })
  }
  apiRespons.sendSuccess(res, 200, "variant update successfully", updatedVariant)
})