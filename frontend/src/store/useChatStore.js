import { create } from 'zustand';
import api from '../lib/api';

export const useChatStore = create((set) => ({
    contacts: [],
    isLoadingContacts: false,

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

    users: [],
    isLoadingUsers: false,

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
}));
