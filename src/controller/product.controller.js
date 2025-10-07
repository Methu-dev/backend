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
  const {sort_by} = req.query;
  let sortQuery = {};
  if(sort_by == "created-descending"){
    sortQuery = { createdAt: -1 };
  }
  else if (sort_by == "created-ascending") {
    sortQuery = { createdAt: 1 };
  }
  else if (sort_by == "title-ascending") {
    sortQuery = { name: 1 };
  }else{
   sortQuery = { name: -1 }; 
  }
  const product = await productModel
    .find()
    .sort(sortQuery || { createdAt: -1 })
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

  for(const imageId of req.body.image){
    await deleteCloudinaryImage(imageId);
    product.image = product.image.filter((img) => img.publicId !== imageId);
  }

  for(const image of req.files.image){
    const imageInfo = await uploadCloudinaryFile(image.path)
    product.image.push(imageInfo);
  }
  await product.save()
  apiRespons.sendSuccess(res, 200, "product feched successfully", product);
});

// search get product by category id and sub category id brnad id
exports.getProducts = asyncHandler(async(req, res)=>{
  const { category, subCategory, brand, tag } = req.query;
  let query;
  if(category){
    query = {...query,category: category}
  }
  if(subCategory){
    query = {...query,subCategory: subCategory}
  }
  if(tag){
    if(Array.isArray(tag)){
      query = {...query, tag: {$in: tag}}
    }else{
      query = {...query, tag: tag}
    }
  }
  if(brand){
    if(Array.isArray(brand)){
      query = {...query, brand: {$in: brand}}

    }else{
      query = { ...query, brand: brand };
    }
  }
  
  const products = await productModel.find(query);
  if(!products) throw new customError(401, "products not found");
  apiRespons.sendSuccess(res, 200, "products fetched successfully done", products)
})

// get product filter by price
exports.priceFilterProducts = asyncHandler(async(req, res)=>{
  const {minPrice, maxPrice} = req.query;
  if(!minPrice || !maxPrice) throw new customError(400, "min and maxprice are requred");
    const products = await productModel.find({
      $and: [{retailPrice: {$gte: minPrice, $lte: maxPrice}}]
    })
    if(!products) throw new customError(404, "product not found");
    apiRespons.sendSuccess(res, 200, "products fecthed successfully", products)
  
})

//product pagination
exports.productPagination = asyncHandler(async(req, res)=>{
  const {page, item} = req.query;
  let skipAmount = (page -1) * item;
  const totalItems = await productModel.countDocuments();
  const totalPage = Math.ceil(totalItems / item)
  const products = await productModel
    .find()
    .skip(skipAmount)
    .limit(item)
    .populate({
      path: "category",
      select: "-category -subCategory -updatedAt -__v",
    })
    .populate({ path: "subCategory" })
    .populate({ path: "brand" });
  if(!products) throw new customError(401, "Product not found");
  apiRespons.sendSuccess(res, 200, "get all product successfully",{products, totalItems, totalPage})

})