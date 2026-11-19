import { create } from 'zustand';
import { io } from 'socket.io-client';
import api from '../lib/api';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5001' : '/';

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: true,
    socket: null,
    onlineUsers: [],

    checkAuth: async () => {
        try {
            const res = await api.get('/api/auth/check');
            set({ authUser: res.data.data });
            get().connectSocket();
        } catch {
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            await api.post('/api/auth/signup', data);
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
            get().connectSocket();
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
            get().disconnectSocket();
            set({ authUser: null });
            toast.success('Logged out successfully');
            return { success: true };
        } catch {
            toast.error('Failed to logout');
            return { success: false };
        }
    },

    connectSocket: () => {
        const { authUser, socket } = get();
        if (!authUser || socket?.connected) return;

        const newSocket = io(BASE_URL, {
            query: { userId: authUser._id || authUser.id },
        });
        newSocket.connect();

        set({ socket: newSocket });

        newSocket.on('getOnlineUsers', (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
        set({ socket: null });
    },
}));
