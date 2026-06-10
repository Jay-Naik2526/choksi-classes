import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Spinner from '../../components/ui/Spinner';
import api from '../../utils/api';

const emptyMCQ = () => ({ type: 'mcq', text: '', options: ['', '', '', ''], correctAnswer: '0', marks: 1, chapter: '', difficulty: 'medium' });
const emptySubjective = () => ({ type: 'subjective', text: '', marks: 5, chapter: '', difficulty: 'medium' });

export default function CreateTest() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [batches, setBatches] = useState([]);
    const [details, setDetails] = useState({
        name: '', subject: '', batchId: '', date: '', duration: 60, totalMarks: 100, instructions: '',
    });
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        api.get('/users/batches').then(r => setBatches(r.data.batches || []));
    }, []);

    const handleDetail = (k, v) => setDetails(p => ({ ...p, [k]: v }));

    const addQuestion = (type) => {
        const q = type === 'mcq' ? emptyMCQ() : emptySubjective();
        setQuestions(prev => [...prev, q]);
        setExpanded(questions.length);
    };

    const updateQuestion = (i, k, v) => {
        setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [k]: v } : q));
    };

    const updateOption = (qi, oi, v) => {
        setQuestions(prev => prev.map((q, idx) => {
            if (idx !== qi) return q;
            const opts = [...q.options];
            opts[oi] = v;
            return { ...q, options: opts };
        }));
    };

    const removeQuestion = (i) => {
        setQuestions(prev => prev.filter((_, idx) => idx !== i));
        if (expanded === i) setExpanded(null);
    };

    const totalQMarks = questions.reduce((s, q) => s + (parseInt(q.marks) || 0), 0);

    const handleSubmit = async (status = 'draft') => {
        if (!details.name || !details.subject || !details.date) return setError('Name, subject, and date required');
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...details,
                duration: parseInt(details.duration),
                totalMarks: parseInt(details.totalMarks) || totalQMarks,
                questions: questions.map(q => ({
                    ...q,
                    marks: parseInt(q.marks),
                    options: q.type === 'mcq' ? q.options : undefined,
                    correctAnswer: q.type === 'mcq' ? q.correctAnswer : undefined,
                })),
            };
            const res = await api.post('/tests', payload);
            if (status === 'published') {
                await api.put(`/tests/${res.data.test._id}`, { status: 'published' });
            }
            navigate('/tests');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create test');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none";
    const inputStyle = { backgroundColor: '#F7F4EF', border: '1.5px solid transparent', color: '#2C1810' };
    const fh = { onFocus: e => e.target.style.borderColor = '#C1440E', onBlur: e => e.target.style.borderColor = 'transparent' };

    return (
        <div className="min-h-screen pb-10" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader
                title="Create Test"
                backTo="/tests"
                subtitle={step === 1 ? 'Step 1: Test Details' : `Step 2: Questions (${questions.length} added · ${totalQMarks} marks)`}
            />

            {/* Step indicator */}
            <div className="px-6 mb-5">
                <div className="flex items-center gap-3">
                    {[1, 2].map(s => (
                        <div key={s} className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: step >= s ? '#C1440E' : '#FFFFFF', color: step >= s ? '#F5F0E8' : '#2C1810', border: `2px solid ${step >= s ? '#C1440E' : 'rgba(193,68,14,0.2)'}` }}>
                                {s}
                            </div>
                            <span className="text-xs font-medium" style={{ color: step === s ? '#C1440E' : '#2C1810', opacity: step === s ? 1 : 0.4 }}>
                                {s === 1 ? 'Details' : 'Questions'}
                            </span>
                            {s < 2 && <div className="w-8 h-px" style={{ backgroundColor: 'rgba(193,68,14,0.2)' }} />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-6 space-y-4">
                {step === 1 ? (
                    <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Test Name *</label>
                                <input value={details.name} onChange={e => handleDetail('name', e.target.value)}
                                    placeholder="e.g. Mid-Term Mathematics Test"
                                    className={inputCls} style={inputStyle} {...fh} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Subject *</label>
                                    <input value={details.subject} onChange={e => handleDetail('subject', e.target.value)}
                                        placeholder="e.g. Mathematics"
                                        className={inputCls} style={inputStyle} {...fh} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Batch</label>
                                    <select value={details.batchId} onChange={e => handleDetail('batchId', e.target.value)}
                                        className={inputCls} style={inputStyle}>
                                        <option value="">All batches</option>
                                        {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Date *</label>
                                    <input type="datetime-local" value={details.date} onChange={e => handleDetail('date', e.target.value)}
                                        className={inputCls} style={inputStyle} {...fh} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Duration (min)</label>
                                    <input type="number" value={details.duration} onChange={e => handleDetail('duration', e.target.value)}
                                        className={inputCls} style={inputStyle} {...fh} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Total Marks</label>
                                    <input type="number" value={details.totalMarks} onChange={e => handleDetail('totalMarks', e.target.value)}
                                        className={inputCls} style={inputStyle} {...fh} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Instructions</label>
                                <textarea value={details.instructions} onChange={e => handleDetail('instructions', e.target.value)}
                                    rows={3} placeholder="Instructions for students..."
                                    className={inputCls + " resize-none"} style={inputStyle} {...fh} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {questions.map((q, i) => (
                            <div key={i} className="rounded-2xl shadow-sm overflow-hidden"
                                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                                <div className="flex items-center justify-between px-5 py-4 cursor-pointer"
                                    onClick={() => setExpanded(expanded === i ? null : i)}>
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                            style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>{i + 1}</span>
                                        <div>
                                            <p className="text-sm font-semibold truncate max-w-xs" style={{ color: '#2C1810' }}>
                                                {q.text || `${q.type === 'mcq' ? 'MCQ' : 'Subjective'} Question ${i + 1}`}
                                            </p>
                                            <p className="text-xs" style={{ color: '#2C1810', opacity: 0.5 }}>
                                                {q.type.toUpperCase()} · {q.marks} mark{q.marks > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={e => { e.stopPropagation(); removeQuestion(i); }}
                                            className="p-1.5 rounded-lg hover:bg-red-50">
                                            <Trash2 size={14} color="#C1440E" opacity={0.5} />
                                        </button>
                                        {expanded === i ? <ChevronUp size={16} color="#2C1810" opacity={0.4} /> : <ChevronDown size={16} color="#2C1810" opacity={0.4} />}
                                    </div>
                                </div>

                                {expanded === i && (
                                    <div className="px-5 pb-5 space-y-3 border-t" style={{ borderColor: 'rgba(193,68,14,0.06)' }}>
                                        <div className="pt-3">
                                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Question *</label>
                                            <textarea value={q.text} onChange={e => updateQuestion(i, 'text', e.target.value)}
                                                rows={2} placeholder="Enter question text..."
                                                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                                                style={inputStyle} {...fh} />
                                        </div>

                                        {q.type === 'mcq' && (
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#2C1810', opacity: 0.6 }}>Options (select correct)</label>
                                                {q.options.map((opt, oi) => (
                                                    <div key={oi} className="flex items-center gap-2 mb-2">
                                                        <button type="button" onClick={() => updateQuestion(i, 'correctAnswer', String(oi))}
                                                            className="w-5 h-5 rounded-full flex-shrink-0 border-2 transition-all"
                                                            style={{ borderColor: q.correctAnswer === String(oi) ? '#16a34a' : 'rgba(44,24,16,0.2)', backgroundColor: q.correctAnswer === String(oi) ? '#16a34a' : 'transparent' }} />
                                                        <input value={opt} onChange={e => updateOption(i, oi, e.target.value)}
                                                            placeholder={`Option ${oi + 1}`}
                                                            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                                                            style={inputStyle} {...fh} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Marks</label>
                                                <input type="number" value={q.marks} onChange={e => updateQuestion(i, 'marks', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} {...fh} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Chapter</label>
                                                <input value={q.chapter} onChange={e => updateQuestion(i, 'chapter', e.target.value)}
                                                    placeholder="Optional" className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} {...fh} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Difficulty</label>
                                                <select value={q.difficulty} onChange={e => updateQuestion(i, 'difficulty', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
                                                    <option value="easy">Easy</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="hard">Hard</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Add question buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => addQuestion('mcq')}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                                style={{ border: '2px dashed rgba(193,68,14,0.3)', color: '#C1440E' }}>
                                <Plus size={15} /> Add MCQ
                            </button>
                            <button onClick={() => addQuestion('subjective')}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                                style={{ border: '2px dashed rgba(44,24,16,0.2)', color: '#2C1810' }}>
                                <Plus size={15} /> Add Subjective
                            </button>
                        </div>
                    </>
                )}

                {error && (
                    <p className="text-xs py-2 text-center rounded-lg" style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>{error}</p>
                )}

                <div className="flex gap-3">
                    {step === 1 ? (
                        <button onClick={() => { if (!details.name || !details.subject || !details.date) return setError('Fill required fields'); setError(''); setStep(2); }}
                            className="flex-1 py-3.5 rounded-xl font-semibold text-sm"
                            style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                            Next: Add Questions →
                        </button>
                    ) : (
                        <>
                            <button onClick={() => setStep(1)}
                                className="px-6 py-3.5 rounded-xl font-medium text-sm"
                                style={{ backgroundColor: '#F7F4EF', color: '#2C1810' }}>
                                Back
                            </button>
                            <button onClick={() => handleSubmit('draft')} disabled={loading}
                                className="flex-1 py-3.5 rounded-xl font-medium text-sm"
                                style={{ backgroundColor: '#F7F4EF', color: '#2C1810' }}>
                                {loading ? <Spinner size="sm" /> : 'Save as Draft'}
                            </button>
                            <button onClick={() => handleSubmit('published')} disabled={loading}
                                className="flex-1 py-3.5 rounded-xl font-semibold text-sm"
                                style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                                {loading ? <Spinner size="sm" color="#F5F0E8" /> : 'Publish →'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
