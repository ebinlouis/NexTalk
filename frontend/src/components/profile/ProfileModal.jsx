import { useState } from 'react';
import { X, User, Mail, Loader2, Camera } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { getInitials } from '../../utils/getInitials';

export default function ProfileModal({ isOpen, onClose }) {
    const { authUser, updateProfile, updateAvatar, isUpdatingProfile } = useAuthStore();
    const [fullName, setFullName] = useState(authUser?.fullName || '');
    const [bio, setBio] = useState(authUser?.bio || 'Hey there! I am using NexTalk.');
    const [status, setStatus] = useState(authUser?.status || 'available');
    const [previewAvatar, setPreviewAvatar] = useState(null);

    if (!isOpen) return null;

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setPreviewAvatar(reader.result);
        reader.readAsDataURL(file);
        await updateAvatar(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await updateProfile({ fullName: fullName.trim(), bio: bio.trim(), status });
        if (res?.success) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-line relative animate-in fade-in zoom-in-95 duration-150">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted hover:text-ink cursor-pointer p-1"
                >
                    <X size={18} />
                </button>

                <h3 className="text-lg font-bold text-ink mb-4">Edit Profile</h3>

                <div className="flex flex-col items-center mb-5">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold shadow-sm overflow-hidden ring-4 ring-slate-100">
                            {previewAvatar || authUser?.profilePic ? (
                                <img src={previewAvatar || authUser.profilePic} alt={authUser.fullName} className="w-full h-full object-cover" />
                            ) : (
                                getInitials(authUser?.fullName)
                            )}
                        </div>
                        <label
                            htmlFor="avatar-upload"
                            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-ink text-white hover:bg-primary transition-colors cursor-pointer shadow-md"
                            title="Upload new photo"
                        >
                            <Camera size={14} />
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </label>
                    </div>
                    <span className="text-[11px] text-muted mt-2">Click camera to upload avatar</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                            Full Name
                        </label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-3 text-muted pointer-events-none" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="Your full name"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                            Email (Read-only)
                        </label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3 text-muted pointer-events-none" />
                            <input
                                type="email"
                                value={authUser?.email || ''}
                                disabled
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-100 bg-slate-50 text-muted rounded-xl cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                            Status
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'available', label: 'Available', dot: 'bg-emerald-500' },
                                { id: 'busy', label: 'Busy', dot: 'bg-rose-500' },
                                { id: 'away', label: 'Away', dot: 'bg-amber-500' },
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setStatus(s.id)}
                                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                                        status === s.id
                                            ? 'border-primary bg-teal-50 text-primary shadow-xs'
                                            : 'border-slate-200 text-muted hover:border-slate-300'
                                    }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
                                Bio
                            </label>
                            <span className="text-[10px] text-muted">{bio.length}/150</span>
                        </div>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value.slice(0, 150))}
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none custom-scrollbar"
                            placeholder="Tell others about yourself..."
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-muted hover:text-ink rounded-xl cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdatingProfile}
                            className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {isUpdatingProfile ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
