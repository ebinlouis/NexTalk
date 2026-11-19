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

    const conversations = await Message.aggregate([
        { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: { $cond: [{ $eq: ['$senderId', userId] }, '$receiverId', '$senderId'] },
                lastMessage: { $first: '$$ROOT' },
                unreadCount: {
                    $sum: {
                        $cond: [
                            { $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$seen', false] }] },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'partner' } },
        { $unwind: '$partner' },
        {
            $project: {
                _id: '$partner._id',
                fullName: '$partner.fullName',
                email: '$partner.email',
                profilePic: '$partner.profilePic',
                lastMessage: {
                    text: '$lastMessage.text',
                    senderId: '$lastMessage.senderId',
                    createdAt: '$lastMessage.createdAt',
                },
                unreadCount: '$unreadCount',
            },
        },
        { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    return conversations;
};

export const getMessagesService = async (currentUserId, partnerId) => {
    await Message.updateMany(
        { senderId: partnerId, receiverId: currentUserId, seen: false },
        { $set: { seen: true } }
    );

    const messages = await Message.find({
        $or: [
            { senderId: currentUserId, receiverId: partnerId },
            { senderId: partnerId, receiverId: currentUserId },
        ],
    }).sort({ createdAt: 1 });

    return messages;
};
