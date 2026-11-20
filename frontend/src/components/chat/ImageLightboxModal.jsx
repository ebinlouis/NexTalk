import { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

export default function ImageLightboxModal({ imageUrl, onClose }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!imageUrl) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10" onClick={(e) => e.stopPropagation()}>
                <a
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="Open original"
                >
                    <ExternalLink size={18} />
                </a>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="Close"
                >
                    <X size={18} />
                </button>
            </div>

            <div
                className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    alt="Expanded preview"
                    className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
                />
            </div>
        </div>
    );
}
