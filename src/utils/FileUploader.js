import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // Used for system file handling

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadFile = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload File
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // File Upload Successfully
    // console.log("File has been uploaded:", response.url);
    fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    // File not uploaded (So we remove locally saved temporary file)
    fs.unlinkSync(localFilePath);
    return null;
  }
};

// Clean Up function to remove temp files
const cleanUpTempFiles = (filePaths) => {
  filePaths.forEach((filePath) => {
    if (filePath) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Error removing temp file (${filePath}):`, err);
      }
    }
  });
};

export {uploadFile,cleanUpTempFiles}