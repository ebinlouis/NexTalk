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
}));
