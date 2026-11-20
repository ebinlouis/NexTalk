import { create } from 'zustand';
import api from '../lib/api';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
    contacts: [],
    isLoadingContacts: false,
    messages: [],
    isLoadingMessages: false,
    hasMoreMessages: false,
    isLoadingMore: false,
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
                hasMoreMessages: res.data.data.length >= 25,
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

    loadOlderMessages: async (userId) => {
        const { messages, hasMoreMessages, isLoadingMore } = get();
        if (!hasMoreMessages || isLoadingMore || messages.length === 0) return;
        const oldestCreatedAt = messages[0]?.createdAt;
        if (!oldestCreatedAt) return;
        set({ isLoadingMore: true });
        try {
            const res = await api.get(`/api/messages/${userId}?before=${oldestCreatedAt}&limit=25`);
            const older = res.data.data || [];
            set((state) => ({
                messages: [...older, ...state.messages],
                hasMoreMessages: older.length >= 25,
            }));
        } catch (error) {
            console.error('Failed to load older messages:', error.message);
        } finally {
            set({ isLoadingMore: false });
        }
    },

    sendMessage: async (userId, messageData) => {
        set({ isSendingMessage: true });
        const authUser = useAuthStore.getState().authUser;
        const tempId = `temp-${Date.now()}`;
        const tempMsg = {
            _id: tempId,
            senderId: authUser?._id || authUser?.id,
            receiverId: userId,
            text: messageData.text || '',
            image: messageData.image || null,
            status: 'sending',
            createdAt: new Date().toISOString(),
            tempData: messageData,
        };
        set((state) => ({ messages: [...state.messages, tempMsg] }));
        try {
            const res = await api.post(`/api/messages/send/${userId}`, messageData);
            const sentMsg = res.data.data;
            set((state) => ({
                messages: state.messages.map((m) => (m._id === tempId ? sentMsg : m)),
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
            set((state) => ({
                messages: state.messages.map((m) => (m._id === tempId ? { ...m, status: 'failed' } : m)),
            }));
            const message = error.response?.data?.message || 'Failed to send message';
            console.error('Failed to send message:', message);
            return { success: false, error: message };
        } finally {
            set({ isSendingMessage: false });
        }
    },

    retrySendMessage: async (tempId) => {
        const msg = get().messages.find((m) => m._id === tempId);
        if (!msg || !msg.tempData) return;
        set((state) => ({
            messages: state.messages.map((m) => (m._id === tempId ? { ...m, status: 'sending' } : m)),
        }));
        try {
            const res = await api.post(`/api/messages/send/${msg.receiverId}`, msg.tempData);
            const sentMsg = res.data.data;
            set((state) => ({
                messages: state.messages.map((m) => (m._id === tempId ? sentMsg : m)),
            }));
        } catch {
            set((state) => ({
                messages: state.messages.map((m) => (m._id === tempId ? { ...m, status: 'failed' } : m)),
            }));
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
