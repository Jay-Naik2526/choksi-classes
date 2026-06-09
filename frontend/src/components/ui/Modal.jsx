import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div
                className={`relative w-full ${widths[size]} rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col slide-up`}
                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(193,68,14,0.12)', maxHeight: '88vh' }}
            >
                {/* sticky header */}
                <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
                    style={{ borderColor: 'rgba(193,68,14,0.08)' }}>
                    <h3 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                        {title}
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <X size={18} color="#2C1810" />
                    </button>
                </div>
                {/* scrollable content — 90px bottom padding clears the fixed bottom nav */}
                <div className="px-6 pt-5 overflow-y-auto flex-1" style={{ paddingBottom: '90px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
