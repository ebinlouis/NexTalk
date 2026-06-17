import mongoose from 'mongoose';
import User from '../models/user.model.js';
import {
    getAllContactsService,
    sendMessageService,
    getChattedUsersService,
    getMessagesService,
} from '../services/message.service.js';

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
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        const newMessage = await sendMessageService(senderId, receiverId, text, image);

        res.status(201).json({
            success: true,
            data: newMessage,
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
        const partnerId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(partnerId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user id',
            });
        }

        const partner = await User.findById(partnerId);
        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const messages = await getMessagesService(currentUserId, partnerId);

        res.status(200).json({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error('Error in getMessages:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
