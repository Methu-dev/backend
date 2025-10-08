const { customError } = require("../helpers/customErorr");
const { asyncHandler } = require("../utils/asyncHandler");
const { apiRespons } = require("../utils/apiRespons");
const cartModel = require("../models/cart.model");
const productModel = require("../models/product.model");
const variantmodel = require("../models/varian.model")
const { validateCart } = require("../validation/cart.validation");

// 
exports.addToCart = asyncHandler(async(req, res)=>{
   const data = await validateCart(req)
   // find product information
   data.items?.map(async(item)=>{
    if(item.product){
        const product = await productModel.findOne({_id: item.product})
        console.log(product.retailPrice);
    }
    if(item.variant){
        const variant = await variantmodel.findOne({ _id: item.variant });
        console.log(variant.retailPrice);
    }
   })
}) 