import { useState, useEffect } from 'react';
import {
    X,
    Users,
    UserPlus,
    UserMinus,
    Shield,
    ShieldCheck,
    LogOut,
    Search,
    Loader2,
} from 'lucide-react';
import { useConversationStore } from '../../store/useConversationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { getInitials } from '../../utils/getInitials';

export default function GroupInfoDrawer({ isOpen, onClose, conversation }) {
    const {
        groupMembers,
        isLoadingMembers,
        getGroupMembers,
        updateMemberRole,
        removeGroupMember,
        leaveGroup,
        addGroupMembers,
    } = useConversationStore();
    const { authUser } = useAuthStore();
    const { contacts, getContacts } = useChatStore();

    const [isAdding, setIsAdding] = useState(false);
    const [selectedNewMembers, setSelectedNewMembers] = useState([]);
    const [memberSearch, setMemberSearch] = useState('');

    useEffect(() => {
        if (isOpen && conversation?._id) {
            getGroupMembers(conversation._id);
            getContacts();
        }
    }, [isOpen, conversation?._id, getGroupMembers, getContacts]);

    if (!isOpen || !conversation) return null;

    const currentUserId = (authUser?._id || authUser?.id)?.toString();
    const myMembership = groupMembers.find(
        (m) => (m.userId?._id || m.userId)?.toString() === currentUserId
    );
    const isCreator = myMembership?.role === 'creator';
    const isAdmin = myMembership?.role === 'admin' || isCreator;

    const existingMemberIds = new Set(
        groupMembers.map((m) => (m.userId?._id || m.userId)?.toString())
    );
    const availableContacts = contacts.filter((c) => !existingMemberIds.has(c._id?.toString()));

    const handleAddSelected = async () => {
        if (selectedNewMembers.length === 0) return;
        const res = await addGroupMembers(conversation._id, selectedNewMembers);
        if (res?.success) {
            setSelectedNewMembers([]);
            setIsAdding(false);
        }
    };

    const handleLeave = async () => {
        if (window.confirm('Are you sure you want to leave this group?')) {
            const res = await leaveGroup(conversation._id);
            if (res?.success) onClose();
        }
    };

    const handleRemove = async (userId, userName) => {
        if (window.confirm(`Remove ${userName} from the group?`)) {
            await removeGroupMember(conversation._id, userId);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full sm:w-96 h-full bg-white shadow-2xl border-l border-line flex flex-col animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="p-4 border-b border-line flex items-center justify-between">
                    <h3 className="font-bold text-ink flex items-center gap-2">
                        <Users size={18} className="text-primary" />
                        Group Info
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-muted hover:text-ink hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Group Profile */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-2xl overflow-hidden ring-4 ring-slate-100 shadow-sm mb-3">
                            {conversation.avatar ? (
                                <img
                                    src={conversation.avatar}
                                    alt={conversation.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Users size={32} />
                            )}
                        </div>
                        <h4 className="text-base font-bold text-ink">{conversation.name}</h4>
                        <p className="text-xs text-muted mt-1 max-w-[260px]">
                            {conversation.description || 'No description provided.'}
                        </p>
                        <span className="text-[11px] text-muted/70 mt-2">
                            Created {new Date(conversation.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Member List Header & Actions */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h5 className="text-xs font-bold text-ink uppercase tracking-wider">
                                Members ({groupMembers.length})
                            </h5>
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(!isAdding)}
                                    className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                                >
                                    <UserPlus size={14} />
                                    {isAdding ? 'Cancel' : 'Add Members'}
                                </button>
                            )}
                        </div>

                        {/* Add Members Picker */}
                        {isAdding && (
                            <div className="p-3 bg-slate-50 border border-line rounded-xl mb-3 space-y-2">
                                <p className="text-xs font-semibold text-ink">Select contacts to add:</p>
                                {availableContacts.length === 0 ? (
                                    <p className="text-xs text-muted py-2">All contacts are already members</p>
                                ) : (
                                    <div className="max-h-36 overflow-y-auto space-y-1">
                                        {availableContacts.map((contact) => {
                                            const isSelected = selectedNewMembers.includes(contact._id);
                                            return (
                                                <div
                                                    key={contact._id}
                                                    onClick={() =>
                                                        setSelectedNewMembers((prev) =>
                                                            isSelected
                                                                ? prev.filter((id) => id !== contact._id)
                                                                : [...prev, contact._id]
                                                        )
                                                    }
                                                    className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer ${
                                                        isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-white'
                                                    }`}
                                                >
                                                    <span>{contact.fullName}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        readOnly
                                                        className="checkbox checkbox-xs checkbox-primary"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={handleAddSelected}
                                    disabled={selectedNewMembers.length === 0}
                                    className="w-full py-1.5 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                                >
                                    Add Selected ({selectedNewMembers.length})
                                </button>
                            </div>
                        )}

                        {/* Search in Members */}
                        <div className="relative mb-2">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                placeholder="Search members..."
                                className="w-full text-xs pl-7 pr-3 py-1.5 rounded-lg border border-line bg-surface text-ink focus:outline-none"
                            />
                        </div>

                        {/* Roster */}
                        {isLoadingMembers ? (
                            <div className="py-6 flex justify-center text-muted">
                                <Loader2 size={20} className="animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-1 divide-y divide-line/30">
                                {groupMembers
                                    .filter((m) =>
                                        m.userId?.fullName
                                            ?.toLowerCase()
                                            .includes(memberSearch.toLowerCase())
                                    )
                                    .map((member) => {
                                        const user = member.userId;
                                        if (!user) return null;
                                        const isSelf = user._id?.toString() === currentUserId;

                                        return (
                                            <div
                                                key={member._id}
                                                className="flex items-center justify-between py-2 pt-2.5"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                                                        {user.profilePic ? (
                                                            <img
                                                                src={user.profilePic}
                                                                alt={user.fullName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            getInitials(user.fullName)
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-semibold text-ink truncate">
                                                                {user.fullName}
                                                            </span>
                                                            {isSelf && (
                                                                <span className="text-[10px] text-muted">(You)</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-muted truncate">
                                                            {user.status || 'Available'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span
                                                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                                            member.role === 'creator'
                                                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                                : member.role === 'admin'
                                                                ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                                                : 'bg-slate-100 text-muted'
                                                        }`}
                                                    >
                                                        {member.role === 'creator'
                                                            ? 'Creator'
                                                            : member.role === 'admin'
                                                            ? 'Admin'
                                                            : 'Member'}
                                                    </span>

                                                    {/* Creator / Admin Controls */}
                                                    {isCreator && !isSelf && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateMemberRole(
                                                                    conversation._id,
                                                                    user._id,
                                                                    member.role === 'admin' ? 'member' : 'admin'
                                                                )
                                                            }
                                                            className="p-1 text-muted hover:text-primary rounded cursor-pointer"
                                                            title={
                                                                member.role === 'admin'
                                                                    ? 'Demote to Member'
                                                                    : 'Promote to Admin'
                                                            }
                                                        >
                                                            {member.role === 'admin' ? (
                                                                <Shield size={14} />
                                                            ) : (
                                                                <ShieldCheck size={14} />
                                                            )}
                                                        </button>
                                                    )}

                                                    {isAdmin && !isSelf && member.role !== 'creator' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemove(user._id, user.fullName)}
                                                            className="p-1 text-muted hover:text-rose-600 rounded cursor-pointer"
                                                            title="Remove from group"
                                                        >
                                                            <UserMinus size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-line bg-slate-50">
                    <button
                        type="button"
                        onClick={handleLeave}
                        className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                        <LogOut size={16} />
                        Leave Group
                    </button>
                </div>
            </div>
        </div>
    );
}
