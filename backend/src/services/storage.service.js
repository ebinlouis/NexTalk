import cloudinary from '../lib/cloudinary.js';
import { CustomError } from '../utils/error.js';

export const uploadMediaService = (fileBuffer, options = {}) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        throw new CustomError('Cloudinary credentials not configured in .env', 500);
    }
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: options.resourceType || 'auto',
                folder: options.folder || 'nextalk_media',
                ...options,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    bytes: result.bytes,
                    format: result.format,
                });
            }
        );
        stream.end(fileBuffer);
    });
};
