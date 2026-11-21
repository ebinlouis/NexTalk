import { ArrowLeft, Phone, Video, MoreVertical, Search, X, Users, Info } from 'lucide-react';
import { getInitials } from '../../utils/getInitials';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';

const formatLastSeen = (dateString) => {
    if (!dateString) return 'Offline';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Offline';
    const isToday = new Date().toDateString() === d.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return isToday ? `Last seen today at ${timeStr}` : `Last seen ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
};

/**
 * Top bar of the active conversation pane with mobile back navigation and partner details.
 */
export default function ChatHeader({
    selectedUser,
    onBack,
    searchQuery = '',
    onSearchChange,
    isSearchOpen = false,
    onToggleSearch,
    onOpenGroupInfo,
}) {
    const { onlineUsers } = useAuthStore();
    const { isPartnerTyping } = useChatStore();
    const isGroup = selectedUser?.type === 'group';
    const displayName = selectedUser?.name || selectedUser?.fullName || 'Chat';
    const isOnline = !isGroup && onlineUsers.includes(selectedUser?._id?.toString());

    return (
        <div className="px-5 md:px-6 py-3.5 border-b border-line flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="md:hidden p-1.5 -ml-1 text-muted hover:text-ink hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    aria-label="Back to conversations"
                >
                    <ArrowLeft size={20} />
                </button>
                <div
                    onClick={isGroup ? onOpenGroupInfo : undefined}
                    className={`w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold relative border border-line shrink-0 overflow-hidden ${
                        isGroup ? 'cursor-pointer hover:opacity-90' : ''
                    }`}
                >
                    {isGroup ? (
                        selectedUser.avatar ? (
                            <img
                                src={selectedUser.avatar}
                                alt={displayName}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <Users size={18} className="text-white" />
                        )
                    ) : selectedUser.profilePic ? (
                        <img
                            src={selectedUser.profilePic}
                            alt={selectedUser.fullName || ''}
                            className="w-full h-full object-cover rounded-full"
                        />
                    ) : (
                        <span className="text-xs">{getInitials(selectedUser.fullName)}</span>
                    )}
                </div>
                <div
                    onClick={isGroup ? onOpenGroupInfo : undefined}
                    className={`text-left ${isGroup ? 'cursor-pointer' : ''}`}
                >
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm md:text-base font-semibold tracking-tight text-ink hover:text-primary transition-colors">
                            {displayName}
                        </h4>
                        <span className="px-2 py-0.5 text-[11px] font-medium text-teal-700 bg-teal-50 border border-teal-200/60 rounded-full">
                            {isGroup ? 'Group' : selectedUser.role || 'Member'}
                        </span>
                    </div>
                    {isPartnerTyping ? (
                        <p className="text-xs text-teal-600 font-medium flex items-center gap-1.5 mt-0.5 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block animate-ping" />
                            typing...
                        </p>
                    ) : isGroup ? (
                        <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                            <Users size={12} className="text-muted" />
                            <span>{selectedUser.memberCount || 1} members</span>
                        </p>
                    ) : (
                        <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                            <span
                                className={`w-1.5 h-1.5 rounded-full inline-block ${
                                    isOnline ? 'bg-success animate-pulse' : 'bg-slate-300'
                                }`}
                            />
                            {isOnline ? 'Online' : formatLastSeen(selectedUser.lastSeen)}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1.5 text-muted">
                {isSearchOpen && (
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-line rounded-lg px-2 py-1 text-xs">
                        <Search size={14} className="text-muted" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            placeholder="Search in chat..."
                            className="bg-transparent text-ink placeholder:text-muted outline-none w-28 md:w-36 text-xs"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={onToggleSearch}
                            className="text-muted hover:text-ink cursor-pointer"
                            title="Close search"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}
                <button
                    type="button"
                    onClick={onToggleSearch}
                    className={`p-2 rounded-lg hover:text-ink hover:bg-slate-100 transition-colors cursor-pointer ${
                        isSearchOpen ? 'text-primary bg-slate-100' : ''
                    }`}
                    title="Search messages"
                >
                    <Search size={18} />
                </button>
                <button
                    type="button"
                    className="p-2 rounded-lg hover:text-ink hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Start Voice Call"
                >
                    <Phone size={18} />
                </button>
                <button
                    type="button"
                    className="p-2 rounded-lg hover:text-ink hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Start Video Call"
                >
                    <Video size={18} />
                </button>
                {isGroup && (
                    <button
                        type="button"
                        onClick={onOpenGroupInfo}
                        className="p-2 rounded-lg hover:text-ink hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Group Info & Members"
                    >
                        <Info size={18} />
                    </button>
                )}
                <button
                    type="button"
                    className="p-2 rounded-lg hover:text-ink hover:bg-slate-100 transition-colors cursor-pointer"
                    title="More Options"
                >
                    <MoreVertical size={18} />
                </button>
            </div>
        </div>
    );
}
