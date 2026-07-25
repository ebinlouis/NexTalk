import { create } from 'zustand';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await api.get('/api/auth/check');
            set({ authUser: res.data.data });
        } catch (error) {
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

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

    logout: async () => {
        try {
            await api.post('/api/auth/logout');
            set({ authUser: null });
            toast.success('Logged out successfully');
            return { success: true };
        } catch (error) {
            toast.error('Failed to logout');
            return { success: false };
        }
    },
}));
