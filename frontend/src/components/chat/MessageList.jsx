import { useState, useEffect, useRef } from 'react';
import { Check, CheckCheck, Pencil, Trash2, Ban, Check as CheckIcon, X as CancelIcon } from 'lucide-react';
import MessageInfoModal from './MessageInfoModal';
import { useChatStore } from '../../store/useChatStore';

const renderHighlightedText = (text, query) => {
    if (!query?.trim() || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
        regex.test(part) ? (
            <mark key={i} className="bg-amber-200 text-ink rounded-xs px-0.5 font-medium">
                {part}
            </mark>
        ) : (
            part
        )
    );
};

/**
 * Scrollable conversation feed with encryption badge, loading/empty states, and auto-scroll.
 */
export default function MessageList({ messages, isLoading, currentUserId, partnerName, searchQuery = '' }) {
    const messagesEndRef = useRef(null);
    const [selectedMessageInfo, setSelectedMessageInfo] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editText, setEditText] = useState('');
    const [mountTime] = useState(() => Date.now());
    const { editMessage, deleteMessage } = useChatStore();

    const handleSaveEdit = async (msgId) => {
        if (!editText.trim()) return;
        await editMessage(msgId, editText.trim());
        setEditingMessageId(null);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4 bg-canvas custom-scrollbar flex flex-col">
            <div className="flex items-center justify-center my-2">
                <div className="bg-white border border-slate-200/80 text-muted text-xs px-3.5 py-1 rounded-full shadow-xs font-medium">
                    Today, End-to-End Encrypted
                </div>
            </div>
            {searchQuery.trim() && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3 py-1.5 rounded-xl text-center font-medium">
                    Found {messages.filter((m) => m.text?.toLowerCase().includes(searchQuery.toLowerCase())).length} matches for &quot;{searchQuery}&quot;
                </div>
            )}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center text-xs text-muted">
                    Loading messages...
                </div>
            ) : messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-xs text-muted">
                    No messages yet. Say hello!
                </div>
            ) : (
                messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                        <div
                            key={msg._id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                            {!isMe && (
                                <span className="text-xs font-semibold text-slate-700 mb-1 px-1">
                                    {msg.senderName || partnerName || 'Contact'}
                                </span>
                            )}
                            <div
                                className={`animate-message relative group max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed text-left border border-slate-200/80 bg-white text-ink shadow-xs transition-all ${
                                    isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'
                                }`}
                            >
                                {msg.isDeletedForEveryone ? (
                                    <div className="flex items-center gap-1.5 text-xs text-muted italic py-1">
                                        <Ban size={13} className="text-slate-400" />
                                        <span>This message was deleted</span>
                                    </div>
                                ) : editingMessageId === msg._id ? (
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="text"
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="bg-slate-50 border border-line rounded-lg px-2.5 py-1 text-xs text-ink outline-none focus:border-primary"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveEdit(msg._id);
                                                if (e.key === 'Escape') setEditingMessageId(null);
                                            }}
                                        />
                                        <div className="flex items-center justify-end gap-1.5 text-xs">
                                            <button
                                                type="button"
                                                onClick={() => setEditingMessageId(null)}
                                                className="p-1 text-muted hover:text-ink cursor-pointer"
                                                title="Cancel"
                                            >
                                                <CancelIcon size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSaveEdit(msg._id)}
                                                className="p-1 text-teal-600 hover:text-teal-700 cursor-pointer font-medium"
                                                title="Save"
                                            >
                                                <CheckIcon size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-start justify-between gap-2">
                                            <p onClick={() => setSelectedMessageInfo(msg)} className="text-slate-800 cursor-pointer flex-1">
                                                {renderHighlightedText(msg.text, searchQuery)}
                                            </p>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                {isMe && mountTime - new Date(msg.createdAt).getTime() < 15 * 60 * 1000 && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingMessageId(msg._id);
                                                            setEditText(msg.text);
                                                        }}
                                                        className="p-1 text-muted hover:text-ink cursor-pointer"
                                                        title="Edit message"
                                                    >
                                                        <Pencil size={12} />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const deleteType = isMe && window.confirm('Delete for everyone? (Cancel to delete for me only)') ? 'forEveryone' : 'forMe';
                                                        deleteMessage(msg._id, deleteType);
                                                    }}
                                                    className="p-1 text-muted hover:text-danger cursor-pointer"
                                                    title="Delete message"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <div onClick={() => setSelectedMessageInfo(msg)} className="flex items-center justify-end gap-1.5 mt-1 text-[11px] text-muted cursor-pointer">
                                            {msg.isEdited && <span className="text-[10px] text-muted italic">edited</span>}
                                            <span>
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                            {isMe && (
                                                msg.seen ? (
                                                    <CheckCheck size={14} className="text-emerald-500" title="Read" />
                                                ) : msg.delivered ? (
                                                    <CheckCheck size={14} className="text-slate-400" title="Delivered" />
                                                ) : (
                                                    <Check size={14} className="text-slate-400" title="Sent" />
                                                )
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
            <div ref={messagesEndRef} />

            {selectedMessageInfo && (
                <MessageInfoModal
                    message={selectedMessageInfo}
                    onClose={() => setSelectedMessageInfo(null)}
                />
            )}
        </div>
    );
}
