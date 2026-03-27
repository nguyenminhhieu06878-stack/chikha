const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 */
const uploadImage = async (filePath, folder = 'reviews') => {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.log('⚠️ Cloudinary not configured, using local storage');
      // Return local path
      return {
        url: filePath.replace('backend/public', ''),
        public_id: null,
        local: true
      };
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: `ecommerce/${folder}`,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
      local: false
    };
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error.message);
    // Fallback to local storage
    return {
      url: filePath.replace('backend/public', ''),
      public_id: null,
      local: true
    };
  }
};

/**
 * Upload multiple images
 */
const uploadMultipleImages = async (files, folder = 'reviews') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file.path, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('❌ Multiple upload failed:', error.message);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 */
const deleteImage = async (publicId) => {
  try {
    if (!publicId) return true;

    await cloudinary.uploader.destroy(publicId);
    console.log('✅ Image deleted from Cloudinary:', publicId);
    return true;
  } catch (error) {
    console.error('❌ Failed to delete image:', error.message);
    return false;
  }
};

/**
 * Delete multiple images
 */
const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds
      .filter(id => id)
      .map(id => deleteImage(id));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('❌ Failed to delete multiple images:', error.message);
    return false;
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages
};
