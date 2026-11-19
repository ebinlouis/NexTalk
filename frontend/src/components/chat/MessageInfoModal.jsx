import { X, Check, CheckCheck } from 'lucide-react';

/**
 * WhatsApp-style modal displaying delivery and read status timestamps for a message.
 */
export default function MessageInfoModal({ message, onClose }) {
    if (!message) return null;

    const deliveredTime =
        message.delivered && message.deliveredAt
            ? new Date(message.deliveredAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
              })
            : message.delivered
              ? 'Delivered'
              : 'Not delivered yet';

    const readTime =
        message.seen && message.seenAt
            ? new Date(message.seenAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
              })
            : message.seen
              ? 'Read'
              : 'Not seen yet';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-line overflow-hidden animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-line flex items-center justify-between bg-slate-50/70">
                    <h3 className="text-sm font-semibold text-ink">Message Info</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-muted hover:text-ink hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Message Preview */}
                <div className="p-5">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-ink leading-relaxed break-words mb-5">
                        {message.text}
                    </div>

                    {/* Status Breakdown */}
                    <div className="space-y-4">
                        {/* Read Status */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <CheckCheck
                                    size={18}
                                    className={message.seen ? 'text-emerald-500' : 'text-slate-300'}
                                />
                                <div>
                                    <p className="text-xs font-semibold text-ink">Read</p>
                                    <p className="text-[11px] text-muted">{readTime}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100" />

                        {/* Delivered Status */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                {message.delivered ? (
                                    <CheckCheck size={18} className="text-slate-400" />
                                ) : (
                                    <Check size={18} className="text-slate-300" />
                                )}
                                <div>
                                    <p className="text-xs font-semibold text-ink">Delivered</p>
                                    <p className="text-[11px] text-muted">{deliveredTime}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
