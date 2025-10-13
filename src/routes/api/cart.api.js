const express = require("express");
const _ = express.Router();
const cartController = require("../../controller/cart.controller")


 
_.route("/addto_cart").post(cartController.addToCart);
_.route("/decrease").post(cartController.decreaseQuantity);
_.route("/increase").post(cartController.increaseQuantity);
_.route("/deletecart").delete(cartController.deleteQuantity);
module.exports = _;
