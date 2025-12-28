import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  secure: true,
});

console.log("Cloudinary Configured:", cloudinary.config());
export const uploadImage = async (imagePath) => {
  // Use the uploaded file's name as the asset's public ID and
  // allow overwriting the asset with new versions
  try {
    if (!imagePath) {
      return null;
    }
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    // Upload the image
    const result = await cloudinary.uploader.upload(imagePath, options);
    console.log(result);
    return result.secure_url;
  } catch (error) {
    // delete the local file in case of error
    fs.unlinkSync(imagePath);
    console.error(error);
  }
};
