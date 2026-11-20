import multer from 'multer';
import { CustomError } from '../utils/error.js';

const storage = multer.memoryStorage();

const avatarFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new CustomError('Invalid image format. Only JPEG, PNG, and WebP are allowed.', 400));
    }
};

export const uploadAvatar = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: avatarFilter,
}).single('avatar');

const chatMediaFilter = (req, file, cb) => {
    const allowed = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf', 'text/plain', 'application/zip',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (file.mimetype.startsWith('image/') || allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new CustomError('Unsupported file type. Please upload images, PDFs, text, or docs.', 400));
    }
};

export const uploadChatAttachment = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: chatMediaFilter,
}).single('file');
