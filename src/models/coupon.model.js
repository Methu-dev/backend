const mongoose = require("mongoose");
const { customError } = require("../helpers/customErorr");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      trim: true,
      unique: true,
    },
    discountType: {
      type: String,
      enum: ["percentag", "tk"],
      required: [true, "Discount type is required"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
    },
    expireAt: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
    usageLimit: {
      type: Number,
      required: [true, "Usage limit is required"],
      min: [1, "Usage limit must be at least 1"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
  },
  { timestamps: true }
);

// check this coupon code is already exist or not
couponSchema.pre("save", async function (next){
    const isExist = await this.constructor.findOne({
        code: this.code,
    })
    if(isExist && !isExist._id.equals(this._id)){
        throw new customError(401,"coupon code already exist")
    } 
    next()
})

module.exports =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
