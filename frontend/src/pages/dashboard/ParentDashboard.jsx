import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, TrendingUp, FileText, AlertCircle, Download,
    CheckCircle, Clock, BookOpen, ChevronRight, Phone
} from 'lucide-react';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import { PageLoader } from '../../components/ui/Spinner';
import {
    SpotlightCard, GlowCard, NumberTicker,
    StaggerContainer, StaggerItem, PageTransition, BorderBeam,
} from '../../components/ui/MagicUI';
import BottomNav from '../../components/layout/BottomNav';

/* ── Animated SVG ring ── */
function Ring({ pct, color, size = 82 }) {
    const r = (size - 10) / 2, circ = 2 * Math.PI * r;
    const cx = size / 2, cy = size / 2;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(44,24,16,0.08)" strokeWidth={7} />
            <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={7}
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                strokeLinecap="round" />
        </svg>
    );
}

export default function ParentDashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [data, setData]         = useState(null);
    const [loading, setLoading]   = useState(true);
    const [active, setActive]     = useState(0);
    const [dlLoading, setDlLoading] = useState(false);

    useEffect(() => {
        api.get('/users/my-children')
            .then(r => setData(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const downloadReport = async (childId, childName) => {
        setDlLoading(true);
        try {
            const res = await api.get(`/users/students/${childId}/progress-report`, { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url; a.download = `Progress_${childName.replace(/ /g, '_')}.pdf`; a.click();
            URL.revokeObjectURL(url);
        } catch {}
        setDlLoading(false);
    };

    if (loading) return <PageLoader />;

    const children = data?.children || [];
    const child    = children[active];
    const hour     = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <PageTransition>
            <div style={{ minHeight: '100vh', backgroundColor: '#F7F4EF', paddingBottom: 90, fontFamily: 'Inter, sans-serif' }}>

                {/* ── STICKY HEADER ── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(44,24,16,0.06)', padding: '20px 20px 14px', position: 'sticky', top: 0, zIndex: 50 }}
                >
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(44,24,16,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{greeting}</p>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: '#2C1810' }}>{user?.name}</h1>
                </motion.div>

                {/* ── CHILD TABS ── */}
                {children.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{ padding: '12px 20px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}
                    >
                        {children.map((c, i) => (
                            <motion.button
                                key={c._id}
                                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                onClick={() => setActive(i)}
                                style={{
                                    flexShrink: 0, padding: '8px 18px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                                    backgroundColor: active === i ? '#C1440E' : 'rgba(44,24,16,0.07)',
                                    color: active === i ? '#fff' : 'rgba(44,24,16,0.6)',
                                    transition: 'background-color 0.2s',
                                }}
                            >
                                {c.name.split(' ')[0]}
                            </motion.button>
                        ))}
                    </motion.div>
                )}

                {!child ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(44,24,16,0.4)' }}
                    >
                        <User size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: .3 }} />
                        <p style={{ fontSize: 15, fontWeight: 500 }}>No children linked to your account.</p>
                        <p style={{ fontSize: 13, marginTop: 8 }}>Contact Choksi Classes to link your child.</p>
                        <motion.a
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            href="tel:+918238216622"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, padding: '11px 24px', borderRadius: 12, backgroundColor: '#C1440E', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
                        >
                            <Phone size={14} /> Call Now
                        </motion.a>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.35 }}
                            style={{ padding: '0 20px' }}
                        >
                            {/* ── CHILD HERO CARD ── */}
                            <GlowCard
                                glowColor="rgba(193,68,14,0.3)"
                                style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 16, marginTop: 12 }}
                            >
                                <div style={{ backgroundColor: '#2C1810', padding: 22, position: 'relative', overflow: 'hidden' }}>
                                    <BorderBeam colorA="#C1440E" colorB="#E8A020" duration={5} />
                                    <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(193,68,14,0.18)', pointerEvents: 'none' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
                                        <motion.div
                                            animate={{ rotate: [0, 3, -3, 0] }}
                                            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                            style={{ width: 54, height: 54, borderRadius: 16, backgroundColor: 'rgba(193,68,14,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#F5F0E8', fontFamily: 'Playfair Display, serif', flexShrink: 0 }}
                                        >
                                            {child.name[0]}
                                        </motion.div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#F5F0E8', fontSize: 18, marginBottom: 3 }}>{child.name}</p>
                                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                                {child.rollNumber && <span style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)' }}>Roll #{child.rollNumber}</span>}
                                                {child.batchIds?.length > 0 && <span style={{ fontSize: 12, color: '#E8A020', fontWeight: 600 }}>{child.batchIds[0]?.name || 'Batch enrolled'}</span>}
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                                            onClick={() => downloadReport(child._id, child.name)}
                                            disabled={dlLoading}
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, backgroundColor: 'rgba(193,68,14,0.3)', border: '1px solid rgba(193,68,14,0.4)', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', opacity: dlLoading ? 0.6 : 1, flexShrink: 0 }}
                                        >
                                            <Download size={16} color="#F5F0E8" />
                                            <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.7)', fontWeight: 600 }}>Report</span>
                                        </motion.button>
                                    </div>
                                </div>
                            </GlowCard>

                            {/* ── STATS ROW ── */}
                            <StaggerContainer className="grid grid-cols-3 gap-2.5 mb-4">
                                {[
                                    { label: 'Tests',  value: child.testsTaken || 0,   color: '#C1440E', sub: 'taken' },
                                    { label: 'Avg',    value: child.avgScore || 0,      color: '#E8A020', sub: 'score', suffix: '%' },
                                    { label: 'Fees',   value: child.totalDue > 0 ? child.totalDue : null, color: child.totalDue > 0 ? '#C1440E' : '#16a34a', sub: child.totalDue > 0 ? 'due' : 'clear', prefix: child.totalDue > 0 ? '₹' : '✓' },
                                ].map((s, i) => (
                                    <StaggerItem key={i}>
                                        <SpotlightCard
                                            spotColor={`${s.color}12`}
                                            style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: '14px 12px', border: '1px solid rgba(44,24,16,0.07)', textAlign: 'center' }}
                                        >
                                            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 4 }}>
                                                {s.prefix || ''}
                                                {s.value !== null && typeof s.value === 'number' ? (
                                                    <NumberTicker value={s.value} suffix={s.suffix || ''} />
                                                ) : s.prefix}
                                            </p>
                                            <p style={{ fontSize: 12, fontWeight: 600, color: '#2C1810', marginBottom: 1 }}>{s.label}</p>
                                            <p style={{ fontSize: 10, color: 'rgba(44,24,16,0.4)' }}>{s.sub}</p>
                                        </SpotlightCard>
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>

                            {/* ── RING + BATCHES ── */}
                            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                <StaggerItem>
                                    <SpotlightCard
                                        spotColor="rgba(193,68,14,0.08)"
                                        style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid rgba(44,24,16,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <div style={{ position: 'relative', marginBottom: 8 }}>
                                            <Ring pct={child.avgScore || 0} color="#C1440E" />
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 17, color: '#2C1810' }}>{child.avgScore || 0}%</span>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(44,24,16,0.55)', textAlign: 'center', lineHeight: 1.4 }}>Average Score</p>
                                    </SpotlightCard>
                                </StaggerItem>
                                <StaggerItem>
                                    <SpotlightCard
                                        spotColor="rgba(44,24,16,0.03)"
                                        style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, border: '1px solid rgba(44,24,16,0.07)', height: '100%' }}
                                    >
                                        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(44,24,16,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Batches</p>
                                        {(!child.batchIds || child.batchIds.length === 0) ? (
                                            <p style={{ color: 'rgba(44,24,16,0.35)', fontSize: 13 }}>Not enrolled in any batch</p>
                                        ) : child.batchIds.map((b, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 + i * 0.07 }}
                                                style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: i < child.batchIds.length - 1 ? '1px solid rgba(44,24,16,0.05)' : 'none' }}
                                            >
                                                <motion.div
                                                    animate={{ scale: [1, 1.3, 1] }}
                                                    transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.5 }}
                                                    style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#C1440E', flexShrink: 0 }}
                                                />
                                                <span style={{ fontSize: 13, color: '#2C1810', fontWeight: 500 }}>{b.name || b}</span>
                                                {b.subject && <span style={{ fontSize: 11, color: '#C1440E', fontWeight: 600, marginLeft: 'auto' }}>{b.subject}</span>}
                                            </motion.div>
                                        ))}
                                    </SpotlightCard>
                                </StaggerItem>
                            </StaggerContainer>

                            {/* ── FEE ALERT / CLEAR ── */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                {child.totalDue > 0 ? (
                                    <GlowCard
                                        glowColor="rgba(193,68,14,0.2)"
                                        style={{ borderRadius: 16, marginBottom: 16 }}
                                    >
                                        <div style={{ backgroundColor: 'rgba(193,68,14,0.06)', padding: 16, border: '1px solid rgba(193,68,14,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                                <AlertCircle size={20} color="#C1440E" style={{ flexShrink: 0 }} />
                                            </motion.div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 700, color: '#C1440E', fontSize: 14, marginBottom: 2 }}>Fee Due: ₹{child.totalDue}</p>
                                                <p style={{ fontSize: 12, color: 'rgba(44,24,16,0.6)' }}>Please pay to avoid any disruption.</p>
                                            </div>
                                            <motion.a
                                                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                                                href="tel:+918238216622"
                                                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10, backgroundColor: '#C1440E', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
                                            >
                                                <Phone size={12} /> Call
                                            </motion.a>
                                        </div>
                                    </GlowCard>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0.95 }}
                                        animate={{ scale: 1 }}
                                        style={{ backgroundColor: 'rgba(22,163,74,0.06)', borderRadius: 16, padding: 14, marginBottom: 16, border: '1px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}
                                    >
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                                            <CheckCircle size={16} color="#16a34a" />
                                        </motion.div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>All fees cleared — thank you! 🎉</p>
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* ── QUICK ACTIONS ── */}
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(44,24,16,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Quick Access</p>
                            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                                {[
                                    { label: 'Tests & Results', icon: FileText, path: '/tests',     color: '#2563eb' },
                                    { label: 'Materials',       icon: BookOpen, path: '/materials', color: '#16a34a' },
                                    { label: 'Notices',         icon: Clock,    path: '/notices',   color: '#E8A020' },
                                    { label: 'Download Report', icon: Download, action: () => downloadReport(child._id, child.name), color: '#C1440E' },
                                ].map((item, i) => (
                                    <StaggerItem key={i}>
                                        <motion.button
                                            whileHover={{ scale: 1.03, y: -3, boxShadow: '0 8px 20px rgba(44,24,16,0.1)' }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={item.action || (() => navigate(item.path))}
                                            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(44,24,16,0.07)', backgroundColor: '#FFFFFF', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                                        >
                                            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <item.icon size={16} color={item.color} />
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#2C1810' }}>{item.label}</span>
                                            <ChevronRight size={12} color="rgba(44,24,16,0.3)" style={{ marginLeft: 'auto' }} />
                                        </motion.button>
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>

                            {/* ── 24HR HELPLINE ── */}
                            <GlowCard glowColor="rgba(193,68,14,0.2)" style={{ borderRadius: 16, marginBottom: 20 }}>
                                <div style={{ backgroundColor: '#2C1810', borderRadius: 16, padding: 20 }}>
                                    <p style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>24hr Helpline</p>
                                    <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: 13, marginBottom: 14 }}>Questions about your child's progress? We're always here.</p>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <motion.a
                                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                                            href="tel:+918238216622"
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, backgroundColor: '#C1440E', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
                                        >
                                            <Phone size={13} /> Dip Sir
                                        </motion.a>
                                        <motion.a
                                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                                            href="tel:+919726019001"
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(245,240,232,0.8)', fontSize: 13, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}
                                        >
                                            <Phone size={13} /> Kairavi Ma'am
                                        </motion.a>
                                    </div>
                                </div>
                            </GlowCard>
                        </motion.div>
                    </AnimatePresence>
                )}

                <BottomNav />
            </div>
        </PageTransition>
    );
}
