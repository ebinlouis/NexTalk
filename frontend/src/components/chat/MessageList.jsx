import { useEffect, useRef } from 'react';
import { CheckCheck } from 'lucide-react';

/**
 * Scrollable conversation feed with encryption badge, loading/empty states, and auto-scroll.
 */
export default function MessageList({ messages, isLoading, currentUserId }) {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4 bg-canvas custom-scrollbar flex flex-col">
            <div className="flex items-center justify-center my-2">
                <div className="bg-white border border-line text-muted text-xs px-3 py-1 rounded-full shadow-xs font-medium">
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
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`animate-message max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed text-left border border-line bg-white text-ink shadow-xs ${
                                    isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'
                                }`}
                            >
                                <p>{msg.text}</p>
                                <div className="flex items-center justify-end gap-1 mt-1 text-[11px] text-subtle">
                                    <span>
                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                    {isMe && <CheckCheck size={14} className="text-subtle" />}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}
