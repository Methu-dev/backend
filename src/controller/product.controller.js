const { customError } = require("../helpers/customErorr");
const { asyncHandler } = require("../utils/asyncHandler");
const { apiRespons } = require("../utils/apiRespons");
const productModel = require("../models/product.model");
const { validateProduct } = require("../validation/product.validation");
const { uploadCloudinaryFile, deleteCloudinaryImage } = require("../helpers/cloudinary");
const { genetateQrCode, barCodeGenerate } = require("../helpers/qrcode");

exports.creatProduct = asyncHandler(async(req, res)=>{
    const data = await validateProduct(req)
    const allImageInfo = [];
    //upload cloudinary image
    for (const image of data.image) {
      const imageInfo = await uploadCloudinaryFile(image.path);
      allImageInfo.push(imageInfo);
    }
    // now save database
    const product = await productModel.create({
        ...data,
        image: allImageInfo
    })
    if(!product) throw new customError(400, "creat failed product")
      // create qr code for product
    const link = `${process.env.FRONTEND_URL}/product/${product.slug}`;
    const barCodeText = data.qrCode ? data.qrCode : `${product.sku}-${product.name.slice(0,3)}-${new Date().getFullYear()}`
    const qrcode = await genetateQrCode(link);
      const barcode = await barCodeGenerate(barCodeText);
      // now update barcode and qr code 
      product.qrCode = qrcode;
      product.barCode = barcode;
      if (!data.retailPrice && !data.wholeSalePrice && !data.color) {
        product.variantType = "multiple";
      } else {
        product.variantType = "single";
      }
        await product.save();
        apiRespons.sendSuccess(res, 200, "create successfully product",product)
})

//get all product
exports.getAllProduct = asyncHandler(async(req, res)=>{
  const product = await productModel
    .find()
    .sort({ createdAt: -1 })
    .populate({
      path: "category",
      select: "-category -subCategory -updatedAt -__v",
    })
    .populate({ path: "subCategory" })
    .populate({ path: "brand" });
  if(!product) throw new customError(401, "Product not found");
  apiRespons.sendSuccess(res, 200, "get all product successfully", product)
})

//get single product
exports.singleProduct = asyncHandler(async(req, res)=>{
  const {slug} = req.params;
  if(!slug) throw new customError(401, "slug not found");
  const product = await productModel
    .findOne({ slug })
    .populate({
      path: "category",
      select: "-category -subCategory -updatedAt -__v",
    })
    .populate({ path: "subCategory" })
    .populate({ path: "brand" });
  if(!product) throw new customError(401, "single product not found");
  apiRespons.sendSuccess(res, 200, "single product successful", product)
})

//update product
exports.updateProduct = asyncHandler(async(req, res)=>{
  const {slug} = req.params;
  if(!slug) throw new customError(400, "slug is requerd");
  const product = await productModel.findOneAndUpdate({slug}, req.body, {new: true})
  if(!product) throw new customError(404, "product not found")
    apiRespons.sendSuccess(res, 200, "product feched successfully", product)
})

// update product image
exports.updateProductImage = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is requerd");
  const product = await productModel.findOne({ slug });
  if (!product) throw new customError(404, "product not found");

  for(const image of req.body.imageid){
    await deleteCloudinaryImage(image.publicId);
  }

  for(const image of req.files.image){
    const imageInfo = await uploadCloudinaryFile(image.path)
    product.image.push(imageInfo);
  }
  apiRespons.sendSuccess(res, 200, "product feched successfully", product);
});