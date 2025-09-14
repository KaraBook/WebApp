import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch { sharp = null; }

export const prepareImage = async (buffer) => {
  if (!sharp) return buffer;
  return sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
};

export const uploadBuffer = (buffer, { folder }) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

export default cloudinary;
