const express = require("express");
const _ = express.Router();
const variantController = require("../../controller/variant.coltroller");
const { upload } = require("../../middleware/multer.middleware");

_.route("/create_variant").post(
  upload.fields([{ name: "image", maxCount: 5 }]),
  variantController.createVariant
);
_.route("/get_allvariants").get(variantController.getAllVariant);
_.route("/get_singlevariants/:slug").get(variantController.getSingleVariant);
_.route("/upload_variantimage/:slug").post(
  upload.fields([{ name: "image", maxCount: 5 }]),
  variantController.uploadVariantImage
);
_.route("/update_variantinfo/:slug").put(variantController.updateVariantInfo);
module.exports = _;
