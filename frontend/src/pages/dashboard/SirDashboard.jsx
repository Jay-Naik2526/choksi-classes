import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, FileText, IndianRupee, HelpCircle,
    BookOpen, Bell, UserPlus, ChevronRight,
    AlertCircle, Database, TrendingUp
} from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import { PageLoader } from '../../components/ui/Spinner';
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

const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

// Compact ring — label to the right
function RingRow({ pct, color, label, sublabel, size = 48 }) {
    const stroke = 4.5;
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (Math.min(pct, 100) / 100) * circ;
    const cx = size / 2, cy = size / 2;
    return (
        <div className="flex items-center gap-3">
            <svg width={size} height={size} className="flex-shrink-0">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(44,24,16,0.07)" strokeWidth={stroke} />
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                    transform={`rotate(-90 ${cx} ${cy})`}
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: size * 0.22, fontWeight: 700, fill: color, fontFamily: 'Inter,sans-serif' }}>
                    {pct}%
                </text>
            </svg>
            <div>
                <p className="text-sm font-semibold" style={{ color: '#2C1810' }}>{label}</p>
                <p className="text-xs" style={{ color: 'rgba(44,24,16,0.45)' }}>{sublabel}</p>
            </div>
        </div>
    );
}

const QUICK = [
    { label: 'Create Test',   icon: FileText,    path: '/tests/create',        color: '#C1440E' },
    { label: 'Add Material',  icon: BookOpen,    path: '/materials/upload',    color: '#E8A020' },
    { label: 'Post Notice',   icon: Bell,        path: '/notices/create',      color: '#059669' },
    { label: 'Add Student',   icon: UserPlus,    path: '/students',            color: '#2563eb' },
    { label: 'View Fees',     icon: IndianRupee, path: '/fees',                color: '#7c3aed' },
    { label: 'Doubts',        icon: HelpCircle,  path: '/doubts',              color: '#C1440E' },
    { label: 'Q. Bank',       icon: Database,    path: '/tests/question-bank', color: '#2C1810' },
    { label: 'Analytics',     icon: TrendingUp,  path: '/tests',               color: '#0891b2' },
];

