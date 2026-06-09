import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, HelpCircle, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

export default function DoubtList() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [doubts, setDoubts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const params = filter !== 'all' ? `?status=${filter}` : '';
        api.get(`/doubts${params}`)
            .then(r => setDoubts(r.data.doubts || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [filter]);

    if (loading) return <PageLoader />;

    const isStudent = user?.role === 'student';
    const isSir = user?.role === 'sir';

    return (
        <div className="min-h-screen pb-28 page-fade" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader
                title={isSir ? 'All Doubts' : 'My Doubts'}
                subtitle={`${doubts.length} doubt${doubts.length !== 1 ? 's' : ''}`}
                action={isStudent && (
                    <button onClick={() => navigate('/doubts/submit')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
                        style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                        <Plus size={15} /> Ask
                    </button>
                )}
            />

            {/* Filter */}
            <div className="px-6 mb-4 flex gap-2">
                {['all', 'pending', 'answered'].map((f) => (
                    <button key={f} onClick={() => { setFilter(f); setLoading(true); }}
                        className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={{
                            backgroundColor: filter === f ? '#C1440E' : '#FFFFFF',
                            color: filter === f ? '#F5F0E8' : '#2C1810',
                            border: `1px solid ${filter === f ? '#C1440E' : 'rgba(193,68,14,0.12)'}`,
                        }}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className="px-6 space-y-3">
                {doubts.length === 0 && (
                    <div className="rounded-2xl p-12 text-center"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <HelpCircle size={40} color="#C1440E" opacity={0.2} className="mx-auto mb-3" />
                        <p className="text-sm font-medium" style={{ color: '#2C1810' }}>
                            {filter === 'pending' ? 'All doubts answered!' : 'No doubts yet'}
                        </p>
                        {isStudent && (
                            <button onClick={() => navigate('/doubts/submit')}
                                className="mt-4 px-6 py-2 rounded-xl text-sm font-medium"
                                style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                                Ask a Doubt
                            </button>
                        )}
                    </div>
                )}

                {doubts.map((d) => (
                    <div key={d._id}
                        className="rounded-2xl p-5 shadow-sm cursor-pointer transition-all hover:shadow-md"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}
                        onClick={() => navigate(`/doubts/${d._id}`)}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: 'rgba(193,68,14,0.1)', color: '#C1440E' }}>
                                        {d.subject}
                                    </span>
                                    {d.chapter && (
                                        <span className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>{d.chapter}</span>
                                    )}
                                </div>
                                <p className="text-sm font-semibold line-clamp-2" style={{ color: '#2C1810' }}>
                                    {d.question}
                                </p>
                                {isSir && d.studentId?.name && (
                                    <p className="text-xs mt-1" style={{ color: '#C1440E' }}>
                                        — {d.studentId.name}
                                    </p>
                                )}
                                {d.status === 'answered' && d.answer && (
                                    <p className="text-xs mt-2 line-clamp-1" style={{ color: '#2C1810', opacity: 0.5 }}>
                                        Ans: {d.answer}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                    {d.status === 'answered' ? (
                                        <div className="flex items-center gap-1">
                                            <CheckCircle size={12} color="#16a34a" />
                                            <span className="text-xs" style={{ color: '#16a34a' }}>Answered</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} color="#E8A020" />
                                            <span className="text-xs" style={{ color: '#E8A020' }}>Pending</span>
                                        </div>
                                    )}
                                    <span className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>
                                        {timeAgo(d.createdAt)}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight size={16} color="#C1440E" opacity={0.5} className="flex-shrink-0 mt-1" />
                        </div>
                    </div>
                ))}
            </div>

            <BottomNav />
        </div>
    );
}
