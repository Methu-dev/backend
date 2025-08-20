const { customError } = require("../helpers/customErorr");
const user = require("../models/user.model");
const {
  emailVerificationTemplate,
  ResendOtpTemplate,
  ForgotPasswordTemplate,
} = require("../template/email.otp");
const { asyncHandler } = require("../utils/asyncHandler");
const { validateUser } = require("../validation/userValidation");
const crypto = require("crypto");
const { mailer } = require("../helpers/nodeMailer");
const { apiRespons } = require("../utils/apiRespons");
const jwt = require("jsonwebtoken");
const path = require("path");
const { sendSms } = require("../helpers/sendSms");

exports.registation = asyncHandler(async (req, res) => {
  const value = await validateUser(req);
  // now user data save
  const userData = await new user({
    name: value.name,
    email: value.email || null,
    phone: value.phone || null,
    password: value.password,
  }).save();

  const otp = crypto.randomInt(1000, 9999);
  const expireTime = Date.now() + 10 * 60 * 1000;
  // const expireTime = Math.floor((otpExpireAt - Date.now()) / (1000 * 60));

  if (value.email) {
    const flink = `www.fnd.com/verify/:${userData.email}`;

    // verification email
    const template = emailVerificationTemplate(
      userData.name,
      otp,
      expireTime,
      flink
    );
    await mailer(template, userData.email);
    userData.resetPasswordOtp = otp;
    userData.resetPasswordExpirse = expireTime;
  }

if (value.phone){
const flink = `www.fnd.com/verify/:${userData.phone}`;
const smsBody = `Hi ${userData.name}, 

Your registration is almost complete!  
Use this OTP: ${otp}  
It will expire in ${expireTime} minutes.  

Verify your account here: ${flink}  

- Team Clicon
`;
await sendSms(userData.phone, smsBody);
}
 await userData.save();
  apiRespons.sendSuccess(res, 201, "registation successfull", userData)
});

// verify email
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new customError(401, "Email or otp missing");
  }

  // find the user using email
  const findUser = await user.findOne({
    $and: [
      { $or: [{phone: req.body.phone}, { email: email }] },
      { resetPasswordOtp: otp },
      { resetPasswordExpirse: { $gt: Date.now() } },
    ],
  });
  if (!findUser) {
    throw new customError(401, "user not found time is expire");
  }
  findUser.isEmailverified = true;
  findUser.resetPasswordOtp = null;
  findUser.resetPasswordExpirse = null;
  await findUser.save();
  apiRespons.sendSuccess(res, 200, "Email verification Successfully", findUser);
});

// resend email
exports.resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new customError(401, "Email Missing");
  }
  const userData = await user.findOne({
    email: email,
  });
  if (!userData) {
    throw new customError(401, "User Not Found");
  }

  const otp = crypto.randomInt(1000, 9999);
  const expireTime = Date.now() + 10 * 60 * 1000;
  // const expireTime = Math.floor((otpExpireAt - Date.now()) / (1000 * 60));
  const flink = `https://www.bing.com/search?pglt=299&q=methu+islam&cvid=5e7f3b10a13f4e0bbf93f54039a8ad3e&gs_lcrp=EgRlZGdlKgYIABBFGDkyBggAEEUYOTIGCAEQRRhB0gEJNDMwMTVqMGoxqAIIsAIB&FORM=ANSPA1&adppc=EDGEXST&PC=PCMWSB`;
  // verification email
  const template = ResendOtpTemplate(userData.name, otp, expireTime, flink);
  await mailer(template, userData.email);
  userData.resetPasswordOtp = otp;
  userData.resetPasswordExpirse = expireTime;
  await userData.save();
  apiRespons.sendSuccess(res, 200, "resend otp send successfully", {
    name: userData.name,
  });
});

// forgot password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new customError(401, "Email Missing");
  }
  const userData = await user.findOne({
    email: email,
  });
  if (!userData) {
    throw new customError(401, "User Not Found");
  }

  // const expireTime = Math.floor((otpExpireAt - Date.now()) / (1000 * 60));
  const flink = `https://www.bing.com/search?pglt=299&q=methu+islam&cvid=5e7f3b10a13f4e0bbf93f54039a8ad3e&gs_lcrp=EgRlZGdlKgYIABBFGDkyBggAEEUYOTIGCAEQRRhB0gEJNDMwMTVqMGoxqAIIsAIB&FORM=ANSPA1&adppc=EDGEXST&PC=PCMWSB`;
  // verification email
  const template = ForgotPasswordTemplate(userData.name, flink);
  await mailer("forgot password", template, userData.email);

  apiRespons.sendSuccess(res, 200, "chack your email", {
    name: userData.name,
  });
});

// reset password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!email || !newPassword || !confirmPassword) {
    throw new customError(401, "Email Missing");
  }
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  regex.test(newPassword);
  if (!regex.test(newPassword)) {
    throw new customError(
      401,
      "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character."
    );
  }
  if (newPassword !== confirmPassword) {
    throw new customError(401, "password not match");
  }
  const findUser = await user.findOne({ email });
  if (!findUser) {
    throw new customError(401, "User not found");
  }
  // change password
  findUser.password = newPassword;
  await findUser.save();
  apiRespons.sendSuccess(res, 200, "reset password successfully", {
    name: findUser.name,
    email: findUser.email,
    password: findUser.password,
  });
});

// login
exports.login = asyncHandler(async (req, res) => {
  const { email, phone, password } = await validateUser(req);
  // findUser
  const findUser = await user.findOne({ $or: [{ email }, { phone }] });
  if (!findUser) {
    throw new customError(401, "User not found");
  }
  const isMatchPassword = await findUser.comparePassword(password);
  if (!isMatchPassword) {
    throw new customError(401, "password not matched");
  }
  // generat access token and refresh token
  const accessToken = await findUser.generateTokenAccess();
  const refreshToken = await findUser.refrenceToken();
  // send refresh token
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV == "development" ? false : true,
    sameSite: "none",
    path: "/",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });
  // set refresh token in to db
  findUser.refrenshToken = refreshToken;
  await findUser.save();
  apiRespons.sendSuccess(res, 200, "login successfull", {
    data: {
      name: findUser.name,
      accessToken: accessToken,
    },
  });
});

// @desc logout
exports.logOut = asyncHandler(async (req, res) => {
  const token = req?.headers?.authorization || req?.body?.accessToken;
  const decode = await jwt.verify(token, process.env.ACCESSTOKEN_SECRET);
  const client = await user.findById(decode.id);
  if (!client) throw new customError(401, "user not found");
  // clear the refresh token
  client.refrenshToken = null;
  await client.save();

  // now clear the cookie from browser
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV == "development" ? false : true,
    sameSite: "none",
    path: "/",
  });

  // send message
  const smsRes = await sendSms(
    "01761654478",
    "logout successfull Mr." + client.name
  );
  if (smsRes.response_code !== 202) {
    throw new customError(500, "send sms failed");
  }
  // return res.status(301).redirect("www.fnd.com/loguot");
  apiRespons.sendSuccess(res, 200, "logout successfull", client);
});
