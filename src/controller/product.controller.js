const { customError } = require("../helpers/customErorr");
const { asyncHandler } = require("../utils/asyncHandler");
const { apiRespons } = require("../utils/apiRespons");
const productModel = require("../models/product.model");
const { validateProduct } = require("../validation/product.validation");
const { uploadCloudinaryFile } = require("../helpers/cloudinary");
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
      if (!data.retailPrice || !data.wholeSalePrice || !data.color) {
        product.variantType = "multiple";
      } else {
        product.variantType = "single";
      }
        await product.save();
        apiRespons.sendSuccess(res, 200, "create successfully product",product)
})