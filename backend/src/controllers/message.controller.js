import { getAllContactsService, sendMessageService, getChattedUsersService } from '../services/message.service.js';

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
