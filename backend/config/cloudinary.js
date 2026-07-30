// ===== CLOUDINARY IMAGE UPLOAD =====
// Configures Cloudinary SDK and provides multer middleware + upload helper.

import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer middleware — parses multipart form data and stores files in memory
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
});

// Uploads a raw buffer to Cloudinary and returns the secure URL
export const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "polling-app" },
            (error, result) => (error ? reject(error) : resolve(result.secure_url))
        );
        stream.end(buffer); // Pipe the buffer into the upload stream
    });
};

export default cloudinary;
