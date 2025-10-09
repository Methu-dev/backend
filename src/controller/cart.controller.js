const { customError } = require("../helpers/customErorr");
const { asyncHandler } = require("../utils/asyncHandler");
const { apiRespons } = require("../utils/apiRespons");
const cartModel = require("../models/cart.model");
const productModel = require("../models/product.model");
const variantmodel = require("../models/varian.model");
const couponModel = require("../models/coupon.model");
const { validateCart } = require("../validation/cart.validation");

// apply coupon
const applyCoupon = async (totalPrice, couponCode) => {
  try {
    let afterDiscountPrice = 0;
    const coupon = await couponModel.findOne({ code: couponCode });

    if (!coupon) throw new customError(400, "coupon not foud !!");
    // check expire date
    if (Date.now() >= coupon.expireAt)
      throw new customError(400, "coupon date expire !!");

    if (coupon.usedCount >= coupon.usageLimit)
      throw new customError(400, "coupon used limit expired !!");

    if (coupon.discountType == "percentag") {
      coupon.usedCount += 1;
      discountAmount = Math.ceil((totalPrice * coupon.discountValue) / 100);
      afterDiscountPrice = totalPrice - discountAmount;
    }
    if (coupon.discountType == "tk") {
      coupon.usedCount += 1;
      afterDiscountPrice = Math.ceil(totalPrice - coupon.discountValue);
    }
    await coupon.save();
    return {
      afterApplyCouponPrice: afterDiscountPrice,
      iscountType: coupon.discountType,
    };
  } catch (error) {
    console.log("erorr apply coupon", error);
  }
};

//
exports.addToCart = asyncHandler(async (req, res) => {
  const data = await validateCart(req);
  let product = null;
  let variant = null;
  let price = 0;

  if (data.product) {
    product = await productModel.findById(data.product);
    if (!product) throw new customError(500, "product not found !!");
    price = product.retailPrice;
  }
  if (data.variant) {
    variant = await variantmodel.findById(data.variant);
    if (!variant) throw new customError(500, "variant not found !!");
    price = variant.retailPrice;
  }

  // find user or guestid into cart model
  let cartQuery = {};
  if (data.user) {
    cartQuery = { user: data.user };
  } else {
    cartQuery = { guestid: data.guestid };
  }
  let cart = await cartModel.findOne(cartQuery);
  if (!cart) {
    cart = new cartModel({
      user: data.user || null,
      guestid: data.guestid || null,
      items: [],
      coupon: data.coupon,
    });
  }
  // find product  or variant into cart
  let findIndex = -1;
  if (variant) {
    findIndex = cart.items.findIndex(
      (item) => item.variant.toString() == data.variant
    );
  } else {
    findIndex = cart.items.findIndex(
      (item) => item.product.toString() == data.product
    );
  }
  // now update the item file
  if (findIndex > -1) {
    cart.items[findIndex].quantity += data.quantity;
    cart.items[findIndex].price += price;
    cart.items[findIndex].totalPrice = Math.round(
      cart.items[findIndex].quantity * price
    );
  } else {
    cart.items.push({
      product: data.product ? data.product : null,
      variant: data.variant ? data.variant : null,
      quantity: data.quantity,
      price: price,
      totalPrice: Math.ceil(price * data.quantity),
      size: data.size,
      color: data.color,
    });
  }
  // calculate total price
  const totalCartItemPrice = cart.items.reduce(
    (acc, item) => {
      let itemPirce = Math.round(item.price * item.quantity);
      acc.totalQuantity += item.quantity;
      acc.totalPrice += itemPirce;
      return acc;
    },
    {
      totalPrice: 0,
      totalQuantity: 0,
    }
  );

  const { totalPrice, totalQuantity } = totalCartItemPrice;
  const discountAmount = applyCoupon(totalPrice, data.coupon);
});
