import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  secure: true,
});

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

const avatarId = (userId) => `avatars/user_${userId}`;

/**
 * Stores a profile photo as a 400x400 square cropped around the face,
 * replacing the user's previous one. [source] is a file path or a data URL.
 * Throws when the upload fails.
 */
export const uploadAvatar = async (source, userId) => {
  const result = await cloudinary.uploader.upload(source, {
    public_id: avatarId(userId),
    overwrite: true,
    invalidate: true,
    format: "jpg",
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  });
  return result.secure_url;
};

export const deleteAvatar = (userId) =>
  cloudinary.uploader.destroy(avatarId(userId), { invalidate: true });
