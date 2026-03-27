const fs = require('fs');
const path = require('path');

// Simple image upload service
// For production, you should use Cloudinary or AWS S3
// For now, we'll save to local public folder and return URL

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'reviews');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Upload image to local storage
 * @param {Buffer} buffer - Image buffer from multer
 * @param {string} originalname - Original filename
 * @returns {Promise<string>} - URL of uploaded image
 */
async function uploadImage(buffer, originalname) {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(originalname);
    const filename = `review_${timestamp}_${Math.random().toString(36).substring(7)}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Write file
    fs.writeFileSync(filepath, buffer);

    // Return URL (relative to server)
    const url = `/uploads/reviews/${filename}`;
    return url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Upload multiple images
 * @param {Array} files - Array of multer files
 * @returns {Promise<Array<string>>} - Array of image URLs
 */
async function uploadMultipleImages(files) {
  const uploadPromises = files.map(file => uploadImage(file.buffer, file.originalname));
  return Promise.all(uploadPromises);
}

/**
 * Delete image from local storage
 * @param {string} url - Image URL to delete
 */
function deleteImage(url) {
  try {
    const filename = path.basename(url);
    const filepath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error('Image delete error:', error);
  }
}

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage
};
