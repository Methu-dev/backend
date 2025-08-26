 const express = require("express");
 const _ = express.Router();
 const subCategoryController = require("../../controller/subCategory.controller");
 _.route("/create-subcategory").post(subCategoryController.createSubCategory);
 _.route("/all_subcategory").get(subCategoryController.findAllSubCategory);
 _.route("/single_subcategory/:slug").get(
   subCategoryController.singleSubCategory
 );
 _.route("/update_subcategory/:slug").put(subCategoryController.updateSubCategory);
 _.route("/delete_subcategory/:slug").delete(
   subCategoryController.deleteSubCategory
 );
 
 module.exports = _; 