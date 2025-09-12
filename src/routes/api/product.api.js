const express = require("express");
const _ = express.Router();
const productController = require("../../controller/product.controller");
const {upload} = require("../../middleware/multer.middleware")
_.route("/create_product").post(upload.fields([{name: "image", maxCount: 10}]), productController.creatProduct);
_.route("/all_product").get(productController.getAllProduct); 
_.route("/single_product/:slug").get(productController.singleProduct);
_.route("/update_product/:slug").put(productController.updateProduct);
_.route("/update_product_image/:slug").put(
  upload.fields([{ name: "image", maxCount: 10 }]),
  productController.updateProductImage
);
module.exports = _;
