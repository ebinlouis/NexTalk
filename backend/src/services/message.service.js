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

export const sendMessageService = async (senderId, receiverId, text, image, isDelivered = false) => {
    if (!text && !image) {
        throw new CustomError('Message content (text or image) is required', 400);
    }

    const newMessage = await Message.create({
        senderId,
        receiverId,
        text,
        image,
        delivered: isDelivered,
        deliveredAt: isDelivered ? new Date() : null,
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
                lastSeen: '$partner.lastSeen',
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

export const getMessagesService = async (currentUserId, partnerId, { before, limit = 25 } = {}) => {
    await Message.updateMany(
        { senderId: partnerId, receiverId: currentUserId, seen: false },
        { $set: { seen: true, seenAt: new Date() } }
    );

    const query = {
        $or: [
            { senderId: currentUserId, receiverId: partnerId },
            { senderId: partnerId, receiverId: currentUserId },
        ],
        deletedBy: { $ne: currentUserId },
    };
    if (before) {
        query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(Math.min(Number(limit) || 25, 50));

    return messages.reverse();
};

export const editMessageService = async (messageId, userId, newText) => {
    if (!newText?.trim()) throw new CustomError('Message text cannot be empty', 400);
    const message = await Message.findById(messageId);
    if (!message) throw new CustomError('Message not found', 404);
    if (message.senderId.toString() !== userId.toString()) {
        throw new CustomError('Unauthorized to edit this message', 403);
    }
    const editWindow = 15 * 60 * 1000;
    if (Date.now() - new Date(message.createdAt).getTime() > editWindow) {
        throw new CustomError('Editing window (15 minutes) has expired', 400);
    }
    message.text = newText.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();
    return message;
};

export const deleteMessageService = async (messageId, userId, deleteType = 'forEveryone') => {
    const message = await Message.findById(messageId);
    if (!message) throw new CustomError('Message not found', 404);
    if (deleteType === 'forEveryone') {
        if (message.senderId.toString() !== userId.toString()) {
            throw new CustomError('Unauthorized to delete for everyone', 403);
        }
        message.isDeletedForEveryone = true;
        message.text = 'This message was deleted';
        message.image = null;
        await message.save();
        return { message, deleteType: 'forEveryone' };
    }
    if (!message.deletedBy.includes(userId)) {
        message.deletedBy.push(userId);
        await message.save();
    }
    return { message, deleteType: 'forMe' };
};
