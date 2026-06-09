import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, Award, ChevronRight, Play, Eye, Database } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

export default function TestList() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const params = filter !== 'all' ? `?status=${filter}` : '';
        api.get(`/tests${params}`)
            .then(r => setTests(r.data.tests || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [filter]);

    const handlePublish = async (id, current) => {
        const status = current === 'draft' ? 'published' : 'draft';
        await api.put(`/tests/${id}`, { status });
        setTests(prev => prev.map(t => t._id === id ? { ...t, status } : t));
    };

    const handleRelease = async (id) => {
        await api.patch(`/tests/${id}/release`);
        setTests(prev => prev.map(t => t._id === id ? { ...t, status: 'results_released' } : t));
    };

    if (loading) return <PageLoader />;

    const isSir = user?.role === 'sir';
    const isStudent = user?.role === 'student';

    const filters = isSir
        ? ['all', 'draft', 'published', 'completed', 'results_released']
        : ['all', 'published', 'active', 'results_released'];

    return (
        <div className="min-h-screen pb-28 page-fade" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader
                title="Tests"
                subtitle={`${tests.length} test${tests.length !== 1 ? 's' : ''}`}
                action={isSir && (
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/tests/question-bank')}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                            style={{ backgroundColor: '#F7F4EF', color: '#2C1810', border: '1px solid rgba(44,24,16,0.15)' }}>
                            <Database size={13} /> Bank
                        </button>
                        <button onClick={() => navigate('/tests/create')}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                            style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                            <Plus size={13} /> Create
                        </button>
                    </div>
                )}
            />

            <div className="px-6 mb-4 flex gap-2 overflow-x-auto pb-1">
                {filters.map((f) => (
                    <button key={f} onClick={() => { setFilter(f); setLoading(true); }}
                        className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                        style={{
                            backgroundColor: filter === f ? '#C1440E' : '#FFFFFF',
                            color: filter === f ? '#F5F0E8' : '#2C1810',
                            border: `1px solid ${filter === f ? '#C1440E' : 'rgba(193,68,14,0.12)'}`,
                        }}>
                        {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </button>
                ))}
            </div>

            <div className="px-6 space-y-3">
                {tests.length === 0 && (
                    <div className="rounded-2xl p-12 text-center"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <FileText size={40} color="#C1440E" opacity={0.2} className="mx-auto mb-3" />
                        <p className="text-sm font-medium" style={{ color: '#2C1810' }}>No tests found</p>
                        {isSir && (
                            <button onClick={() => navigate('/tests/create')}
                                className="mt-4 px-6 py-2 rounded-xl text-sm font-medium"
                                style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                                Create First Test
                            </button>
                        )}
                    </div>
                )}

                {tests.map((test) => {
                    const attempt = test.attempt;
                    const testDate = new Date(test.date);
                    const isPast = testDate < new Date();
                    const daysLeft = Math.ceil((testDate - new Date()) / 86400000);

                    return (
                        <div key={test._id} className="rounded-2xl p-5 shadow-sm"
                            style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge label={test.status} variant={test.status} />
                                        {test.batchId && (
                                            <span className="text-xs" style={{ color: '#2C1810', opacity: 0.5 }}>
                                                {test.batchId.name}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-base font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                                        {test.name}
                                    </h3>
                                    <p className="text-xs mt-1" style={{ color: '#2C1810', opacity: 0.5 }}>
                                        {test.subject} · {test.totalMarks} marks · {test.duration} min
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-semibold" style={{ color: !isPast && daysLeft <= 1 ? '#C1440E' : '#2C1810' }}>
                                        {testDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </p>
                                    {!isPast && (
                                        <p className="text-xs" style={{ color: daysLeft <= 1 ? '#C1440E' : '#2C1810', opacity: 0.5 }}>
                                            {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `in ${daysLeft} days`}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Student score if attempted */}
                            {isStudent && attempt && (
                                <div className="flex items-center gap-2 p-3 rounded-xl mb-3"
                                    style={{ backgroundColor: attempt.percentage >= 75 ? 'rgba(22,163,74,0.08)' : attempt.percentage >= 50 ? 'rgba(232,160,32,0.08)' : 'rgba(193,68,14,0.08)' }}>
                                    <Award size={15} color={attempt.percentage >= 75 ? '#16a34a' : attempt.percentage >= 50 ? '#E8A020' : '#C1440E'} />
                                    <span className="text-sm font-bold"
                                        style={{ color: attempt.percentage >= 75 ? '#16a34a' : attempt.percentage >= 50 ? '#E8A020' : '#C1440E' }}>
                                        {attempt.score}/{test.totalMarks} ({attempt.percentage}%)
                                    </span>
                                    <Badge label={attempt.status} variant={attempt.status} />
                                </div>
                            )}

                            <div className="flex gap-2 mt-3">
                                {isSir && (
                                    <>
                                        <button onClick={() => handlePublish(test._id, test.status)}
                                            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                                            style={{
                                                backgroundColor: test.status === 'draft' ? '#C1440E' : '#F5F0E8',
                                                color: test.status === 'draft' ? '#F5F0E8' : '#2C1810',
                                            }}>
                                            {test.status === 'draft' ? 'Publish' : 'Unpublish'}
                                        </button>
                                        <button onClick={() => navigate(`/tests/${test._id}/result`)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                                            style={{ backgroundColor: '#F7F4EF', color: '#2C1810' }}>
                                            <Eye size={13} /> Results
                                        </button>
                                        {['completed', 'published'].includes(test.status) && (
                                            <button onClick={() => handleRelease(test._id)}
                                                className="px-3 py-2 rounded-xl text-xs font-medium"
                                                style={{ backgroundColor: '#16a34a', color: '#FFFFFF' }}>
                                                Release
                                            </button>
                                        )}
                                    </>
                                )}
                                {isStudent && !attempt && ['published', 'active'].includes(test.status) && (
                                    <button onClick={() => navigate(`/tests/${test._id}/attempt`)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
                                        style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                                        <Play size={14} fill="#F5F0E8" /> Attempt Test
                                    </button>
                                )}
                                {isStudent && attempt?.status === 'submitted' && test.status !== 'results_released' && (
                                    <div className="flex-1 py-2.5 rounded-xl text-sm text-center"
                                        style={{ backgroundColor: '#F7F4EF', color: '#2C1810', opacity: 0.7 }}>
                                        Awaiting results
                                    </div>
                                )}
                                {isStudent && test.status === 'results_released' && attempt && (
                                    <button onClick={() => navigate(`/tests/${test._id}/result`)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
                                        style={{ backgroundColor: '#2C1810', color: '#F5F0E8' }}>
                                        <Award size={14} /> View Result
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
