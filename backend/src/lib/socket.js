import { Server } from 'socket.io';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import ConversationMember from '../models/conversationMember.model.js';

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
                const userConvs = await ConversationMember.find({ userId }).distinct('conversationId');
                userConvs.forEach((convId) => {
                    socket.join(convId.toString());
                });
            } catch (err) {
                console.error('Room auto-join error:', err.message);
            }
        }

        socket.on('joinConversation', (conversationId) => {
            if (conversationId) socket.join(conversationId.toString());
        });

        io.emit('getOnlineUsers', Object.keys(userSocketMap));

        socket.on('typing', ({ conversationId, senderId, senderName }) => {
            if (conversationId) {
                socket.to(conversationId.toString()).emit('partnerTyping', { conversationId, senderId, senderName });
            }
        });

        socket.on('stopTyping', ({ conversationId, senderId }) => {
            if (conversationId) {
                socket.to(conversationId.toString()).emit('partnerStoppedTyping', { conversationId, senderId });
            }
        });

        socket.on('conversationRead', ({ conversationId, userId }) => {
            if (conversationId) {
                socket.to(conversationId.toString()).emit('conversationRead', { conversationId, userId, readAt: new Date() });
            }
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
