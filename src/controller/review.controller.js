const { customError } = require("../helpers/customErorr");
const { asyncHandler } = require("../utils/asyncHandler");
const { apiRespons } = require("../utils/apiRespons");
const productModel = require("../models/product.model");
const {
  uploadCloudinaryFile,
  deleteCloudinaryImage,
} = require("../helpers/cloudinary");
const { reviewValidateUser } = require("../validation/review.validation");

// create review
exports.createReview = asyncHandler(async (req, res) => {
  const data = await reviewValidateUser(req);
  // upload image into cloudinary
  const imageUrl = await Promise.all(
    data.image.map((img) => uploadCloudinaryFile(img.path))
  );
  const submitReview = await productModel.findOneAndUpdate(
    {
      _id: data.productId,
    },
    { $push: { reviews: { ...data, image: imageUrl } } },
    { new: true }
  );
  if(!submitReview) throw new customError(500, "create review failed")
    apiRespons.sendSuccess(
      res,
      200,
      "review created successfully",
      submitReview
    );
});

// Update review
exports.updateReview = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { reviewerid, comment, rating } = req.body;

  const updatedProduct = await productModel.findOneAndUpdate(
    { slug },
    {
      $set: { 
        reviewerid,
        comment,
        rating,
      },
    },
    { new: true }
  );

  if (!updatedProduct) throw new customError(404, "Review not found");

  apiRespons.sendSuccess(
    res,
    200,
    "Review updated successfully",
    updatedProduct
  );
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { reviewerid } = req.body; 

  if (!reviewerid) throw new customError(400, "Reviewer ID is required");

  // Pull the review from the product's reviews array
  const updatedProduct = await productModel.findOneAndUpdate(
    { slug: slug },
    { $pull: { reviews: { reviewerid: reviewerid } } },
    { new: true }
  );

  if (!updatedProduct) {
    throw new customError(404, "Review not found or already deleted");
  }

  apiRespons.sendSuccess(
    res,
    200,
    "Review deleted successfully",
    updatedProduct
  );
});



