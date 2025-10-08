const express = require("express");
const _ = express.Router();
const { upload } = require("../../middleware/multer.middleware");
const reviewController = require("../../controller/review.controller")
_.route("/create_review").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  reviewController.createReview
);
_.route("/update_review/:slug").put(reviewController.updateReview);
_.route("/delete_review/:slug").delete(reviewController.deleteReview);

module.exports = _;
