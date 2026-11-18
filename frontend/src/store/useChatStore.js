import { create } from 'zustand';
import api from '../lib/api';

export const useChatStore = create((set) => ({
    contacts: [],
    isLoadingContacts: false,
    messages: [],
    isLoadingMessages: false,
    isSendingMessage: false,
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
            set({ messages: res.data.data });
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
            set((state) => ({ messages: [...state.messages, res.data.data] }));
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send message';
            console.error('Failed to send message:', message);
            return { success: false, error: message };
        } finally {
            set({ isSendingMessage: false });
        }
    },
}));
