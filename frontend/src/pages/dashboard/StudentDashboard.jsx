import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, HelpCircle, BookOpen, ChevronRight, Play, Video, StickyNote, Clock } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import { PageLoader } from '../../components/ui/Spinner';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

// ── Helpers ──────────────────────────────────────────────────────────────
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

// Compact ring — label sits to the RIGHT of the SVG
function RingRow({ pct, color, label, sublabel, size = 52 }) {
    const stroke = 5;
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (Math.min(pct, 100) / 100) * circ;
    const cx = size / 2, cy = size / 2;
    return (
        <div className="flex items-center gap-3">
            <svg width={size} height={size} className="flex-shrink-0">
                <circle cx={cx} cy={cy} r={r} fill="none"
                    stroke="rgba(44,24,16,0.07)" strokeWidth={stroke} />
                <circle cx={cx} cy={cy} r={r} fill="none"
                    stroke={color} strokeWidth={stroke}
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${cx} ${cy})`}
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: size * 0.22, fontWeight: 700, fill: color, fontFamily: 'Inter,sans-serif' }}>
                    {pct}%
                </text>
            </svg>
            <div>
                <p className="text-sm font-semibold leading-tight" style={{ color: '#2C1810' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(44,24,16,0.45)' }}>{sublabel}</p>
            </div>
        </div>
    );
}

const typeIcon  = { pdf: FileText, video: Video, note: StickyNote };
const typeCTA   = { pdf: 'READ NOW', video: 'WATCH NOW', note: 'VIEW NOW' };
const typeDesc  = { pdf: 'Reading Material · PDF', video: 'Video Lesson', note: 'Notes' };
const typeColor = { pdf: '#C1440E', video: '#2563eb', note: '#059669' };

export default function StudentDashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [stats,     setStats]     = useState(null);
    const [tests,     setTests]     = useState([]);
    const [materials, setMaterials] = useState([]);
    const [notices,   setNotices]   = useState([]);
    const [loading,   setLoading]   = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/users/my-stats'),
            api.get('/tests?upcoming=true'),
            api.get('/materials'),
            api.get('/notices'),
        ]).then(([sR, tR, mR, nR]) => {
            setStats(sR.data);
            setTests(tR.data.tests?.slice(0, 4) || []);
            setMaterials(mR.data.materials?.slice(0, 5) || []);
            setNotices(nR.data.notices?.slice(0, 3) || []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    if (loading) return <PageLoader />;

    const today   = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    const muhurta = getMuhurta();
    const nextTest  = tests[0];
    const daysLeft  = nextTest ? Math.ceil((new Date(nextTest.date) - today) / 86400000) : null;
    const avgScore  = stats?.avgScore ?? 0;
    const doubtsResolvedPct = stats?.doubtsAnswered ?? 0;

    return (
        <div className="min-h-screen pb-28 page-fade" style={{ backgroundColor: '#F7F4EF' }}>

            {/* ── Top Bar ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 pt-10 pb-1">
                {/* Logo with underline */}
                <div className="relative">
                    <span className="text-lg font-bold"
                        style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                        Choksi Classes
                    </span>
                    <div className="absolute -bottom-1 left-0"
                        style={{ width: 40, height: 2.5, backgroundColor: '#C1440E', borderRadius: 2 }} />
                </div>
                <div className="text-right">
                    <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#C1440E' }}>
                        Auspicious Time
                    </p>
                    <p className="text-xs font-bold" style={{ color: '#2C1810' }}>{muhurta}</p>
                </div>
            </div>

            {/* ── Greeting ────────────────────────────────────────── */}
            <div className="px-5 mt-5 mb-4">
                <h1 className="text-3xl font-bold"
                    style={{ fontFamily: 'Playfair Display, serif', color: '#C1440E' }}>
                    Namaste, {user?.name?.split(' ')[0]}
                </h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(44,24,16,0.5)' }}>
                    {dateStr} — Your path to excellence continues.
                </p>
            </div>

            {/* ── TWO-COLUMN: Featured card + Study Progress ───────── */}
            <div className="px-5 grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>

                {/* Featured / Next Test */}
                <div className="rounded-2xl p-4 flex flex-col justify-between"
                    style={{
                        background: 'linear-gradient(140deg, #FDF6EC 0%, #F0E4C8 100%)',
                        border: '1px solid rgba(193,68,14,0.12)',
                        minHeight: 170,
                    }}>
                    <div>
                        <p style={{ fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C1440E' }}>
                            {nextTest ? '◆ Next Test' : '◆ Status'}
                        </p>
                        <h3 className="font-bold mt-1.5 leading-snug"
                            style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810', fontSize: '14px' }}>
                            {nextTest ? nextTest.name : 'No upcoming tests'}
                        </h3>
                        {nextTest && (
                            <p className="mt-1" style={{ fontSize: '11px', color: 'rgba(44,24,16,0.55)' }}>
                                {nextTest.subject} · {nextTest.duration} min
                            </p>
                        )}
                    </div>
                    {nextTest ? (
                        <button
                            onClick={() => navigate('/tests')}
                            className="flex items-center gap-1.5 mt-3 px-3 py-2 rounded-lg font-semibold w-fit"
                            style={{ backgroundColor: '#C1440E', color: '#FFFFFF', fontSize: '11px' }}>
                            <Play size={10} fill="#FFFFFF" />
                            {daysLeft === 0 ? 'Attempt Now' : `In ${daysLeft}d`}
                        </button>
                    ) : (
                        <p className="mt-3" style={{ fontSize: '11px', color: 'rgba(44,24,16,0.45)' }}>
                            Keep revising your notes.
                        </p>
                    )}
                </div>

                {/* Study Progress */}
                <div className="rounded-2xl p-4"
                    style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid rgba(44,24,16,0.07)',
                        boxShadow: '0 2px 12px rgba(44,24,16,0.04)',
                    }}>
                    <p className="text-sm font-bold mb-4"
                        style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                        Study Progress
                    </p>
                    <div className="space-y-4">
                        <RingRow
                            pct={avgScore}
                            color="#C1440E"
                            label="Avg Score"
                            sublabel={`${stats?.testsTaken ?? 0} tests taken`}
                        />
                        <RingRow
                            pct={doubtsResolvedPct}
                            color="#16a34a"
                            label="Doubts Resolved"
                            sublabel={`${stats?.doubtsAsked ?? 0} doubts asked`}
                        />
                    </div>
                </div>
            </div>

            {/* ── TWO-COLUMN: Schedule + Materials ────────────────── */}
            <div className="px-5 mt-3 grid gap-3" style={{ gridTemplateColumns: '1fr 1.6fr' }}>

                {/* Daily Schedule (upcoming tests as schedule) */}
                <div className="rounded-2xl p-4"
                    style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid rgba(44,24,16,0.07)',
                        boxShadow: '0 2px 12px rgba(44,24,16,0.04)',
                    }}>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold"
                            style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                            Schedule
                        </p>
                        <p style={{ fontSize: '10px', color: 'rgba(44,24,16,0.4)', fontWeight: 600 }}>
                            {today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                    </div>
                    {tests.length > 0 ? (
                        <div className="space-y-3">
                            {tests.slice(0, 3).map((t, i) => {
                                const d = Math.ceil((new Date(t.date) - today) / 86400000);
                                const isToday = d === 0;
                                return (
                                    <div key={t._id} className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                                            style={{ backgroundColor: isToday ? '#C1440E' : 'rgba(44,24,16,0.25)' }} />
                                        <div className="min-w-0">
                                            <p style={{
                                                fontSize: '10px', fontWeight: 600,
                                                color: isToday ? '#C1440E' : 'rgba(44,24,16,0.5)',
                                            }}>
                                                {isToday ? 'Today' : d === 1 ? 'Tomorrow' : new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </p>
                                            <p className="font-semibold truncate"
                                                style={{ fontSize: '11px', color: '#2C1810' }}>
                                                {t.name}
                                            </p>
                                            <p style={{ fontSize: '10px', color: 'rgba(44,24,16,0.4)' }}>
                                                {t.subject}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-4">
                            <Clock size={20} color="rgba(44,24,16,0.15)" />
                            <p style={{ fontSize: '10px', color: 'rgba(44,24,16,0.35)', marginTop: 6 }}>
                                No tests scheduled
                            </p>
                        </div>
                    )}
                    <button onClick={() => navigate('/tests')}
                        className="mt-3 flex items-center gap-0.5"
                        style={{ fontSize: '10px', fontWeight: 600, color: '#C1440E' }}>
                        View all <ChevronRight size={10} />
                    </button>
                </div>

                {/* Recent Materials */}
                <div className="min-w-0">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold"
                            style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                            Recent Materials
                        </p>
                        <button onClick={() => navigate('/materials')}
                            className="flex items-center gap-0.5"
                            style={{ fontSize: '10px', fontWeight: 600, color: '#C1440E' }}>
                            All <ChevronRight size={10} />
                        </button>
                    </div>
                    {materials.length > 0 ? (
                        <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                            {materials.map((m) => {
                                const Icon  = typeIcon[m.type]  || FileText;
                                const color = typeColor[m.type] || '#C1440E';
                                return (
                                    <a key={m._id}
                                        href={m.driveLink || m.videoUrl || '#'}
                                        target="_blank" rel="noopener noreferrer"
                                        className="flex-shrink-0 rounded-xl p-3 flex flex-col gap-2 active:scale-95 transition-transform"
                                        style={{
                                            width: 130,
                                            backgroundColor: '#FFFFFF',
                                            border: '1px solid rgba(44,24,16,0.07)',
                                            boxShadow: '0 2px 8px rgba(44,24,16,0.04)',
                                            textDecoration: 'none',
                                        }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: `${color}18` }}>
                                            <Icon size={15} color={color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold leading-snug line-clamp-2"
                                                style={{ fontSize: '12px', color: '#2C1810' }}>
                                                {m.title}
                                            </p>
                                            <p className="mt-0.5" style={{ fontSize: '10px', color: 'rgba(44,24,16,0.45)' }}>
                                                {typeDesc[m.type] || m.type.toUpperCase()}
                                            </p>
                                        </div>
                                        <p className="font-bold tracking-wide"
                                            style={{ fontSize: '10px', color }}>
                                            {typeCTA[m.type] || 'OPEN'} →
                                        </p>
                                    </a>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl flex flex-col items-center py-6"
                            style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)' }}>
                            <BookOpen size={22} color="rgba(44,24,16,0.15)" />
                            <p style={{ fontSize: '11px', color: 'rgba(44,24,16,0.35)', marginTop: 6 }}>
                                No materials yet
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Notices ─────────────────────────────────────────── */}
            {notices.length > 0 && (
                <div className="px-5 mt-3">
                    <div className="rounded-2xl overflow-hidden"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <div className="flex items-center justify-between px-4 pt-4 pb-2">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold"
                                    style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                                    Notices
                                </p>
                                {notices.filter(n => !n.readBy?.includes(user?.id)).length > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white bg-orange-600 animate-pulse">
                                        {notices.filter(n => !n.readBy?.includes(user?.id)).length} new
                                    </span>
                                )}
                            </div>
                            <button onClick={() => navigate('/notices')}
                                className="flex items-center gap-0.5"
                                style={{ fontSize: '10px', fontWeight: 600, color: '#C1440E' }}>
                                All <ChevronRight size={10} />
                            </button>
                        </div>
                        <div className="divide-y" style={{ borderColor: 'rgba(44,24,16,0.05)' }}>
                            {notices.map((n) => (
                                <div key={n._id}
                                    className="px-4 py-3 flex items-start gap-2.5 cursor-pointer"
                                    onClick={() => navigate('/notices')}>
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                                        style={{
                                            backgroundColor:
                                                n.priority === 'urgent'  ? '#C1440E' :
                                                n.priority === 'holiday' ? '#E8A020' : 'rgba(44,24,16,0.35)',
                                        }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate flex items-center gap-1.5" style={{ color: '#2C1810' }}>
                                            {n.title}
                                            {!n.readBy?.includes(user?.id) && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse flex-shrink-0" />
                                            )}
                                        </p>
                                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'rgba(44,24,16,0.5)' }}>{n.body}</p>
                                    </div>
                                    <ChevronRight size={13} color="rgba(44,24,16,0.2)" className="flex-shrink-0 mt-0.5" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Quick Links row ──────────────────────────────────── */}
            <div className="px-5 mt-3 grid grid-cols-3 gap-3">
                {[
                    { label: 'All Tests',  icon: FileText,   path: '/tests',     color: '#C1440E' },
                    { label: 'My Doubts', icon: HelpCircle,  path: '/doubts',    color: '#2563eb' },
                    { label: 'Materials', icon: BookOpen,    path: '/materials', color: '#059669' },
                ].map(({ label, icon: Icon, path, color }) => (
                    <button key={label} onClick={() => navigate(path)}
                        className="rounded-2xl py-4 flex flex-col items-center gap-2 active:scale-95 transition-transform"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${color}18` }}>
                            <Icon size={16} color={color} />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: '#2C1810' }}>{label}</span>
                    </button>
                ))}
            </div>

            <BottomNav />
        </div>
    );
}
