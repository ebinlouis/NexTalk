import { ArrowLeft } from 'lucide-react';
import { getInitials } from '../../utils/getInitials';

/**
 * Top bar of the active conversation pane with mobile back navigation and partner details.
 */
export default function ChatHeader({ selectedUser, onBack }) {
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
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold relative border border-line shrink-0">
                    <span className="text-xs">
                        {selectedUser.profilePic || getInitials(selectedUser.fullName)}
                    </span>
                </div>
                <div className="text-left">
                    <h4 className="text-sm md:text-base font-semibold tracking-tight text-ink">
                        {selectedUser.fullName}
                    </h4>
                    <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-success inline-block animate-pulse" />
                        active now
                    </p>
                </div>
            </div>
        </div>
    );
}