export default function SirDashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats]     = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users/stats')
            .then(r => setStats(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <PageLoader />;

    const today   = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const muhurta = getMuhurta();

    const totalStudents   = stats?.totalStudents   ?? 0;
    const doubtsPending   = stats?.doubtsPending   ?? 0;
    const testsThisMonth  = stats?.testsThisMonth  ?? 0;

    // % stats for rings
    const answerRate = doubtsPending === 0 && totalStudents > 0 ? 100 : 0;
    const feeRate    = stats?.feesPaid && stats?.feesTotal
        ? Math.round((stats.feesPaid / stats.feesTotal) * 100) : 0;

    return (
        <div className="min-h-screen pb-28 page-fade" style={{ backgroundColor: '#F7F4EF' }}>

            {/* Top Bar */}
            <div className="flex items-center justify-between px-5 pt-10 pb-1">
                <div className="relative">
                    <span className="text-lg font-bold"
                        style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                        Choksi Classes
                    </span>
                    <div className="absolute -bottom-1 left-0"
                        style={{ width: 40, height: 2.5, backgroundColor: '#C1440E', borderRadius: 2 }} />
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#C1440E' }}>
                            Auspicious Time
                        </p>
                        <p className="text-xs font-bold" style={{ color: '#2C1810' }}>{muhurta}</p>
                    </div>
                    <button onClick={logout}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: '#F0EBE3', border: '1px solid rgba(44,24,16,0.1)', color: '#2C1810' }}>
                        ×
                    </button>
                </div>
            </div>

            {/* Greeting */}
            <div className="px-5 mt-5 mb-4">
                <h1 className="text-3xl font-bold"
                    style={{ fontFamily: 'Playfair Display, serif', color: '#C1440E' }}>
                    Namaste, {user?.name?.split(' ')[0]}
                </h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(44,24,16,0.5)' }}>{dateStr}</p>
            </div>

            {/* TWO-COL: Overview card + Rings */}
            <div className="px-5 grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>

                {/* Overview card */}
                <div className="rounded-2xl p-4 flex flex-col justify-between"
                    style={{
                        background: 'linear-gradient(140deg, #FDF6EC 0%, #F0E4C8 100%)',
                        border: '1px solid rgba(193,68,14,0.12)',
                        minHeight: 160,
                    }}>
                    <div>
                        <p style={{ fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C1440E' }}>
                            ◆ This Month
                        </p>
                        <p className="font-bold mt-2" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810', fontSize: '14px' }}>
                            {totalStudents} Students
                        </p>
                        <p className="mt-1" style={{ fontSize: '11px', color: 'rgba(44,24,16,0.5)' }}>
                            {testsThisMonth} tests conducted
                        </p>
                        <p className="mt-0.5" style={{ fontSize: '11px', color: doubtsPending > 0 ? '#C1440E' : 'rgba(44,24,16,0.5)' }}>
                            {doubtsPending > 0 ? `${doubtsPending} doubts pending` : 'All doubts answered ✓'}
                        </p>
                    </div>
                    <button onClick={() => navigate('/students')}
                        className="flex items-center gap-1 mt-3 px-3 py-2 rounded-lg font-semibold w-fit"
                        style={{ backgroundColor: '#C1440E', color: '#FFFFFF', fontSize: '11px' }}>
                        <Users size={11} /> Manage
                    </button>
                </div>

                {/* Progress rings */}
                <div className="rounded-2xl p-4"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <p className="text-sm font-bold mb-4"
                        style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                        Class Health
                    </p>
                    <div className="space-y-4">
                        <RingRow
                            pct={Math.min(feeRate, 100)}
                            color="#16a34a"
                            label="Fees Collected"
                            sublabel={stats?.feesPending ? `₹${(stats.feesPending/1000).toFixed(1)}k pending` : 'All clear'}
                        />
                        <RingRow
                            pct={doubtsPending === 0 ? 100 : Math.max(0, 100 - doubtsPending * 10)}
                            color="#2563eb"
                            label="Doubts Cleared"
                            sublabel={`${doubtsPending} open`}
                        />
                    </div>
                </div>
            </div>

            {/* TWO-COL: Quick Actions + Upcoming Tests */}
            <div className="px-5 mt-3 grid gap-3" style={{ gridTemplateColumns: '1.1fr 1fr' }}>

                {/* Quick Actions */}
                <div className="rounded-2xl p-4"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <p className="font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810', fontSize: '13px' }}>
                        Quick Actions
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                        {QUICK.map(({ label, icon: Icon, path, color }) => (
                            <button key={label} onClick={() => navigate(path)}
                                className="flex flex-col items-center gap-1 py-2.5 rounded-xl active:scale-95 transition-transform"
                                style={{ backgroundColor: '#F7F4EF' }}>
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${color}18` }}>
                                    <Icon size={13} color={color} />
                                </div>
                                <span className="text-center leading-tight font-medium"
                                    style={{ fontSize: '8px', color: '#2C1810' }}>
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Upcoming Tests */}
                <div className="rounded-2xl p-4"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <p className="font-bold"
                            style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810', fontSize: '13px' }}>
                            Tests
                        </p>
                        <button onClick={() => navigate('/tests')}
                            className="flex items-center gap-0.5"
                            style={{ fontSize: '10px', fontWeight: 600, color: '#C1440E' }}>
                            All <ChevronRight size={10} />
                        </button>
                    </div>
                    {stats?.upcomingTests?.length ? (
                        <div className="space-y-2.5">
                            {stats.upcomingTests.slice(0, 3).map((t) => (
                                <div key={t._id}
                                    className="flex items-start gap-2 cursor-pointer"
                                    onClick={() => navigate('/tests')}>
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                                        style={{ backgroundColor: '#C1440E' }} />
                                    <div className="min-w-0">
                                        <p className="font-semibold truncate"
                                            style={{ fontSize: '11px', color: '#2C1810' }}>{t.name}</p>
                                        <p style={{ fontSize: '10px', color: 'rgba(44,24,16,0.4)' }}>
                                            {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-4">
                            <FileText size={20} color="rgba(44,24,16,0.15)" />
                            <p style={{ fontSize: '10px', color: 'rgba(44,24,16,0.35)', marginTop: 6 }}>No tests</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pending Doubts + Fee Alerts */}
            <div className="px-5 mt-3 grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>

                {/* Doubts */}
                <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <p className="font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810', fontSize: '13px' }}>
                            Doubts
                        </p>
                        <button onClick={() => navigate('/doubts')}
                            className="flex items-center gap-0.5"
                            style={{ fontSize: '10px', fontWeight: 600, color: '#C1440E' }}>
                            All <ChevronRight size={10} />
                        </button>
                    </div>
                    {stats?.recentDoubts?.length ? (
                        <div className="divide-y" style={{ borderColor: 'rgba(44,24,16,0.05)' }}>
                            {stats.recentDoubts.slice(0, 3).map((d) => (
                                <div key={d._id}
                                    className="flex items-center gap-2 px-4 py-2.5 cursor-pointer"
                                    onClick={() => navigate(`/doubts/${d._id}`)}>
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                        style={{ backgroundColor: '#C1440E', color: '#fff', fontSize: '9px' }}>
                                        {d.studentId?.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate" style={{ fontSize: '11px', color: '#2C1810' }}>
                                            {d.studentId?.name}
                                        </p>
                                        <p style={{ fontSize: '10px', color: 'rgba(44,24,16,0.45)' }}>
                                            {d.subject}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-5">
                            <HelpCircle size={20} color="rgba(44,24,16,0.15)" />
                            <p style={{ fontSize: '10px', color: 'rgba(44,24,16,0.35)', marginTop: 6 }}>All clear ✓</p>
                        </div>
                    )}
                </div>

                {/* Fees */}
                <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <p className="font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810', fontSize: '13px' }}>
                            Fee Alerts
                        </p>
                        <button onClick={() => navigate('/fees')}
                            className="flex items-center gap-0.5"
                            style={{ fontSize: '10px', fontWeight: 600, color: '#C1440E' }}>
                            All <ChevronRight size={10} />
                        </button>
                    </div>
                    {stats?.overdueStudents?.length ? (
                        <div className="divide-y" style={{ borderColor: 'rgba(44,24,16,0.05)' }}>
                            {stats.overdueStudents.slice(0, 3).map((f) => (
                                <div key={f._id} className="flex items-center gap-2 px-4 py-2.5">
                                    <AlertCircle size={12} color="#B91C1C" className="flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate" style={{ fontSize: '11px', color: '#2C1810' }}>
                                            {f.studentId?.name}
                                        </p>
                                        <p style={{ fontSize: '10px', color: '#B91C1C' }}>
                                            ₹{f.amount} · {MONTHS[(f.month ?? 1) - 1]}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-5">
                            <IndianRupee size={20} color="rgba(44,24,16,0.15)" />
                            <p style={{ fontSize: '10px', color: 'rgba(44,24,16,0.35)', marginTop: 6 }}>All clear ✓</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Performer */}
            {stats?.topScorer && (
                <div className="px-5 mt-3">
                    <div className="rounded-2xl p-4 flex items-center gap-4"
                        style={{ background: 'linear-gradient(135deg, #2C1810, #4A2C1C)', border: '1px solid rgba(232,160,32,0.2)' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                            style={{ backgroundColor: '#E8A020', color: '#2C1810', fontFamily: 'Playfair Display, serif' }}>
                            {stats.topScorer.student?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p style={{ color: '#E8A020', fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                ★ Student of the Month
                            </p>
                            <p className="font-bold mt-0.5"
                                style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontSize: '16px' }}>
                                {stats.topScorer.student?.name}
                            </p>
                            <p style={{ fontSize: '11px', color: 'rgba(245,240,232,0.55)', marginTop: 2 }}>
                                {stats.topScorer.totalScore} pts · {stats.topScorer.count} tests
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
