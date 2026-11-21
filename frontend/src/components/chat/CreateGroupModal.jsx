import { useState, useEffect } from 'react';
import { X, Users, Search, Loader2, Check, Camera } from 'lucide-react';
import { useConversationStore } from '../../store/useConversationStore';
import { useChatStore } from '../../store/useChatStore';
import { getInitials } from '../../utils/getInitials';
import api from '../../lib/api';

export default function CreateGroupModal({ isOpen, onClose }) {
    const { createGroup, isCreatingGroup } = useConversationStore();
    const { contacts, getContacts } = useChatStore();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMemberIds, setSelectedMemberIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            getContacts();
        }
    }, [isOpen, getContacts]);

    if (!isOpen) return null;

    const handleClose = () => {
        setName('');
        setDescription('');
        setSelectedMemberIds([]);
        setSearchQuery('');
        setAvatarFile(null);
        setPreviewAvatar(null);
        setIsUploading(false);
        onClose();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onload = () => setPreviewAvatar(reader.result);
        reader.readAsDataURL(file);
    };

    const toggleMember = (userId) => {
        setSelectedMemberIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const filteredContacts = contacts.filter((c) =>
        c.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || selectedMemberIds.length === 0) return;

        let avatarUrl = null;
        if (avatarFile) {
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', avatarFile);
                const uploadRes = await api.post('/api/messages/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                avatarUrl = uploadRes.data?.data?.fileUrl || null;
            } catch (err) {
                console.error('Failed to upload group avatar:', err.message);
            } finally {
                setIsUploading(false);
            }
        }

        const res = await createGroup({
            name: name.trim(),
            description: description.trim(),
            memberIds: selectedMemberIds,
            avatar: avatarUrl,
        });

        if (res?.success) {
            handleClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-line relative animate-in fade-in zoom-in-95 duration-150">
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-muted hover:text-ink cursor-pointer p-1"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-primary/10 text-primary rounded-xl">
                        <Users size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-ink">Create Group</h3>
                        <p className="text-xs text-muted">Start a collaborative conversation</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center mb-1">
                        <div className="relative group cursor-pointer">
                            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-dashed border-primary/40 flex items-center justify-center text-primary overflow-hidden">
                                {previewAvatar ? (
                                    <img src={previewAvatar} alt="Group Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <Users size={24} className="text-primary/70" />
                                )}
                            </div>
                            <label
                                htmlFor="group-avatar-upload"
                                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer shadow-md"
                                title="Upload Group Picture"
                            >
                                <Camera size={12} />
                                <input
                                    id="group-avatar-upload"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </label>
                        </div>
                        <p className="text-[11px] text-muted mt-1">Group Photo (Optional)</p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1">Group Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. NexTalk Core Team"
                            maxLength={60}
                            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-line bg-surface focus:outline-none focus:border-primary transition-colors text-ink"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1">Description (Optional)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this group about?"
                            maxLength={250}
                            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-line bg-surface focus:outline-none focus:border-primary transition-colors text-ink"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-ink">
                                Add Participants * ({selectedMemberIds.length} selected)
                            </label>
                        </div>

                        <div className="relative mb-2">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search contacts..."
                                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-line bg-surface focus:outline-none focus:border-primary text-ink"
                            />
                        </div>

                        <div className="max-h-44 overflow-y-auto space-y-1 border border-line/60 rounded-xl p-1.5 divide-y divide-line/30">
                            {filteredContacts.length === 0 ? (
                                <p className="text-xs text-center text-muted py-4">No contacts found</p>
                            ) : (
                                filteredContacts.map((contact) => {
                                    const isSelected = selectedMemberIds.includes(contact._id);
                                    return (
                                        <div
                                            key={contact._id}
                                            onClick={() => toggleMember(contact._id)}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                                                isSelected ? 'bg-primary/10' : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center overflow-hidden">
                                                    {contact.profilePic ? (
                                                        <img
                                                            src={contact.profilePic}
                                                            alt={contact.fullName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        getInitials(contact.fullName)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-ink">{contact.fullName}</p>
                                                    <p className="text-[10px] text-muted">{contact.email}</p>
                                                </div>
                                            </div>
                                            <div
                                                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                                    isSelected
                                                        ? 'bg-primary border-primary text-white'
                                                        : 'border-line bg-white'
                                                }`}
                                            >
                                                {isSelected && <Check size={12} strokeWidth={3} />}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 py-2.5 rounded-xl border border-line text-sm font-medium text-muted hover:text-ink hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || selectedMemberIds.length === 0 || isCreatingGroup || isUploading}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                            {isCreatingGroup || isUploading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Group'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
