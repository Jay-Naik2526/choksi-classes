import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Award, Target, FileText } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import BottomNav from '../../components/layout/BottomNav';
import { PageLoader } from '../../components/ui/Spinner';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const INK = '#2C1810', TERRA = '#C1440E', GOLD = '#E8A020', GREEN = '#16a34a';

const trendMeta = {
    up:   { Icon: TrendingUp,   color: GREEN, label: 'Improving' },
    down: { Icon: TrendingDown, color: TERRA, label: 'Needs focus' },
    flat: { Icon: Minus,        color: '#94a3b8', label: 'Steady' },
};

function StatCard({ Icon, label, value, color }) {
    return (
        <div className="rounded-2xl p-4 flex flex-col gap-1"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
            <Icon size={16} color={color} />
            <p className="font-bold mt-1" style={{ fontFamily: 'Playfair Display, serif', color: INK, fontSize: 22, lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: 11, color: 'rgba(44,24,16,0.5)' }}>{label}</p>
        </div>
    );
}

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(44,24,16,0.12)', borderRadius: 10, padding: '8px 12px', boxShadow: '0 4px 16px rgba(44,24,16,0.12)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: INK, marginBottom: 4 }}>{payload[0]?.payload?.fullName || label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ fontSize: 11, color: p.color }}>{p.name}: <strong>{p.value}%</strong></p>
            ))}
        </div>
    );
}

export default function Analytics() {
    const { user } = useAuthStore();
    const [params] = useSearchParams();
    const studentId = params.get('studentId') || user?.id;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentId) { setLoading(false); return; }
        api.get(`/users/students/${studentId}/analytics`)
            .then(r => setData(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [studentId]);

    if (loading) return <PageLoader />;

    const overall  = data?.overall || { testsTaken: 0, avgScore: 0, bestScore: 0, recentTrend: 'flat' };
    const trend    = data?.trend || [];
    const subjects = data?.subjects || [];
    const tm = trendMeta[overall.recentTrend] || trendMeta.flat;

    // Chart data — short labels on axis, full name in tooltip
    const trendData = trend.map((t, i) => ({
        idx: `T${i + 1}`,
        fullName: t.name,
        You: t.percentage,
        Class: t.classAvg,
    }));
    const subjectData = subjects.map(s => ({ subject: s.subject, avg: s.avgPercentage }));
    const subjColor = (v) => (v >= 75 ? GREEN : v >= 50 ? GOLD : TERRA);

    return (
        <div className="min-h-screen pb-28" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader
                title="Performance"
                backTo="/dashboard"
                subtitle={data?.studentName ? `${data.studentName}'s progress` : 'Progress analytics'}
            />

            {trend.length === 0 ? (
                <div className="px-6">
                    <div className="rounded-2xl p-12 text-center"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)' }}>
                        <FileText size={36} color={TERRA} style={{ opacity: 0.2, margin: '0 auto 10px' }} />
                        <p className="text-sm font-medium" style={{ color: INK }}>No test data yet</p>
                        <p className="text-xs mt-1" style={{ color: 'rgba(44,24,16,0.45)' }}>
                            Analytics will appear once tests are attempted and results are released.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="px-5 space-y-4">
                    {/* Overall stat cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <StatCard Icon={FileText} label="Tests Taken" value={overall.testsTaken} color={TERRA} />
                        <StatCard Icon={Target} label="Avg Score" value={`${overall.avgScore}%`} color={GOLD} />
                        <StatCard Icon={Award} label="Best Score" value={`${overall.bestScore}%`} color={GREEN} />
                    </div>

                    {/* Trend direction pill */}
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tm.color}18` }}>
                            <tm.Icon size={17} color={tm.color} />
                        </div>
                        <div>
                            <p className="text-sm font-bold" style={{ color: INK }}>{tm.label}</p>
                            <p style={{ fontSize: 11, color: 'rgba(44,24,16,0.5)' }}>Based on your recent tests</p>
                        </div>
                    </div>

                    {/* Trend line: You vs Class */}
                    <div className="rounded-2xl p-4"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold" style={{ fontFamily: 'Playfair Display, serif', color: INK }}>Score Trend</p>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'rgba(44,24,16,0.6)' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: 8, background: TERRA, display: 'inline-block' }} /> You
                                </span>
                                <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'rgba(44,24,16,0.6)' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: 8, background: '#94a3b8', display: 'inline-block' }} /> Class
                                </span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={trendData} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,24,16,0.06)" vertical={false} />
                                <XAxis dataKey="idx" tick={{ fontSize: 11, fill: 'rgba(44,24,16,0.5)' }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'rgba(44,24,16,0.5)' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Line type="monotone" dataKey="You" stroke={TERRA} strokeWidth={2.5} dot={{ r: 3, fill: TERRA }} activeDot={{ r: 5 }} />
                                <Line type="monotone" dataKey="Class" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Subject performance */}
                    <div className="rounded-2xl p-4"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <p className="text-sm font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif', color: INK }}>Subject Performance</p>
                        <ResponsiveContainer width="100%" height={Math.max(140, subjectData.length * 46)}>
                            <BarChart data={subjectData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis type="category" dataKey="subject" width={88}
                                    tick={{ fontSize: 11, fill: INK }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(44,24,16,0.04)' }}
                                    formatter={(v) => [`${v}%`, 'Avg']} />
                                <Bar dataKey="avg" radius={[0, 6, 6, 0]} barSize={18}>
                                    {subjectData.map((s, i) => <Cell key={i} fill={subjColor(s.avg)} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Strengths & weaknesses list */}
                    <div className="rounded-2xl overflow-hidden"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <p className="text-sm font-bold px-4 pt-4 pb-2" style={{ fontFamily: 'Playfair Display, serif', color: INK }}>Subject Breakdown</p>
                        <div className="divide-y" style={{ borderColor: 'rgba(44,24,16,0.05)' }}>
                            {subjects.map((s) => (
                                <div key={s.subject} className="flex items-center justify-between px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: INK }}>{s.subject}</p>
                                        <p style={{ fontSize: 11, color: 'rgba(44,24,16,0.45)' }}>
                                            {s.testsCount} test{s.testsCount !== 1 ? 's' : ''} · best {s.best}% · low {s.worst}%
                                        </p>
                                    </div>
                                    <span className="text-sm font-bold flex-shrink-0 ml-3"
                                        style={{ color: subjColor(s.avgPercentage) }}>{s.avgPercentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
