import { Server } from 'socket.io';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';

const userSocketMap = {}; // { [userId]: socketId }

export const getReceiverSocketId = (userId) => userSocketMap[userId];

export let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: true,
            credentials: true,
        },
    });

    io.on('connection', async (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            userSocketMap[userId] = socket.id;
            try {
                const senders = await Message.distinct('senderId', { receiverId: userId, delivered: false });
                if (senders.length > 0) {
                    await Message.updateMany({ receiverId: userId, delivered: false }, { delivered: true, deliveredAt: new Date() });
                    senders.forEach((sId) => {
                        const sSocket = getReceiverSocketId(sId.toString());
                        if (sSocket) io.to(sSocket).emit('messagesDelivered', { partnerId: userId });
                    });
                }
            } catch (err) {
                console.error('Delivery sync error:', err.message);
            }
        }

        io.emit('getOnlineUsers', Object.keys(userSocketMap));

        socket.on('markMessagesAsSeen', ({ senderId, receiverId }) => {
            const senderSocketId = getReceiverSocketId(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit('messagesSeen', { partnerId: receiverId });
            }
        });

        socket.on('typing', ({ receiverId, senderId }) => {
            const receiverSocket = getReceiverSocketId(receiverId);
            if (receiverSocket) io.to(receiverSocket).emit('partnerTyping', { senderId });
        });

        socket.on('stopTyping', ({ receiverId, senderId }) => {
            const receiverSocket = getReceiverSocketId(receiverId);
            if (receiverSocket) io.to(receiverSocket).emit('partnerStoppedTyping', { senderId });
        });

        socket.on('disconnect', async () => {
            if (userId) {
                delete userSocketMap[userId];
                const lastSeen = new Date();
                try {
                    await User.findByIdAndUpdate(userId, { lastSeen });
                } catch (err) {
                    console.error('Error updating lastSeen on disconnect:', err.message);
                }
                io.emit('userLastSeen', { userId, lastSeen });
            }
            io.emit('getOnlineUsers', Object.keys(userSocketMap));
        });
    });

    return io;
};
