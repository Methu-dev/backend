const { customError } = require("../helpers/customErorr");
const { asyncHandler } = require("../utils/asyncHandler");
const { apiRespons } = require("../utils/apiRespons");
const cartModel = require("../models/cart.model");
const productModel = require("../models/product.model");
const variantmodel = require("../models/varian.model");
const couponModel = require("../models/coupon.model");
const { validateCart } = require("../validation/cart.validation");
const { default: mongoose } = require("mongoose");

// apply coupon
const applyCoupon = async (totalPrice, couponCode) => {
  try {
    if (!couponCode) {
      return {
        afterApplyCouponPrice: totalPrice,
        discountType: "N/A",
        discountAmount: 0,
        couponId: null,
      };
    }

    const coupon = await couponModel.findOne({ code: couponCode });

    if (!coupon) {
      return {
        afterApplyCouponPrice: totalPrice,
        discountType: "N/A",
        discountAmount: 0,
        couponId: null,
      };
    }

    // expire date
    if (Date.now() >= coupon.expireAt)
      throw new customError(400, "coupon date expire !!");

    if (coupon.usedCount >= coupon.usageLimit)
      throw new customError(400, "coupon used limit expired !!");

    let afterDiscountPrice = totalPrice;
    let discountAmount = 0;

    if (coupon.discountType === "percentag") {
      discountAmount = Math.ceil((totalPrice * coupon.discountValue) / 100);
      afterDiscountPrice = totalPrice - discountAmount;
    } else if (coupon.discountType === "tk") {
      discountAmount = coupon.discountValue;
      afterDiscountPrice = Math.ceil(totalPrice - discountAmount);
    }

    coupon.usedCount += 1;
    await coupon.save();

    return {
      afterApplyCouponPrice: afterDiscountPrice,
      discountType: coupon.discountType,
      discountAmount,
      couponId: coupon._id,
    };
  } catch (error) {
    console.log("error in applyCoupon:", error);
    return {
      afterApplyCouponPrice: totalPrice,
      discountType: "N/A",
      discountAmount: 0,
      couponId: null,
    };
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
    });
  }
  // find product  or variant into cart
  let findIndex = -1;

  if (variant) {
    findIndex = cart.items.findIndex(
      (item) => item.variant && item.variant.toString() == data.variant
    );
  } else {
    findIndex = cart.items.findIndex(
      (item) => item.product && item.product.toString() == data.product
    );
  }

  // now update the item file
  if (findIndex > -1) {
    cart.items[findIndex].quantity += data.quantity;
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
      acc.totalPrice += item.totalPrice;
      acc.totalQuantity += item.quantity;
      return acc;
    },
    {
      totalPrice: 0,
      totalQuantity: 0,
    }
  );

  const { totalPrice, totalQuantity } = totalCartItemPrice;
  const {
    discountAmount,
    discountType,
    couponId,
    afterApplyCouponPrice: finalAmount,
  } = await applyCoupon(totalPrice, data.coupon);
  // now update the cart model
  cart.coupon = couponId || null;
  cart.grossTotalAmount = totalPrice;
  cart.totalQuantity = totalQuantity;
  cart.finalAmount = finalAmount;
  cart.discountType = discountType;
  cart.discountAmount = discountAmount;

  // save the data into database
  await cart.save();
  apiRespons.sendSuccess(res, 200, "add to cart successfully", cart)
});

// decrease quantity
exports.decreaseQuantity = asyncHandler(async(req, res)=>{
  const user = req.userId || req.body.user;
  const { guestid, cartItemId } = req.body;
  // find the user or guest _id
  let Query = user ? { user: user } : { guestid: guestid };
  const cart = await cartModel.findOne(Query);
  // find the acutal item
  const indexNumber = cart.items.findIndex((item) => item._id == cartItemId);
  const targetCartItem = cart.items[indexNumber];
  console.log(targetCartItem);
  if (targetCartItem.quantity > 1) {
    targetCartItem.quantity = targetCartItem.quantity - 1;
    targetCartItem.totalPrice = targetCartItem.price * targetCartItem.quantity;
  } else {
    throw new customError(401, "at least have one item");
  }

  // calculate total price
  const totalCartItemPrice = cart.items.reduce(
    (acc, item) => {
      acc.totalPrice += item.totalPrice;
      acc.totalQuantity += item.quantity;
      return acc;
    },
    {
      totalPrice: 0,
      totalQuantity: 0,
    }
  );
const { finalAmount, totalQuantity, totalPrice } = totalCartItemPrice;
cart.grossTotalAmount = totalPrice;
cart.totalQuantity = totalQuantity;
cart.finalAmount = finalAmount;
  await cart.save();
  apiRespons.sendSuccess(res, 200, "cart item dicrease successfully", cart);
})

// increase total price
exports.increaseQuantity = asyncHandler(async (req, res) => {
  const user = req.userId || req.body.user;
  const { guestid, cartItemId } = req.body;
  // find the user or guest _id
  let Query = user ? { user: user } : { guestid: guestid };
  const cart = await cartModel.findOne(Query);
  // find the acutal item
  const indexNumber = cart.items.findIndex((item) => item._id == cartItemId);
  const targetCartItem = cart.items[indexNumber];
  console.log(targetCartItem);
  if (targetCartItem.quantity > 1) {
    targetCartItem.quantity = targetCartItem.quantity + 1;
    targetCartItem.totalPrice = targetCartItem.price * targetCartItem.quantity;
  } else {
    throw new customError(401, "at least have one item");
  }

  // calculate total price
  const totalCartItemPrice = cart.items.reduce(
    (acc, item) => {
      acc.totalPrice += item.totalPrice;
      acc.totalQuantity += item.quantity;
      return acc;
    },
    {
      totalPrice: 0,
      totalQuantity: 0,
    }
  );
  const { finalAmount, totalQuantity, totalPrice } = totalCartItemPrice;
  cart.grossTotalAmount = totalPrice;
  cart.totalQuantity = totalQuantity;
  cart.finalAmount = finalAmount;
  await cart.save();
  apiRespons.sendSuccess(res, 200, "cart item increase successfully", cart);
});

// delete cart item
exports.deleteQuantity = asyncHandler(async (req, res) => {
  const user = req.userId || req.body.user;
  const { guestid, cartItemId } = req.body;

  // find the user or guest cart
  let query = user ? { user } : { guestid };

  // find and update the cart (remove specific item)
  const cart = await cartModel.findOneAndUpdate(
    query,
    { $pull: { items: { _id: new mongoose.Types.ObjectId(cartItemId) } } },
    { new: true }
  );

  if (!cart) {
    throw new customError(404, "Cart not found");
  }

  if (cart.items.length === 0) {
    await cartModel.deleteOne({ _id: cart._id });
    return apiRespons.sendSuccess(
      res,
      200,
      "Cart deleted as all items removed"
    );
  }

  // 🔹 calculate total price again
  const totalCartItemPrice = cart.items.reduce(
    (acc, item) => {
      acc.totalPrice += item.totalPrice;
      acc.totalQuantity += item.quantity;
      return acc;
    },
    {
      totalPrice: 0,
      totalQuantity: 0,
    }
  );

  // update calculated values
  cart.grossTotalAmount = totalCartItemPrice.totalPrice;
  cart.totalQuantity = totalCartItemPrice.totalQuantity;
  cart.finalAmount = totalCartItemPrice.totalPrice;

  await cart.save();

  apiRespons.sendSuccess(res, 200, "Removed cart item successfully", cart);
});

