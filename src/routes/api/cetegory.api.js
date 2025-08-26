const express = require('express');
const _ = express.Router();
const categoryController = require('../../controller/category.controller');
const { upload } = require('../../middleware/multer.middleware');
_.route("/create-category").post(
  upload.fields([{ name: "image", maxCount: 1 }]),
  categoryController.createCategory
);
_.route("/all_category").get(categoryController.getAllCategory);
_.route("/single_category/:slug").get(categoryController.singleCategory);
_.route("/update-category/:slug").put(
  upload.fields([{ name: "image", maxCount: 1 }]),
  categoryController.updateCategory
);
_.route("/delete_category/:slug").delete(categoryController.deleteCategory);
_.route("/active_category").get(categoryController.activeCategory);
module.exports = _;