// ImageBB upload utility
const imageHostKey = import.meta.env.VITE_image_Host_Key;
const imageHostAPI = `https://api.imgbb.com/1/upload?key=${imageHostKey}`;

/**
 * Upload image to ImageBB
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<string>} - Returns the uploaded image URL
 */
export const uploadImageToImageBB = async (imageFile) => {
    try {
        console.log('🖼️ Starting image upload to ImageBB...');
        
        // Validate file
        if (!imageFile) {
            throw new Error('কোনো ছবি নির্বাচন করা হয়নি');
        }

        // Check file size (max 32MB for ImageBB)
        if (imageFile.size > 32 * 1024 * 1024) {
            throw new Error('ছবির সাইজ ৩২ MB এর কম হতে হবে');
        }

        // Check file type
        if (!imageFile.type.startsWith('image/')) {
            throw new Error('শুধুমাত্র ছবি ফাইল আপলোড করুন');
        }

        // Create FormData
        const formData = new FormData();
        formData.append('image', imageFile);

        console.log('📤 Uploading to ImageBB...');
        
        // Upload to ImageBB
        const response = await fetch(imageHostAPI, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`ImageBB API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Image uploaded successfully to ImageBB');
            console.log('🔗 Image URL:', result.data.url);
            return result.data.url;
        } else {
            console.error('❌ ImageBB upload failed:', result);
            throw new Error('ছবি আপলোড করতে সমস্যা হয়েছে');
        }

    } catch (error) {
        console.error('❌ Image upload error:', error);
        
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('ইন্টারনেট সংযোগ চেক করুন');
        }
        
        // Handle API key errors
        if (error.message.includes('400') || error.message.includes('unauthorized')) {
            throw new Error('ছবি আপলোড সার্ভিসে সমস্যা। এডমিনের সাথে যোগাযোগ করুন।');
        }
        
        // Re-throw custom errors
        if (error.message.includes('সাইজ') || error.message.includes('ফাইল') || error.message.includes('নির্বাচন')) {
            throw error;
        }
        
        // Generic error
        throw new Error('ছবি আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
};

/**
 * Validate image file before upload
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with success and message
 */
export const validateImageFile = (file) => {
    if (!file) {
        return { success: false, message: 'কোনো ছবি নির্বাচন করা হয়নি' };
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
        return { success: false, message: 'শুধুমাত্র ছবি ফাইল আপলোড করুন' };
    }

    // Check file size (max 32MB for ImageBB)
    if (file.size > 32 * 1024 * 1024) {
        return { success: false, message: 'ছবির সাইজ ৩২ MB এর কম হতে হবে' };
    }

    // Check for common image formats
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return { success: false, message: 'JPG, PNG, GIF বা WebP ফরম্যাটের ছবি ব্যবহার করুন' };
    }

    return { success: true, message: 'ছবি ভ্যালিড' };
};

/**
 * Get file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Human readable file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};