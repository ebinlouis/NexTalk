import { useState, useEffect, useRef } from 'react';
import { Check, CheckCheck, Pencil, Trash2, Ban, Check as CheckIcon, X as CancelIcon, Clock, RotateCw, FileText, Download } from 'lucide-react';
import MessageInfoModal from './MessageInfoModal';
import ImageLightboxModal from './ImageLightboxModal';
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
    const containerRef = useRef(null);
    const lastMsgIdRef = useRef(null);
    const [selectedMessageInfo, setSelectedMessageInfo] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editText, setEditText] = useState('');
    const [mountTime] = useState(() => Date.now());
    const [lightboxImage, setLightboxImage] = useState(null);
    const { editMessage, deleteMessage, retrySendMessage, hasMoreMessages, isLoadingMore, loadOlderMessages } = useChatStore();

    const handleSaveEdit = async (msgId) => {
        if (!editText.trim()) return;
        await editMessage(msgId, editText.trim());
        setEditingMessageId(null);
    };

    const handleScroll = async (e) => {
        if (e.currentTarget.scrollTop === 0 && hasMoreMessages && !isLoadingMore && messages.length > 0) {
            const partnerId = messages[0].senderId === currentUserId ? messages[0].receiverId : messages[0].senderId;
            if (!partnerId) return;
            const prevHeight = e.currentTarget.scrollHeight;
            await loadOlderMessages(partnerId);
            requestAnimationFrame(() => {
                if (containerRef.current) {
                    containerRef.current.scrollTop = containerRef.current.scrollHeight - prevHeight;
                }
            });
        }
    };

    useEffect(() => {
        const latestMsg = messages[messages.length - 1];
        if (latestMsg && latestMsg._id !== lastMsgIdRef.current) {
            lastMsgIdRef.current = latestMsg._id;
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div ref={containerRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4 bg-canvas custom-scrollbar flex flex-col">
            {isLoadingMore && (
                <div className="flex items-center justify-center py-1">
                    <span className="text-xs text-muted animate-pulse font-medium">Loading older messages...</span>
                </div>
            )}
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
                                        {msg.image && (
                                            <div className="mb-2 rounded-xl overflow-hidden border border-line/40">
                                                <img
                                                    src={msg.image}
                                                    alt="Shared media"
                                                    onClick={() => setLightboxImage(msg.image)}
                                                    className="max-w-[260px] md:max-w-[320px] max-h-[280px] w-full object-cover rounded-xl hover:opacity-95 transition-opacity cursor-pointer"
                                                />
                                            </div>
                                        )}
                                        {msg.fileUrl && (
                                            <a
                                                href={msg.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={msg.fileName || 'download'}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-3 p-2.5 mb-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-colors group/file text-left max-w-[280px]"
                                            >
                                                <div className="w-9 h-9 rounded-lg bg-teal-50 text-primary flex items-center justify-center shrink-0">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-ink truncate group-hover/file:text-primary transition-colors">
                                                        {msg.fileName || 'Document'}
                                                    </p>
                                                    {msg.fileSize && (
                                                        <p className="text-[10px] text-muted">
                                                            {(msg.fileSize / (1024 * 1024)).toFixed(1)} MB
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-white transition-colors shrink-0">
                                                    <Download size={14} />
                                                </div>
                                            </a>
                                        )}
                                        <div className="flex items-start justify-between gap-2">
                                            {msg.text && (
                                                <p onClick={() => setSelectedMessageInfo(msg)} className="text-slate-800 cursor-pointer flex-1">
                                                    {renderHighlightedText(msg.text, searchQuery)}
                                                </p>
                                            )}
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
                                                msg.status === 'failed' ? (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            retrySendMessage(msg._id);
                                                        }}
                                                        className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 font-medium cursor-pointer"
                                                        title="Failed to send. Click to retry."
                                                    >
                                                        <RotateCw size={11} />
                                                        <span>Retry</span>
                                                    </button>
                                                ) : msg.status === 'sending' ? (
                                                    <Clock size={12} className="text-slate-400 animate-pulse" title="Sending..." />
                                                ) : msg.seen ? (
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

            {lightboxImage && (
                <ImageLightboxModal
                    imageUrl={lightboxImage}
                    onClose={() => setLightboxImage(null)}
                />
            )}
        </div>
    );
}
