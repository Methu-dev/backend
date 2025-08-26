const { customError } = require('./customErorr');
const fs = require("fs");
require('dotenv').config()
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET,
});

exports.uploadCloudinaryFile = async (filePath)=>{
    try {
        if(!filePath || !fs.existsSync(filePath)) {
            throw new customError(401, "upload file missing");
        }
            //upload file
    const uploadFileRespons = await cloudinary.uploader.upload(filePath, {
          resource_type: "image",
          quality: "auto",
        });
        if(uploadFileRespons){
            fs.unlinkSync(filePath);
        }
        return {
          publicId: uploadFileRespons.public_id,
          url: uploadFileRespons.secure_url,
        };

    } catch (error) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw new customError(500, "fail to upload image"+ error.message)
    }
}

// delete cloudinary image
exports.deleteCloudinaryImage = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    throw new customError(500, "failed to delete image: " + error.message);
  }
};
