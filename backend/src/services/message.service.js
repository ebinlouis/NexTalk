import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import CustomError from '../utils/error.js';

export const getAllContactsService = async (currentUserId) => {
    const users = await User.find({ _id: { $ne: currentUserId } }).select(
        '-password -createdAt -updatedAt -__v',
    );
    return users;
};

export const sendMessageService = async (senderId, receiverId, text, image) => {
    if (!text && !image) {
        throw new CustomError('Message content (text or image) is required', 400);
    }

    const newMessage = await Message.create({
        senderId,
        receiverId,
        text,
        image,
    });

    return newMessage;
};

export const getChattedUsersService = async (currentUserId) => {
    const userId = new mongoose.Types.ObjectId(currentUserId);

    const chatPartners = await Message.aggregate([
        {
            $match: {
                $or: [{ senderId: userId }, { receiverId: userId }],
            },
        },
        {
            $project: {
                partnerId: {
                    $cond: [{ $eq: ['$senderId', userId] }, '$receiverId', '$senderId'],
                },
            },
        },
        {
            $group: {
                _id: '$partnerId',
            },
        },
    ]);

    const chattedUserIds = chatPartners.map((partner) => partner._id);

    const users = await User.find({ _id: { $in: chattedUserIds } }).select('-password');
    return users;
};

export const getMessagesService = async (currentUserId, partnerId) => {
    const messages = await Message.find({
        $or: [
            { senderId: currentUserId, receiverId: partnerId },
            { senderId: partnerId, receiverId: currentUserId },
        ],
    }).sort({ createdAt: 1 });

    return messages;
};
