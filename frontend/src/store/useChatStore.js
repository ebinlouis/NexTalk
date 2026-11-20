import { create } from 'zustand';
import api from '../lib/api';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set) => ({
    contacts: [],
    isLoadingContacts: false,
    messages: [],
    isLoadingMessages: false,
    isSendingMessage: false,
    isPartnerTyping: false,
    users: [],
    isLoadingUsers: false,

    getContacts: async () => {
        set({ isLoadingContacts: true });
        try {
            const res = await api.get('/api/messages/contacts');
            set({ contacts: res.data.data });
        } catch (error) {
            console.error('Failed to load contacts:', error.message);
        } finally {
            set({ isLoadingContacts: false });
        }
    },

    getUsers: async () => {
        set({ isLoadingUsers: true });
        try {
            const res = await api.get('/api/messages/users');
            set({ users: res.data.data });
        } catch (error) {
            console.error('Failed to load chatted users:', error.message);
        } finally {
            set({ isLoadingUsers: false });
        }
    },

    getMessages: async (userId) => {
        set({ isLoadingMessages: true });
        try {
            const res = await api.get(`/api/messages/${userId}`);
            const authUser = useAuthStore.getState().authUser;
            const socket = useAuthStore.getState().socket;
            if (socket && authUser) {
                socket.emit('markMessagesAsSeen', {
                    senderId: userId,
                    receiverId: authUser._id || authUser.id,
                });
            }
            set((state) => ({
                messages: res.data.data,
                users: state.users.map((u) => (u._id === userId ? { ...u, unreadCount: 0 } : u)),
            }));
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to load messages';
            console.error('Failed to load messages:', message);
            return { success: false, error: message };
        } finally {
            set({ isLoadingMessages: false });
        }
    },

    sendMessage: async (userId, messageData) => {
        set({ isSendingMessage: true });
        try {
            const res = await api.post(`/api/messages/send/${userId}`, messageData);
            const sentMsg = res.data.data;
            set((state) => ({
                messages: [...state.messages, sentMsg],
                users: state.users.map((u) =>
                    u._id === userId
                        ? {
                              ...u,
                              lastMessage: {
                                  text: sentMsg.text,
                                  senderId: sentMsg.senderId,
                                  createdAt: sentMsg.createdAt,
                              },
                          }
                        : u
                ),
            }));
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send message';
            console.error('Failed to send message:', message);
            return { success: false, error: message };
        } finally {
            set({ isSendingMessage: false });
        }
    },

    subscribeToMessages: (selectedUserId) => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off('newMessage');
        socket.on('newMessage', (newMessage) => {
            const isFromSelected = newMessage.senderId === selectedUserId;
            if (isFromSelected) {
                const authUser = useAuthStore.getState().authUser;
                socket.emit('markMessagesAsSeen', {
                    senderId: selectedUserId,
                    receiverId: authUser?._id || authUser?.id,
                });
            }
            set((state) => ({
                messages: isFromSelected ? [...state.messages, newMessage] : state.messages,
                users: state.users.map((u) =>
                    u._id === newMessage.senderId
                        ? {
                              ...u,
                              lastMessage: {
                                  text: newMessage.text,
                                  senderId: newMessage.senderId,
                                  createdAt: newMessage.createdAt,
                              },
                              unreadCount: isFromSelected ? 0 : (u.unreadCount || 0) + 1,
                          }
                        : u
                ),
            }));
        });

        socket.off('messagesDelivered');
        socket.on('messagesDelivered', ({ partnerId }) => {
            if (partnerId === selectedUserId) {
                set((state) => ({
                    messages: state.messages.map((msg) => ({ ...msg, delivered: true })),
                }));
            }
        });

        socket.off('messagesSeen');
        socket.on('messagesSeen', ({ partnerId }) => {
            if (partnerId === selectedUserId) {
                set((state) => ({
                    messages: state.messages.map((msg) => ({ ...msg, seen: true })),
                }));
            }
        });

        socket.off('partnerTyping');
        socket.on('partnerTyping', ({ senderId }) => {
            if (senderId === selectedUserId) set({ isPartnerTyping: true });
        });

        socket.off('partnerStoppedTyping');
        socket.on('partnerStoppedTyping', ({ senderId }) => {
            if (senderId === selectedUserId) set({ isPartnerTyping: false });
        });

        socket.off('userLastSeen');
        socket.on('userLastSeen', ({ userId, lastSeen }) => {
            set((state) => ({
                users: state.users.map((u) => (u._id === userId ? { ...u, lastSeen } : u)),
                contacts: state.contacts.map((c) => (c._id === userId ? { ...c, lastSeen } : c)),
            }));
        });

        socket.off('messageEdited');
        socket.on('messageEdited', (updated) => {
            set((state) => ({
                messages: state.messages.map((m) => (m._id === updated._id ? updated : m)),
            }));
        });

        socket.off('messageDeleted');
        socket.on('messageDeleted', ({ messageId, message }) => {
            set((state) => ({
                messages: state.messages.map((m) => (m._id === messageId ? message : m)),
            }));
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off('newMessage');
        socket?.off('messagesDelivered');
        socket?.off('messagesSeen');
        socket?.off('partnerTyping');
        socket?.off('partnerStoppedTyping');
        socket?.off('userLastSeen');
        socket?.off('messageEdited');
        socket?.off('messageDeleted');
        set({ isPartnerTyping: false });
    },

    sendTyping: (receiverId) => {
        const socket = useAuthStore.getState().socket;
        const authUser = useAuthStore.getState().authUser;
        socket?.emit('typing', { receiverId, senderId: authUser?._id || authUser?.id });
    },

    sendStopTyping: (receiverId) => {
        const socket = useAuthStore.getState().socket;
        const authUser = useAuthStore.getState().authUser;
        socket?.emit('stopTyping', { receiverId, senderId: authUser?._id || authUser?.id });
    },

    editMessage: async (messageId, text) => {
        try {
            const res = await api.put(`/api/messages/${messageId}`, { text });
            set((state) => ({
                messages: state.messages.map((m) => (m._id === messageId ? res.data.data : m)),
            }));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to edit message' };
        }
    },

    deleteMessage: async (messageId, deleteType = 'forEveryone') => {
        try {
            const res = await api.delete(`/api/messages/${messageId}`, { data: { deleteType } });
            if (deleteType === 'forMe') {
                set((state) => ({
                    messages: state.messages.filter((m) => m._id !== messageId),
                }));
            } else {
                set((state) => ({
                    messages: state.messages.map((m) => (m._id === messageId ? res.data.data : m)),
                }));
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Failed to delete message' };
        }
    },
}));
