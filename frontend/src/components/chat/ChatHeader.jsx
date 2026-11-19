import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
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
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold relative border border-line shrink-0 overflow-hidden">
                    {selectedUser.profilePic ? (
                        <img
                            src={selectedUser.profilePic}
                            alt={selectedUser.fullName || ''}
                            className="w-full h-full object-cover rounded-full"
                        />
                    ) : (
                        <span className="text-xs">{getInitials(selectedUser.fullName)}</span>
                    )}
                </div>
                <div className="text-left">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm md:text-base font-semibold tracking-tight text-ink">
                            {selectedUser.fullName}
                        </h4>
                        <span className="px-2 py-0.5 text-[11px] font-medium text-teal-700 bg-teal-50 border border-teal-200/60 rounded-full">
                            {selectedUser.role || 'Member'}
                        </span>
                    </div>
                    <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                        Online
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1 text-muted">
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
