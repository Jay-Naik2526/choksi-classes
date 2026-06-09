export default function Spinner({ size = 'md', color = '#C1440E' }) {
    const sizes = { sm: 16, md: 24, lg: 40 };
    const s = sizes[size] || 24;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className="animate-spin">
            <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.2" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

export function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F4EF' }}>
            <div className="flex flex-col items-center gap-4">
                {/* Logo mark */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(193,68,14,0.12)', boxShadow: '0 4px 20px rgba(193,68,14,0.08)' }}>
                    <span style={{ fontFamily: 'Playfair Display, serif', color: '#C1440E', fontWeight: 700, fontSize: '22px' }}>
                        C
                    </span>
                </div>
                <Spinner size="md" />
                <p className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: 'rgba(44,24,16,0.35)' }}>
                    Loading…
                </p>
            </div>
        </div>
    );
}
