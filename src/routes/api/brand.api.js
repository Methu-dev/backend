const express = require("express");
const _ = express.Router();
const brandController = require("../../controller/brand.controller");
const { upload } = require("../../middleware/multer.middleware");

_.route("/create_brand").post(
  upload.fields([{ name: "image", maxCount: 1 }]),
  brandController.createBrand
);
_.route("/all_brand").get(brandController.getAllBrand);
_.route("/sigle_brand/:slug").get(brandController.singleBrand);
_.route("/upload_brand/:slug").put(upload.fields([{name: "image", maxCount: 1}]),brandController.uploadBrand)
_.route("/delete_brand/:slug").delete(brandController.deleteBrand);
module.exports = _;
