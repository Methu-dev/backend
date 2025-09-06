const express = require("express");
const _ = express.Router();
const productController = require("../../controller/product.controller");
const {upload} = require("../../middleware/multer.middleware")
_.route("/create_product").post(upload.fields([{name: "image", maxCount: 10}]), productController.creatProduct);
module.exports = _;
