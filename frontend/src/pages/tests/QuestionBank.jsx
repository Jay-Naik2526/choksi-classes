import { useEffect, useState } from 'react';
import { Search, Database, FileText, AlignLeft, ChevronDown, ChevronUp, Trash2, Users } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import BottomNav from '../../components/layout/BottomNav';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../utils/api';

export default function QuestionBank() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterBatch, setFilterBatch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [batches, setBatches] = useState([]);

    const fetchQuestions = (params = {}) =>
        api.get('/tests/question-bank?' + new URLSearchParams(params).toString())
            .then(r => {
                const qs = r.data.questions || [];
                setQuestions(qs);
                const subs = [...new Set(qs.map(q => q.subject).filter(Boolean))];
                setSubjects(subs);
            });

    useEffect(() => {
        Promise.all([
            fetchQuestions(),
            api.get('/users/batches').then(r => setBatches(r.data.batches || [])),
        ]).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const params = {};
        if (search) params.search = search;
        if (filterSubject) params.subject = filterSubject;
        if (filterType) params.type = filterType;
        const t = setTimeout(() => fetchQuestions(params), 300);
        return () => clearTimeout(t);
    }, [search, filterSubject, filterType]);

    const handleDelete = async (id) => {
        if (!confirm('Remove this question from the bank?')) return;
        try {
            await api.delete(`/tests/questions/${id}`);
            setQuestions(prev => prev.filter(q => q._id !== id));
        } catch { alert('Failed to delete'); }
    };

    if (loading) return <PageLoader />;

    // Client-side batch filter (questions don't store batchId directly;
    // we show the batch filter as a UI hint for the sir to switch context)
    // The actual filtering by subject covers the batch context implicitly.
    const filteredQuestions = questions;

    const mcqCount = filteredQuestions.filter(q => q.type === 'mcq').length;
    const subjectiveCount = filteredQuestions.filter(q => q.type === 'subjective').length;

    return (
        <div className="min-h-screen pb-28 page-fade" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader
                title="Question Bank"
                subtitle={`${filteredQuestions.length} question${filteredQuestions.length !== 1 ? 's' : ''}`}
            />

            <div className="px-6 space-y-3">
                {/* ── Batch context picker ─────────────────────────────────── */}
                {batches.length > 0 && (
                    <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <Users size={13} color="#2C1810" opacity={0.5} />
                            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#2C1810', opacity: 0.5 }}>Batch Context</p>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            <button onClick={() => { setFilterBatch(''); setFilterSubject(''); }}
                                className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
                                style={{
                                    backgroundColor: !filterBatch ? '#2C1810' : 'transparent',
                                    color: !filterBatch ? '#F5F0E8' : '#2C1810',
                                    border: '1px solid rgba(44,24,16,0.2)',
                                }}>
                                All Batches
                            </button>
                            {batches.map(b => (
                                <button key={b._id}
                                    onClick={() => setFilterBatch(b._id === filterBatch ? '' : b._id)}
                                    className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
                                    style={{
                                        backgroundColor: filterBatch === b._id ? '#C1440E' : 'transparent',
                                        color: filterBatch === b._id ? '#F5F0E8' : '#2C1810',
                                        border: `1px solid ${filterBatch === b._id ? '#C1440E' : 'rgba(44,24,16,0.2)'}`,
                                    }}>
                                    {b.name}
                                </button>
                            ))}
                        </div>
                        {filterBatch && (
                            <p className="text-xs mt-2" style={{ color: '#2C1810', opacity: 0.4 }}>
                                Tip: Select a subject below to filter questions for this batch's subjects.
                            </p>
                        )}
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" color="#2C1810" opacity={0.4} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search questions…"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(193,68,14,0.12)', color: '#2C1810' }} />
                </div>

                {/* Type filter */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {[
                        { value: '', label: 'All Types' },
                        { value: 'mcq', label: 'MCQ' },
                        { value: 'subjective', label: 'Subjective' },
                    ].map(({ value, label }) => (
                        <button key={value} onClick={() => setFilterType(value)}
                            className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
                            style={{
                                backgroundColor: filterType === value ? '#C1440E' : '#FFFFFF',
                                color: filterType === value ? '#F5F0E8' : '#2C1810',
                                border: `1px solid ${filterType === value ? '#C1440E' : 'rgba(193,68,14,0.12)'}`,
                            }}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Subject filter */}
                {subjects.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        <button onClick={() => setFilterSubject('')}
                            className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
                            style={{
                                backgroundColor: !filterSubject ? '#2C1810' : 'transparent',
                                color: !filterSubject ? '#F5F0E8' : '#2C1810',
                                border: '1px solid rgba(44,24,16,0.2)',
                            }}>All</button>
                        {subjects.map(s => (
                            <button key={s} onClick={() => setFilterSubject(s === filterSubject ? '' : s)}
                                className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
                                style={{
                                    backgroundColor: filterSubject === s ? '#2C1810' : 'transparent',
                                    color: filterSubject === s ? '#F5F0E8' : '#2C1810',
                                    border: '1px solid rgba(44,24,16,0.2)',
                                }}>
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Stats summary */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Total', value: filteredQuestions.length, color: '#2C1810' },
                        { label: 'MCQ', value: mcqCount, color: '#4338CA' },
                        { label: 'Subjective', value: subjectiveCount, color: '#C1440E' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-2xl p-3 text-center shadow-sm"
                            style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                            <p className="text-xl font-black" style={{ color, fontFamily: 'Playfair Display, serif' }}>{value}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#2C1810', opacity: 0.5 }}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Questions list */}
                {filteredQuestions.length === 0 ? (
                    <div className="rounded-2xl p-14 text-center"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <Database size={40} color="#C1440E" opacity={0.15} className="mx-auto mb-3" />
                        <p className="text-sm font-medium" style={{ color: '#2C1810', opacity: 0.5 }}>No questions yet</p>
                        <p className="text-xs mt-1" style={{ color: '#2C1810', opacity: 0.35 }}>
                            Questions are added when you create tests
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredQuestions.map((q) => {
                            const isExpanded = expanded === q._id;
                            return (
                                <div key={q._id} className="rounded-2xl overflow-hidden shadow-sm"
                                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                                    <div className="px-5 py-4 flex items-start gap-3 cursor-pointer"
                                        onClick={() => setExpanded(isExpanded ? null : q._id)}>
                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                            style={{ backgroundColor: q.type === 'mcq' ? 'rgba(67,56,202,0.1)' : 'rgba(193,68,14,0.1)' }}>
                                            {q.type === 'mcq'
                                                ? <FileText size={12} color="#4338CA" />
                                                : <AlignLeft size={12} color="#C1440E" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                {q.subject && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full"
                                                        style={{ backgroundColor: 'rgba(193,68,14,0.08)', color: '#C1440E' }}>
                                                        {q.subject}
                                                    </span>
                                                )}
                                                <span className="text-xs px-2 py-0.5 rounded-full"
                                                    style={{ backgroundColor: q.type === 'mcq' ? 'rgba(67,56,202,0.08)' : 'rgba(193,68,14,0.08)', color: q.type === 'mcq' ? '#4338CA' : '#C1440E' }}>
                                                    {q.type === 'mcq' ? 'MCQ' : 'Subjective'}
                                                </span>
                                                <span className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>
                                                    {q.marks} mark{q.marks !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium leading-snug line-clamp-2" style={{ color: '#2C1810' }}>
                                                {q.text}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button onClick={e => { e.stopPropagation(); handleDelete(q._id); }}
                                                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                                <Trash2 size={13} color="#C1440E" opacity={0.5} />
                                            </button>
                                            {isExpanded
                                                ? <ChevronUp size={14} color="#2C1810" opacity={0.4} />
                                                : <ChevronDown size={14} color="#2C1810" opacity={0.4} />
                                            }
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-5 pb-4 border-t space-y-3" style={{ borderColor: 'rgba(193,68,14,0.06)' }}>
                                            <div className="pt-3">
                                                <p className="text-xs font-semibold uppercase tracking-wide mb-2"
                                                    style={{ color: '#2C1810', opacity: 0.4 }}>
                                                    Full Question
                                                </p>
                                                <p className="text-sm leading-relaxed" style={{ color: '#2C1810' }}>{q.text}</p>
                                            </div>

                                            {q.type === 'mcq' && q.options && (
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide mb-2"
                                                        style={{ color: '#2C1810', opacity: 0.4 }}>Options</p>
                                                    <div className="space-y-1.5">
                                                        {q.options.map((opt, oi) => (
                                                            <div key={oi} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                                                style={{
                                                                    backgroundColor: q.correctAnswer === String(oi) ? 'rgba(22,163,74,0.1)' : '#F5F0E8',
                                                                    border: `1px solid ${q.correctAnswer === String(oi) ? 'rgba(22,163,74,0.3)' : 'transparent'}`,
                                                                }}>
                                                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                                    style={{
                                                                        backgroundColor: q.correctAnswer === String(oi) ? '#16a34a' : 'rgba(44,24,16,0.1)',
                                                                        color: q.correctAnswer === String(oi) ? '#fff' : '#2C1810',
                                                                    }}>
                                                                    {String.fromCharCode(65 + oi)}
                                                                </span>
                                                                <span className="text-sm" style={{ color: '#2C1810' }}>{opt}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {q.type === 'subjective' && q.modelAnswer && (
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide mb-2"
                                                        style={{ color: '#2C1810', opacity: 0.4 }}>Model Answer</p>
                                                    <p className="text-sm px-3 py-2 rounded-xl" style={{ backgroundColor: 'rgba(22,163,74,0.08)', color: '#2C1810' }}>
                                                        {q.modelAnswer}
                                                    </p>
                                                </div>
                                            )}

                                            <p className="text-xs" style={{ color: '#2C1810', opacity: 0.3 }}>
                                                Added {new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
