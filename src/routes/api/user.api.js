const express = require('express');
const _ = express.Router();
const userControllar = require('../../controller/user.controllar')
_.route("/registation").post(userControllar.registation);
_.route("/veriry-email").post(userControllar.verifyEmail);
_.route("/resend-otp").post(userControllar.resendOtp);
_.route("/forgot-password").post(userControllar.forgotPassword);
_.route("/reset-password").post(userControllar.resetPassword);
_.route("/login").post(userControllar.login); 
_.route("/logout").post(userControllar.logOut);
module.exports = _;