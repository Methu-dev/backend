const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guestid: {
      type: String,
      trim: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          default: null,
        },
        variant: {
          type: mongoose.Types.ObjectId,
          ref: "Variant",
          default: null,
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: [true, "Product price is required"],
          min: [0, "Price cannot be negative"],
        },
        totalPrice: {
          type: Number,
          default: 0,
          min: [0, "Total cannot be negative"],
        },
        size: {
          type: String,
          default: "N/A",
        },
        color: {
          type: String,
          default: "N/A",
        },
      },
    ],
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    grossTotalAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      default: 0,
    },
    totalQuantity: { type: Number, default: 0 },
    discountType: {
      type: String,
      default: "N/A",
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 🔹 Auto-calculate total for each item
cartSchema.pre("save", function (next) {
  this.items.forEach((item) => {
    item.total = item.price * item.quantity;
  });

  this.totalPrice = this.items.reduce((sum, item) => sum + item.total, 0);
  this.afterApplyCouponPrice = this.totalPrice - this.discountPrice;

  if (this.afterApplyCouponPrice < 0) this.afterApplyCouponPrice = 0;
  next();
});

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
