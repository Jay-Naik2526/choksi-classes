import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Bell, Trash2, AlertCircle, Calendar, Video } from 'lucide-react';
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

const priorityColor = {
    urgent: '#C1440E',
    holiday: '#E8A020',
    normal: '#2C1810',
};

export default function NoticeList() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        api.get('/notices')
            .then(r => setNotices(r.data.notices || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Delete this notice?')) return;
        await api.delete(`/notices/${id}`);
        setNotices(prev => prev.filter(n => n._id !== id));
    };

    const filtered = filter === 'all' ? notices : notices.filter(n => n.priority === filter);
    const isSir = user?.role === 'sir';

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-screen pb-28 page-fade" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader
                title="Notice Board"
                subtitle={`${notices.length} notice${notices.length !== 1 ? 's' : ''}`}
                action={isSir && (
                    <button onClick={() => navigate('/notices/create')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
                        style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                        <Plus size={15} /> Post
                    </button>
                )}
            />

            {/* Filter pills */}
            <div className="px-6 mb-4 flex gap-2 overflow-x-auto pb-1">
                {['all', 'urgent', 'normal', 'holiday'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
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
                {filtered.length === 0 && (
                    <div className="rounded-2xl p-14 text-center"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <Bell size={40} color="#C1440E" opacity={0.15} className="mx-auto mb-3" />
                        <p className="text-sm font-medium" style={{ color: '#2C1810', opacity: 0.5 }}>No notices yet</p>
                    </div>
                )}

                {filtered.map(n => {
                    const leftColor = priorityColor[n.priority] || '#2C1810';
                    return (
                        <div key={n._id} className="rounded-2xl p-5 shadow-sm"
                            style={{
                                backgroundColor: '#FFFFFF',
                                border: `1px solid ${n.priority === 'urgent' ? 'rgba(193,68,14,0.2)' : 'rgba(193,68,14,0.08)'}`,
                                borderLeft: `4px solid ${leftColor}`,
                            }}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        {n.priority === 'urgent' && <AlertCircle size={13} color="#C1440E" />}
                                        <Badge label={n.priority} variant={n.priority} />
                                        {n.targetRole !== 'all' && (
                                            <span className="text-xs px-2 py-0.5 rounded-full"
                                                style={{ backgroundColor: 'rgba(44,24,16,0.06)', color: '#2C1810' }}>
                                                For {n.targetRole}s
                                            </span>
                                        )}
                                        {n.link && (
                                            <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                                                style={{ backgroundColor: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>
                                                <Video size={10} /> Live Class
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-base font-bold mb-2"
                                        style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                                        {n.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed" style={{ color: '#2C1810', opacity: 0.7 }}>
                                        {n.body}
                                    </p>

                                    {/* Join Class button */}
                                    {n.link && (
                                        <a href={n.link} target="_blank" rel="noopener noreferrer"
                                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                                            style={{ backgroundColor: '#2563eb', color: '#fff' }}>
                                            <Video size={12} /> Join Live Class
                                        </a>
                                    )}

                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={11} color="#2C1810" opacity={0.4} />
                                            <span className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>
                                                {timeAgo(n.createdAt)}
                                            </span>
                                        </div>
                                        {n.createdBy?.name && (
                                            <span className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>
                                                · {n.createdBy.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {isSir && (
                                    <button onClick={() => handleDelete(n._id)}
                                        className="p-2 rounded-xl transition-colors hover:bg-red-50 flex-shrink-0">
                                        <Trash2 size={15} color="#C1440E" opacity={0.5} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <BottomNav />
        </div>
    );
}
