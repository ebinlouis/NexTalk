import { useState, useRef } from 'react';
import { SendHorizontal, Paperclip, Smile, X, FileText } from 'lucide-react';

/**
 * Bottom message composer form with attachment support and send button.
 */
export default function MessageInput({ value, onChange, onSubmit, isSending, onTyping }) {
    const [attachedFile, setAttachedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        onChange(e);
        onTyping?.();
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAttachedFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleClearAttachment = () => {
        setAttachedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit(e, attachedFile);
        handleClearAttachment();
    };

    return (
        <form onSubmit={handleFormSubmit} className="p-3 md:p-4 border-t border-line bg-white shrink-0">
            {attachedFile && (
                <div className="relative inline-block mb-2 ml-1">
                    {previewUrl ? (
                        <div className="relative">
                            <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-line shadow-xs" />
                            <button
                                type="button"
                                onClick={handleClearAttachment}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
                                title="Remove file"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl shadow-xs">
                            <FileText size={16} className="text-primary" />
                            <span className="text-xs font-medium text-ink max-w-[180px] truncate">{attachedFile.name}</span>
                            <span className="text-[10px] text-muted">({(attachedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                            <button
                                type="button"
                                onClick={handleClearAttachment}
                                className="p-0.5 text-muted hover:text-rose-600 transition-colors cursor-pointer"
                                title="Remove file"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>
            )}
            <div className="flex items-center gap-1.5 md:gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-muted hover:text-ink hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Attach file"
                >
                    <Paperclip size={18} />
                </button>
                <button
                    type="button"
                    className="p-2 text-muted hover:text-ink hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Insert emoji"
                >
                    <Smile size={18} />
                </button>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={value}
                    onChange={handleChange}
                    className="flex-1 bg-slate-50 border border-line text-ink placeholder:text-subtle rounded-xl px-4 py-2.5 md:py-3 text-xs md:text-sm outline-none transition-all focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button
                    type="submit"
                    disabled={(!value.trim() && !attachedFile) || isSending}
                    className="bg-primary hover:bg-primary-hover disabled:opacity-40 text-white px-4 md:px-5 py-2.5 md:py-3 rounded-xl flex items-center gap-2 font-medium text-xs md:text-sm shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
                >
                    <span>Send</span>
                    <SendHorizontal size={16} className="text-teal-200" />
                </button>
            </div>
        </form>
    );
}
