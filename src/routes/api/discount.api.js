const express = require("express");
const _ = express.Router();
const discountController = require("../../controller/discount.controller")

_.route("/create_discount").post(discountController.creatDiscount);
_.route("/get_alldiscount").get(discountController.getAllDiscount);
_.route("/single_discount/:slug").get(discountController.singleDiscount);
_.route("/update_discount/:slug").put(discountController.updateDiscount);
_.route("/delete_discount/:slug").delete(discountController.deleteDiscount);
module.exports = _;
