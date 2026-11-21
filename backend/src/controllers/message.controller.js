import mongoose from 'mongoose';
import User from '../models/user.model.js';
import {
    getAllContactsService,
    sendMessageService,
    getChattedUsersService,
    getMessagesService,
    editMessageService,
    deleteMessageService,
} from '../services/message.service.js';
import { getReceiverSocketId, io } from '../lib/socket.js';
import { uploadMediaService } from '../services/storage.service.js';

export const getContacts = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const contacts = await getAllContactsService(currentUserId);
        res.status(200).json({
            success: true,
            data: contacts,
        });
    } catch (error) {
        console.error('Error in getContacts:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image, fileUrl, fileName, fileType, fileSize } = req.body;
        const conversationId = req.params.id;
        const senderId = req.user._id;

        const newMessage = await sendMessageService(
            senderId,
            conversationId,
            { text, image, fileUrl, fileName, fileType, fileSize }
        );

        const populatedMessage = await newMessage.populate('senderId', 'fullName profilePic');

        io.to(conversationId.toString()).emit('newMessage', populatedMessage);

        res.status(201).json({
            success: true,
            data: populatedMessage,
        });
    } catch (error) {
        console.error('Error in sendMessage:', error.message);
        res.status(error.statusCode || 500).json({
            message: error.message || 'Internal Server Error',
        });
    }
};

export const getChattedUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const users = await getChattedUsersService(currentUserId);
        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error('Error in getChattedUsers:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getMessages = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const conversationId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid conversation id',
            });
        }

        const { before, limit } = req.query;
        const messages = await getMessagesService(currentUserId, conversationId, { before, limit });

        res.status(200).json({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error('Error in getMessages:', error.message);
        res.status(error.statusCode || 500).json({
            message: error.message || 'Internal Server Error',
        });
    }
};

export const editMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.user._id;
        const updatedMessage = await editMessageService(id, userId, text);

        const receiverSocketId = getReceiverSocketId(updatedMessage.receiverId.toString());
        if (receiverSocketId) io.to(receiverSocketId).emit('messageEdited', updatedMessage);

        res.status(200).json({ success: true, data: updatedMessage });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { deleteType } = req.body;
        const userId = req.user._id;
        const result = await deleteMessageService(id, userId, deleteType);

        if (result.deleteType === 'forEveryone') {
            const receiverSocket = getReceiverSocketId(result.message.receiverId.toString());
            if (receiverSocket) io.to(receiverSocket).emit('messageDeleted', { messageId: id, message: result.message });
        }

        res.status(200).json({ success: true, data: result.message, deleteType: result.deleteType });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const uploadAttachment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const isImage = req.file.mimetype.startsWith('image/');
        const result = await uploadMediaService(req.file.buffer, {
            folder: isImage ? 'nextalk_chat_images' : 'nextalk_chat_docs',
            resource_type: isImage ? 'image' : 'raw',
        });
        res.status(200).json({
            success: true,
            data: {
                url: result.url,
                fileName: req.file.originalname,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
            },
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || 'Internal Server Error',
        });
    }
};
