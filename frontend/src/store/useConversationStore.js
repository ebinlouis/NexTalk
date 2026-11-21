import { create } from 'zustand';
import api from '../lib/api';
import { useAuthStore } from './useAuthStore';
import toast from 'react-hot-toast';

export const useConversationStore = create((set, get) => ({
    conversations: [],
    activeConversation: null,
    groupMembers: [],
    isLoadingConversations: false,
    isCreatingGroup: false,
    isLoadingMembers: false,

    getConversations: async () => {
        set({ isLoadingConversations: true });
        try {
            const res = await api.get('/api/conversations');
            set({ conversations: res.data.data });
        } catch (error) {
            console.error('Failed to load conversations:', error.message);
        } finally {
            set({ isLoadingConversations: false });
        }
    },

    setActiveConversation: (conversation) => {
        set({ activeConversation: conversation });
        if (conversation) {
            get().markAsRead(conversation._id);
            if (conversation.type === 'group') {
                get().getGroupMembers(conversation._id);
            } else {
                set({ groupMembers: [] });
            }
        } else {
            set({ groupMembers: [] });
        }
    },

    getOrCreateDirect: async (targetUserId) => {
        try {
            const res = await api.post('/api/conversations/direct', { targetUserId });
            const directConv = res.data.data;
            await get().getConversations();
            const populated = get().conversations.find((c) => c._id === directConv._id) || directConv;
            get().setActiveConversation(populated);
            return { success: true, data: populated };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to start conversation';
            toast.error(message);
            return { success: false, error: message };
        }
    },

    getGroupMembers: async (conversationId) => {
        set({ isLoadingMembers: true });
        try {
            const res = await api.get(`/api/conversations/${conversationId}/members`);
            set({ groupMembers: res.data.data });
        } catch (error) {
            console.error('Failed to load group members:', error.message);
        } finally {
            set({ isLoadingMembers: false });
        }
    },

    createGroup: async ({ name, description, memberIds, avatar }) => {
        set({ isCreatingGroup: true });
        try {
            const res = await api.post('/api/conversations/groups', {
                name,
                description,
                memberIds,
                avatar,
            });
            const newGroup = res.data.data;
            set((state) => ({ conversations: [newGroup, ...state.conversations] }));
            get().setActiveConversation(newGroup);
            toast.success('Group created successfully!');
            return { success: true, data: newGroup };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create group';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            set({ isCreatingGroup: false });
        }
    },

    addGroupMembers: async (conversationId, memberIds) => {
        try {
            const res = await api.post(`/api/conversations/${conversationId}/members`, { memberIds });
            set({ groupMembers: res.data.data.members });
            toast.success('Members added successfully');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add members';
            toast.error(message);
            return { success: false, error: message };
        }
    },

    removeGroupMember: async (conversationId, userId) => {
        try {
            await api.delete(`/api/conversations/${conversationId}/members/${userId}`);
            set((state) => ({
                groupMembers: state.groupMembers.filter((m) => m.userId._id !== userId),
            }));
            toast.success('Member removed');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to remove member';
            toast.error(message);
            return { success: false, error: message };
        }
    },

    leaveGroup: async (conversationId) => {
        try {
            await api.post(`/api/conversations/${conversationId}/leave`);
            set((state) => ({
                conversations: state.conversations.filter((c) => c._id !== conversationId),
                activeConversation: null,
                groupMembers: [],
            }));
            toast.success('Left group');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to leave group';
            toast.error(message);
            return { success: false, error: message };
        }
    },

    updateMemberRole: async (conversationId, userId, role) => {
        try {
            await api.patch(`/api/conversations/${conversationId}/members/${userId}/role`, { role });
            set((state) => ({
                groupMembers: state.groupMembers.map((m) =>
                    m.userId._id === userId ? { ...m, role } : m
                ),
            }));
            toast.success('Role updated');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update role';
            toast.error(message);
            return { success: false, error: message };
        }
    },

    updateGroupSettings: async (conversationId, updateData) => {
        try {
            const res = await api.patch(`/api/conversations/${conversationId}`, updateData);
            const updated = res.data.data;
            set((state) => ({
                conversations: state.conversations.map((c) =>
                    c._id === conversationId ? { ...c, ...updated } : c
                ),
                activeConversation:
                    state.activeConversation?._id === conversationId
                        ? { ...state.activeConversation, ...updated }
                        : state.activeConversation,
            }));
            toast.success('Settings updated');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update settings';
            toast.error(message);
            return { success: false, error: message };
        }
    },

    markAsRead: async (conversationId) => {
        try {
            await api.post(`/api/conversations/${conversationId}/read`);
            const authUser = useAuthStore.getState().authUser;
            const socket = useAuthStore.getState().socket;
            if (socket && authUser) {
                socket.emit('conversationRead', {
                    conversationId,
                    userId: authUser._id || authUser.id,
                });
            }
            set((state) => ({
                conversations: state.conversations.map((c) =>
                    c._id === conversationId ? { ...c, unreadCount: 0 } : c
                ),
            }));
        } catch (error) {
            console.error('Failed to mark conversation as read:', error.message);
        }
    },

    subscribeToConversationEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on('newConversation', (conv) => {
            set((state) => {
                if (state.conversations.some((c) => c._id === conv._id)) return state;
                return { conversations: [conv, ...state.conversations] };
            });
            socket.emit('joinConversation', conv._id);
        });

        socket.on('membersAdded', ({ conversationId, members }) => {
            set((state) => {
                const isCurrent = state.activeConversation?._id === conversationId;
                return {
                    conversations: state.conversations.map((c) =>
                        c._id === conversationId ? { ...c, memberCount: members.length } : c
                    ),
                    groupMembers: isCurrent ? members : state.groupMembers,
                };
            });
        });

        socket.on('memberRemoved', ({ conversationId, removedUserId }) => {
            const authUser = useAuthStore.getState().authUser;
            const currentUserId = authUser?._id || authUser?.id;

            if (currentUserId === removedUserId) {
                set((state) => ({
                    conversations: state.conversations.filter((c) => c._id !== conversationId),
                    activeConversation:
                        state.activeConversation?._id === conversationId
                            ? null
                            : state.activeConversation,
                    groupMembers:
                        state.activeConversation?._id === conversationId ? [] : state.groupMembers,
                }));
            } else {
                set((state) => ({
                    groupMembers: state.groupMembers.filter(
                        (m) => (m.userId?._id || m.userId) !== removedUserId
                    ),
                    conversations: state.conversations.map((c) =>
                        c._id === conversationId
                            ? { ...c, memberCount: Math.max(0, (c.memberCount || 1) - 1) }
                            : c
                    ),
                }));
            }
        });

        socket.on('memberLeft', ({ conversationId, userId }) => {
            set((state) => ({
                groupMembers: state.groupMembers.filter(
                    (m) => (m.userId?._id || m.userId) !== userId
                ),
                conversations: state.conversations.map((c) =>
                    c._id === conversationId
                        ? { ...c, memberCount: Math.max(0, (c.memberCount || 1) - 1) }
                        : c
                ),
            }));
        });

        socket.on('roleUpdated', ({ targetUserId, newRole }) => {
            set((state) => ({
                groupMembers: state.groupMembers.map((m) =>
                    (m.userId?._id || m.userId) === targetUserId ? { ...m, role: newRole } : m
                ),
            }));
        });

        socket.on('groupUpdated', (updated) => {
            set((state) => ({
                conversations: state.conversations.map((c) =>
                    c._id === updated._id ? { ...c, ...updated } : c
                ),
                activeConversation:
                    state.activeConversation?._id === updated._id
                        ? { ...state.activeConversation, ...updated }
                        : state.activeConversation,
            }));
        });
    },

    unsubscribeFromConversationEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off('newConversation');
        socket.off('membersAdded');
        socket.off('memberRemoved');
        socket.off('memberLeft');
        socket.off('roleUpdated');
        socket.off('groupUpdated');
    },
}));
