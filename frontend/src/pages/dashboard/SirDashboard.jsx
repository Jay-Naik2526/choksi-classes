import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, FileText, IndianRupee, HelpCircle,
    BookOpen, Bell, UserPlus, ChevronRight,
    AlertCircle, Database, TrendingUp, Inbox,
} from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import { PageLoader } from '../../components/ui/Spinner';
import { SpotlightCard, GlowCard, NumberTicker, StaggerContainer, StaggerItem, PageTransition, GradientText } from '../../components/ui/MagicUI';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const getMuhurta = () => {
    const h = new Date().getHours();
    if (h >= 4  && h < 6)  return 'Brahma Muhurta';
    if (h >= 6  && h < 8)  return 'Pratah Sandhya';
    if (h >= 8  && h < 10) return 'Abhijit Muhurta';
    if (h >= 10 && h < 12) return 'Madhyahna Kala';
    if (h >= 12 && h < 14) return 'Aparahna Kala';
    if (h >= 16 && h < 18) return 'Sayahna Sandhya';
    if (h >= 18 && h < 20) return 'Pradosha Kala';
    return 'Nishitha Kala';
};

/* ── Animated SVG ring ── */
function RingRow({ pct, color, label, sublabel, size = 50 }) {
    const stroke = 5;
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (Math.min(pct, 100) / 100) * circ;
    const cx = size / 2, cy = size / 2;
    return (
        <div className="flex items-center gap-3">
            <motion.svg
                width={size} height={size}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.2 }}
            >
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(44,24,16,0.08)" strokeWidth={stroke} />
                <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                    strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: size * 0.22, fontWeight: 700, fill: color, fontFamily: 'Inter,sans-serif' }}>
                    {pct}%
                </text>
            </motion.svg>
            <div>
                <p className="text-sm font-semibold" style={{ color: '#2C1810' }}>{label}</p>
                <p className="text-xs" style={{ color: 'rgba(44,24,16,0.45)' }}>{sublabel}</p>
            </div>
        </div>
    );
}

const QUICK = [
    { label: 'Create Test',  icon: FileText,    path: '/tests/create',        color: '#C1440E' },
    { label: 'Add Material', icon: BookOpen,    path: '/materials/upload',    color: '#E8A020' },
    { label: 'Post Notice',  icon: Bell,        path: '/notices/create',      color: '#059669' },
    { label: 'Add Student',  icon: UserPlus,    path: '/students',            color: '#2563eb' },
    { label: 'View Fees',    icon: IndianRupee, path: '/fees',                color: '#7c3aed' },
    { label: 'Doubts',       icon: HelpCircle,  path: '/doubts',              color: '#C1440E' },
    { label: 'Enquiries',    icon: Inbox,       path: '/enquiries',           color: '#E8A020' },
    { label: 'Q. Bank',      icon: Database,    path: '/tests/question-bank', color: '#2C1810' },
];

/* stagger variants */
const card = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show:   { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 240, damping: 24 } },
};

