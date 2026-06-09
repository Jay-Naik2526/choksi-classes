import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PageHeader({ title, subtitle, action, backTo }) {
    const navigate = useNavigate();
    return (
        <div
            className="sticky top-0 z-40 px-5 pt-5 pb-4 flex items-center justify-between"
            style={{
                backgroundColor: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(44,24,16,0.06)',
            }}
        >
            <div className="flex items-center gap-3">
                {backTo && (
                    <button
                        onClick={() => navigate(backTo)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                        style={{
                            backgroundColor: '#F5F0E8',
                            border: '1px solid rgba(44,24,16,0.08)',
                        }}
                    >
                        <ChevronLeft size={18} color="#2C1810" />
                    </button>
                )}
                <div>
                    <h1
                        className="text-lg font-bold leading-tight"
                        style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}
                    >
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(44,24,16,0.45)' }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {action && (
                <div>
                    {action.onClick ? (
                        <button
                            onClick={action.onClick}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 hover:opacity-90"
                            style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}
                        >
                            {action.icon && <action.icon size={14} />}
                            {action.label}
                        </button>
                    ) : (
                        action
                    )}
                </div>
            )}
        </div>
    );
}
