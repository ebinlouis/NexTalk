import { useState, useEffect, useRef } from 'react';
import { CheckCheck } from 'lucide-react';
import MessageInfoModal from './MessageInfoModal';

/**
 * Scrollable conversation feed with encryption badge, loading/empty states, and auto-scroll.
 */
export default function MessageList({ messages, isLoading, currentUserId, partnerName }) {
    const messagesEndRef = useRef(null);
    const [selectedMessageInfo, setSelectedMessageInfo] = useState(null);

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
                                onClick={() => setSelectedMessageInfo(msg)}
                                className={`animate-message max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed text-left border border-slate-200/80 bg-white text-ink shadow-xs cursor-pointer hover:border-slate-300 transition-all ${
                                    isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'
                                }`}
                                title="Click to view message info"
                            >
                                <p className="text-slate-800">{msg.text}</p>
                                <div className="flex items-center justify-end gap-1.5 mt-1 text-[11px] text-muted">
                                    <span>
                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                    {isMe && (
                                        <CheckCheck
                                            size={14}
                                            className={msg.seen ? 'text-primary' : 'text-slate-400'}
                                            title={msg.seen ? 'Read' : 'Delivered'}
                                        />
                                    )}
                                </div>
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
