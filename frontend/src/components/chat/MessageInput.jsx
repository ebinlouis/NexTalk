import { SendHorizontal } from 'lucide-react';

/**
 * Bottom message composer form with send button.
 */
export default function MessageInput({ value, onChange, onSubmit, isSending }) {
    return (
        <form onSubmit={onSubmit} className="p-3 md:p-4 border-t border-line bg-white shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={value}
                    onChange={onChange}
                    className="flex-1 bg-slate-50 border border-line text-ink placeholder:text-subtle rounded-xl px-4 py-2.5 md:py-3 text-xs md:text-sm outline-none transition-all focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button
                    type="submit"
                    disabled={!value.trim() || isSending}
                    className="bg-primary hover:bg-primary-hover disabled:opacity-40 text-white px-4 md:px-5 py-2.5 md:py-3 rounded-xl flex items-center gap-2 font-medium text-xs md:text-sm shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
                >
                    <span>Send</span>
                    <SendHorizontal size={16} className="text-teal-200" />
                </button>
            </div>
        </form>
    );
}
