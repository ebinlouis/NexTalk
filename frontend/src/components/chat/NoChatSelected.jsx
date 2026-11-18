import { MessageSquare } from 'lucide-react';

/**
 * Empty state displayed in the chat pane before a conversation is selected.
 */
export default function NoChatSelected() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-accent-mint mb-6 shadow-btn animate-float z-10">
                <MessageSquare size={32} />
            </div>
            <h3 className="text-lg font-bold text-ink mb-2 z-10">Welcome to NexTalk</h3>
            <p className="text-xs text-muted max-w-xs leading-relaxed z-10">
                Select a chat or contact from the left list to begin messaging and sharing.
            </p>
        </div>
    );
}
