require('dotenv').config();
const mongoose = require('mongoose');
const {Schema , Types} = mongoose;
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    require: true,
    unique: [true, "email must unique"],
  },
  phone: {
    type: Number,
    trim: true,
    require: true,
  },
  password: {
    type: String,
    trim: true,
    require: true,
  },
  image: {
    type: String,
    trim: true,
  },
  isEmailverified: Boolean,
  isPhoneVerified: Boolean,
  address: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    tirm: true,
  },
  state: {
    type: String,
    tirm: true,
  },
  country: {
    type: String,
    trim: true,
    default: "bangladesh",
  },
  zipCode: {
    type: Number,
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    trim: true,
    enum: ["male", "female", "other"],
  },
  lastlogin: Date,
  lastlogout: Date,
  cart: [
    {
      type: Types.ObjectId,
      ref: "product",
    },
  ],
  wishList: [
    {
      type: Types.ObjectId,
      ref: "product",
    },
  ],
  newLetterSubscribe: Boolean,
  role: [
    {
      type: Types.ObjectId,
      ref: "role",
    },
  ],
  parmission: [
    {
      type: Types.ObjectId,
      ref: "parmission",
    },
  ],
  pesetPasswordOtp: Number,
  resetPasswordExpirse: Date,
  twoFactorEnabled: Boolean,
  isBlocked: Boolean,
  isActive: Boolean,
  refrenshToken: {
    type: String,
    trim: true,
  },
});

// make a has password with mongoose
userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        const hasPassword = await bcrypt.hash(this.password, 10)
        this.password = hasPassword
    }
    next()
})

// check user email or phone already exit or not
userSchema.pre("save", async function(){
   const isExist = this.constructor.findOne({
      $or:[{email: this.email}, {phone: this.phone}]
   })
   if(isExist && isExist._id.toString() !== this._id.toString()){
      throw new Error('email already exist')
   }
   next()
})

//compare password method
userSchema.method.comparePassword = async function(humanPass){
  return  await bcrypt.compare(humanPass, this.password)
}

// token generat
userSchema.method.generateTokenAccess = async function(){
return await jwt.sign(
  {
    id: this._id,
    phone: this.phone,
    email: this.email,
    role: this.role,
  },
  process.env.ACCESSTOKEN_SECRET,
  { expiresIn: process.env.ACCESSTOKEN_EXPIRE }
);
}

// refrence token
userSchema.method.refrenceToken = async function(){
 return await jwt.sign(
     {
       id: this._id,
     },
     process.env.REFRENCHTOKEN_SECRET,
     { expiresIn: process.env.REFRENCHTOKEN_EXPIRE }
   );
}

// varify access token
userSchema.method.varifyTokenAccess = async function(token){
   return await jwt.verify(token, process.env.ACCESSTOKEN_SECRET);
}

// varify refresh token
userSchema.method.varifyRefreshToken = async function(token){
   return await jwt.verify(token,process.env.REFRENCHTOKEN_SECRET);
}
module.exports = mongoose.model('user', userSchema)