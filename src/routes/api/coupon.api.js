const express = require("express");
const _ = express.Router();
const couponController = require("../../controller/coupon.controller");

_.route("/create_coupon").post(couponController.createCoupon); 
_.route("/all_coupon").get(couponController.getAllCoupon); 
_.route("/single_coupon/:id").get(couponController.getSingleCoupon); 
_.route("/update_coupon/:id").put(couponController.updateCoupon); 
_.route("/delete_coupon/:id").delete(couponController.deleteCoupon); 

module.exports = _;
