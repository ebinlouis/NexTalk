import { Server } from 'socket.io';

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

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) userSocketMap[userId] = socket.id;

        io.emit('getOnlineUsers', Object.keys(userSocketMap));

        socket.on('markMessagesAsSeen', ({ senderId, receiverId }) => {
            const senderSocketId = getReceiverSocketId(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit('messagesSeen', { partnerId: receiverId });
            }
        });

        socket.on('disconnect', () => {
            if (userId) delete userSocketMap[userId];
            io.emit('getOnlineUsers', Object.keys(userSocketMap));
        });
    });

    return io;
};