export default function SirDashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats]             = useState(null);
    const [loading, setLoading]         = useState(true);
    const [newEnquiries, setNewEnquiries] = useState([]);

    useEffect(() => {
        Promise.all([
            api.get('/users/stats'),
            api.get('/enquiry?status=new'),
        ]).then(([sR, eR]) => {
            setStats(sR.data);
            setNewEnquiries(eR.data.enquiries?.slice(0, 3) || []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    if (loading) return <PageLoader />;

    const today   = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const muhurta = getMuhurta();

    const totalStudents  = stats?.totalStudents  ?? 0;
    const doubtsPending  = stats?.doubtsPending  ?? 0;
    const testsThisMonth = stats?.testsThisMonth ?? 0;
    const feeRate = stats?.feesPaid && stats?.feesTotal
        ? Math.round((stats.feesPaid / stats.feesTotal) * 100) : 0;

    return (
        <PageTransition>
            <div className="min-h-screen pb-28" style={{ backgroundColor: '#F7F4EF', fontFamily: 'Inter, sans-serif' }}>

                {/* ── TOP BAR ── */}
                <motion.div
                    className="flex items-center justify-between px-5 pt-10 pb-1"
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="relative">
                        <span className="text-lg font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                            Choksi Classes
                        </span>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 40 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="absolute -bottom-1 left-0"
                            style={{ height: 2.5, backgroundColor: '#C1440E', borderRadius: 2 }}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#C1440E' }}>Auspicious Time</p>
                            <p className="text-xs font-bold" style={{ color: '#2C1810' }}>{muhurta}</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={logout}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: '#F0EBE3', border: '1px solid rgba(44,24,16,0.1)', color: '#2C1810' }}
                        >×</motion.button>
                    </div>
                </motion.div>

                {/* ── GREETING ── */}
                <motion.div
                    className="px-5 mt-5 mb-4"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#C1440E' }}>
                        Namaste, {user?.name?.split(' ')[0]}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'rgba(44,24,16,0.5)' }}>{dateStr}</p>
                </motion.div>

                {/* ── ROW 1: Overview + Class Health ── */}
                <StaggerContainer
                    className="px-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                    {/* Overview */}
                    <StaggerItem>
                        <SpotlightCard
                            spotColor="rgba(193,68,14,0.1)"
                            style={{
                                borderRadius: 20, padding: 16, minHeight: 165,
                                background: 'linear-gradient(140deg,#FDF6EC 0%,#F0E4C8 100%)',
                                border: '1px solid rgba(193,68,14,0.12)',
                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            }}
                        >
                            <div>
                                <p style={{ fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C1440E' }}>◆ This Month</p>
                                <p className="font-bold mt-2" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810', fontSize: 14 }}>
                                    <NumberTicker value={totalStudents} suffix=" Students" />
                                </p>
                                <p className="mt-1" style={{ fontSize: 11, color: 'rgba(44,24,16,0.5)' }}>{testsThisMonth} tests conducted</p>
                                <p className="mt-0.5" style={{ fontSize: 11, color: doubtsPending > 0 ? '#C1440E' : 'rgba(44,24,16,0.5)' }}>
                                    {doubtsPending > 0 ? `${doubtsPending} doubts pending` : 'All doubts answered ✓'}
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                onClick={() => navigate('/students')}
                                className="flex items-center gap-1 mt-3 px-3 py-2 rounded-xl font-semibold w-fit"
                                style={{ backgroundColor: '#C1440E', color: '#FFFFFF', fontSize: 11 }}
                            >
                                <Users size={11} /> Manage
                            </motion.button>
                        </SpotlightCard>
                    </StaggerItem>

                    {/* Class Health */}
                    <StaggerItem>
                        <SpotlightCard
                            spotColor="rgba(44,24,16,0.04)"
                            style={{ borderRadius: 20, padding: 16, backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)', height: '100%' }}
                        >
                            <p className="text-sm font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>Class Health</p>
                            <div className="space-y-4">
                                <RingRow pct={Math.min(feeRate, 100)} color="#16a34a" label="Fees Collected" sublabel={stats?.feesPending ? `₹${(stats.feesPending/1000).toFixed(1)}k pending` : 'All clear'} />
                                <RingRow pct={doubtsPending === 0 ? 100 : Math.max(0, 100 - doubtsPending * 10)} color="#2563eb" label="Doubts Cleared" sublabel={`${doubtsPending} open`} />
                            </div>
                        </SpotlightCard>
                    </StaggerItem>
                </StaggerContainer>

                {/* ── ROW 2: Quick Actions + Tests ── */}
                <StaggerContainer
                    className="px-5 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                    {/* Quick Actions */}
                    <StaggerItem>
                        <div className="rounded-2xl p-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                            <p className="font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810', fontSize: 13 }}>Quick Actions</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                {QUICK.map(({ label, icon: Icon, path, color }) => (
                                    <motion.button
                                        key={label}
                                        onClick={() => navigate(path)}
                                        whileHover={{ scale: 1.08, y: -2 }}
                                        whileTap={{ scale: 0.93 }}
                                        className="flex flex-col items-center gap-1 py-2.5 rounded-xl"
                                        style={{ backgroundColor: '#F7F4EF' }}
                                    >
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                                            <Icon size={13} color={color} />
                                        </div>
                                        <span className="text-center leading-tight font-medium" style={{ fontSize: 8, color: '#2C1810' }}>{label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </StaggerItem>

                    {/* Upcoming Tests */}
                    <StaggerItem>
                        <div className="rounded-2xl p-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810', fontSize: 13 }}>Tests</p>
                                <motion.button whileHover={{ x: 3 }} onClick={() => navigate('/tests')} className="flex items-center gap-0.5" style={{ fontSize: 10, fontWeight: 600, color: '#C1440E' }}>
                                    All <ChevronRight size={10} />
                                </motion.button>
                            </div>
                            {stats?.upcomingTests?.length ? (
                                <div className="space-y-2.5">
                                    {stats.upcomingTests.slice(0, 3).map((t, idx) => (
                                        <motion.div
                                            key={t._id}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + idx * 0.08 }}
                                            className="flex items-start gap-2 cursor-pointer"
                                            onClick={() => navigate('/tests')}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: '#C1440E' }} />
                                            <div className="min-w-0">
                                                <p className="font-semibold truncate" style={{ fontSize: 11, color: '#2C1810' }}>{t.name}</p>
                                                <p style={{ fontSize: 10, color: 'rgba(44,24,16,0.4)' }}>{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-4">
                                    <FileText size={20} color="rgba(44,24,16,0.15)" />
                                    <p style={{ fontSize: 10, color: 'rgba(44,24,16,0.35)', marginTop: 6 }}>No tests</p>
                                </div>
                            )}
                        </div>
                    </StaggerItem>
                </StaggerContainer>

                {/* ── ROW 3: Doubts + Fees ── */}
                <StaggerContainer
                    className="px-5 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                    {/* Doubts */}
                    <StaggerItem>
                        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                                <p className="font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810', fontSize: 13 }}>Doubts</p>
                                <motion.button whileHover={{ x: 3 }} onClick={() => navigate('/doubts')} className="flex items-center gap-0.5" style={{ fontSize: 10, fontWeight: 600, color: '#C1440E' }}>
                                    All <ChevronRight size={10} />
                                </motion.button>
                            </div>
                            {stats?.recentDoubts?.length ? (
                                <div className="divide-y" style={{ borderColor: 'rgba(44,24,16,0.05)' }}>
                                    {stats.recentDoubts.slice(0, 3).map((d, idx) => (
                                        <motion.div
                                            key={d._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.4 + idx * 0.07 }}
                                            className="flex items-center gap-2 px-4 py-2.5 cursor-pointer"
                                            whileHover={{ backgroundColor: 'rgba(193,68,14,0.03)' }}
                                            onClick={() => navigate(`/doubts/${d._id}`)}
                                        >
                                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#C1440E', color: '#fff', fontSize: 9 }}>
                                                {d.studentId?.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold truncate" style={{ fontSize: 11, color: '#2C1810' }}>{d.studentId?.name}</p>
                                                <p style={{ fontSize: 10, color: 'rgba(44,24,16,0.45)' }}>{d.subject}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-5">
                                    <HelpCircle size={20} color="rgba(44,24,16,0.15)" />
                                    <p style={{ fontSize: 10, color: 'rgba(44,24,16,0.35)', marginTop: 6 }}>All clear ✓</p>
                                </div>
                            )}
                        </div>
                    </StaggerItem>

                    {/* Fees */}
                    <StaggerItem>
                        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                                <p className="font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810', fontSize: 13 }}>Fee Alerts</p>
                                <motion.button whileHover={{ x: 3 }} onClick={() => navigate('/fees')} className="flex items-center gap-0.5" style={{ fontSize: 10, fontWeight: 600, color: '#C1440E' }}>
                                    All <ChevronRight size={10} />
                                </motion.button>
                            </div>
                            {stats?.overdueStudents?.length ? (
                                <div className="divide-y" style={{ borderColor: 'rgba(44,24,16,0.05)' }}>
                                    {stats.overdueStudents.slice(0, 3).map((f, idx) => (
                                        <motion.div
                                            key={f._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.4 + idx * 0.07 }}
                                            className="flex items-center gap-2 px-4 py-2.5"
                                        >
                                            <AlertCircle size={12} color="#B91C1C" className="flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold truncate" style={{ fontSize: 11, color: '#2C1810' }}>{f.studentId?.name}</p>
                                                <p style={{ fontSize: 10, color: '#B91C1C' }}>₹{f.amount} · {MONTHS[(f.month ?? 1) - 1]}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-5">
                                    <IndianRupee size={20} color="rgba(44,24,16,0.15)" />
                                    <p style={{ fontSize: 10, color: 'rgba(44,24,16,0.35)', marginTop: 6 }}>All clear ✓</p>
                                </div>
                            )}
                        </div>
                    </StaggerItem>
                </StaggerContainer>

                {/* ── TOP PERFORMER ── */}
                {stats?.topScorer && (
                    <motion.div
                        className="px-5 mt-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 22 }}
                    >
                        <GlowCard
                            glowColor="rgba(232,160,32,0.3)"
                            style={{ borderRadius: 20, overflow: 'hidden' }}
                        >
                            <div className="p-4 flex items-center gap-4" style={{ background: 'linear-gradient(135deg,#2C1810,#4A2C1C)', border: '1px solid rgba(232,160,32,0.2)' }}>
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                                    style={{ backgroundColor: '#E8A020', color: '#2C1810', fontFamily: 'Playfair Display, serif' }}
                                >
                                    {stats.topScorer.student?.name?.[0]?.toUpperCase()}
                                </motion.div>
                                <div>
                                    <p style={{ color: '#E8A020', fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>★ Student of the Month</p>
                                    <p className="font-bold mt-0.5" style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontSize: 16 }}>
                                        {stats.topScorer.student?.name}
                                    </p>
                                    <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.55)', marginTop: 2 }}>
                                        {stats.topScorer.totalScore} pts · {stats.topScorer.count} tests
                                    </p>
                                </div>
                            </div>
                        </GlowCard>
                    </motion.div>
                )}

                {/* ── NEW ENQUIRIES WIDGET ── */}
                <motion.div
                    className="px-5 mt-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, type: 'spring', stiffness: 200, damping: 22 }}
                >
                    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#1a0a05,#2C1810)', border: '1px solid rgba(193,68,14,0.25)', boxShadow: '0 4px 24px rgba(193,68,14,0.1)' }}>
                        <div className="flex items-center justify-between px-4 pt-4 pb-3">
                            <div className="flex items-center gap-2">
                                <Inbox size={15} color="#E8A020" />
                                <p className="font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontSize: 14 }}>
                                    Admissions Inbox
                                </p>
                                {newEnquiries.length > 0 && (
                                    <motion.span
                                        animate={{ scale: [1, 1.15, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        style={{ padding: '2px 8px', borderRadius: 50, backgroundColor: '#C1440E', color: '#fff', fontSize: 9, fontWeight: 700 }}
                                    >
                                        {newEnquiries.length} new
                                    </motion.span>
                                )}
                            </div>
                            <motion.button
                                whileHover={{ x: 3 }}
                                onClick={() => navigate('/enquiries')}
                                className="flex items-center gap-0.5"
                                style={{ fontSize: 10, fontWeight: 600, color: '#E8A020' }}
                            >
                                View all <ChevronRight size={10} />
                            </motion.button>
                        </div>

                        {newEnquiries.length > 0 ? (
                            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                {newEnquiries.map((e, idx) => (
                                    <motion.div
                                        key={e._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + idx * 0.07 }}
                                        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                                        whileHover={{ backgroundColor: 'rgba(193,68,14,0.08)' }}
                                        onClick={() => navigate('/enquiries')}
                                    >
                                        <div style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(193,68,14,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#F5F0E8', fontSize: 13 }}>
                                                {e.parentName[0]?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate" style={{ fontSize: 12, color: '#F5F0E8' }}>{e.parentName}</p>
                                            <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.45)' }}>
                                                {[e.childName, e.className, e.board].filter(Boolean).join(' · ') || 'Enquiry received'}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                                            <span style={{ padding: '2px 7px', borderRadius: 50, backgroundColor: 'rgba(193,68,14,0.35)', color: '#F5F0E8', fontSize: 9, fontWeight: 700 }}>NEW</span>
                                            <span style={{ fontSize: 9, color: 'rgba(245,240,232,0.3)' }}>{e.phone}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 px-4 pb-4">
                                <Inbox size={16} color="rgba(245,240,232,0.2)" />
                                <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.3)' }}>No new enquiries — all caught up!</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                <BottomNav />
            </div>
        </PageTransition>
    );
}
