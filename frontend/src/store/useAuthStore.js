import { create } from 'zustand';
import api from '../lib/api';
import toast from 'react-hot-toast';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: true,

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await api.post('/api/auth/signup', data);
            set({ authUser: res.data.data });
            toast.success('Account created successfully!');
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Something went wrong';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await api.post('/api/auth/login', data);
            set({ authUser: res.data.data });
            await delay(2000);
            toast.success('Welcome back!');
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Something went wrong';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            set({ isLoggingIn: false });
        }
    },
}));
