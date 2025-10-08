const { customError } = require("../helpers/customErorr");
const { asyncHandler } = require("../utils/asyncHandler");
const { apiRespons } = require("../utils/apiRespons");
const couponModel = require("../models/coupon.model");

// create coupon
exports.createCoupon = asyncHandler(async(req, res)=>{
    const data = await couponModel.create(req.body);
    if(!data) throw new customError(500, "coupon create failed !!")
        apiRespons.sendSuccess(res, 200, "coupon created successfully", data)
})

// get all coupon
exports.getAllCoupon = asyncHandler(async(req, res)=>{
    const data = await couponModel.find();
    if(!data) throw new customError(500, "coupont not found !!");
    apiRespons.sendSuccess(res, 200, "coupon found", data)
})

// get single coupon
exports.getSingleCoupon = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    const data = await couponModel.findOne({_id: id}, {...req.body}, {new: true});
    if(!data) throw new customError(500, "coupon not updated !!")
        apiRespons.sendSuccess(res, 200, "single coupon successfully", data)
})

// update coupon
exports.updateCoupon = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    if(!id){
        throw new customError(404, "id is not found")
    }
    const data = await couponModel.findOneAndUpdate({_id: id}, {...req.body}, {new: true})
    if(!data) throw new customError(500, "coupon not found")
        apiRespons.sendSuccess(res, 200, "update coupon seccessfully", data)
})

// delete coupon
exports.deleteCoupon = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    const data = await couponModel.findOneAndDelete({_id: id}, {...req.body}, {new: true})
    if(!data) throw new customError(500, "delete not found")
        apiRespons.sendSuccess(res, 200, "delete coupon seccessfully", data)
})