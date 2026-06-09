import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../utils/api';

export default function AttemptTest() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [started, setStarted] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Refs so timer callbacks always see latest values
    const answersRef = useRef({});
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const submittingRef = useRef(false);

    // Keep answersRef in sync with state
    useEffect(() => { answersRef.current = answers; }, [answers]);

    useEffect(() => {
        api.get(`/tests/${id}`)
            .then(r => {
                setTest(r.data.test);
                setTimeLeft(r.data.test.duration * 60);
            })
            .catch(err => {
                if (err.response?.data?.message === 'Already submitted') setAlreadySubmitted(true);
                else navigate('/tests');
            })
            .finally(() => setLoading(false));
    }, [id]);

    // Warn before leaving mid-test
    useEffect(() => {
        if (!started) return;
        const handler = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [started]);

    useEffect(() => {
        if (!started) return;
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    // Use ref-based submit to avoid stale closure
                    if (!submittingRef.current) doSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [started]);

    const doSubmit = async (auto = false) => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);
        clearInterval(timerRef.current);

        const timeTaken = startTimeRef.current
            ? Math.floor((Date.now() - startTimeRef.current) / 60000)
            : test.duration;

        try {
            const currentAnswers = answersRef.current;
            const answersArr = test.questions.map(q => ({
                questionId: q._id,
                selectedOption: currentAnswers[q._id]?.selectedOption || null,
                textAnswer: currentAnswers[q._id]?.textAnswer || '',
            }));
            await api.post(`/tests/${id}/attempt`, { answers: answersArr, timeTaken });
            navigate('/tests', { state: { submitted: true } });
        } catch (err) {
            submittingRef.current = false;
            setSubmitting(false);
        }
    };

    const handleSubmit = (auto = false) => {
        if (!auto && !showConfirm) { setShowConfirm(true); return; }
        setShowConfirm(false);
        doSubmit(auto);
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return <PageLoader />;

    if (alreadySubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#F7F4EF' }}>
                <div className="rounded-2xl p-8 text-center shadow-sm max-w-sm w-full"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <AlertCircle size={40} color="#C1440E" className="mx-auto mb-3" />
                    <h2 className="text-lg font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                        Already Submitted
                    </h2>
                    <p className="text-sm mb-6" style={{ color: '#2C1810', opacity: 0.6 }}>
                        You have already attempted this test. Wait for results to be released.
                    </p>
                    <button onClick={() => navigate('/tests')}
                        className="w-full py-3 rounded-xl font-semibold text-sm"
                        style={{ backgroundColor: '#2C1810', color: '#F5F0E8' }}>
                        Back to Tests
                    </button>
                </div>
            </div>
        );
    }

    if (!test) return null;

    const q = test.questions[current];
    const answered = Object.keys(answers).length;
    const isLast = current === test.questions.length - 1;
    const isUrgent = timeLeft < 300;

    if (!started) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#F7F4EF' }}>
                <div className="w-full max-w-sm">
                    <div className="rounded-2xl p-8 shadow-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                style={{ backgroundColor: 'rgba(193,68,14,0.1)' }}>
                                <Clock size={28} color="#C1440E" />
                            </div>
                            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                                {test.name}
                            </h2>
                            <p className="text-sm" style={{ color: '#2C1810', opacity: 0.5 }}>{test.subject}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {[
                                { label: 'Questions', value: test.questions.length },
                                { label: 'Duration', value: `${test.duration}m` },
                                { label: 'Marks', value: test.totalMarks },
                            ].map(({ label, value }) => (
                                <div key={label} className="text-center p-3 rounded-xl" style={{ backgroundColor: '#F7F4EF' }}>
                                    <p className="text-lg font-bold" style={{ color: '#C1440E' }}>{value}</p>
                                    <p className="text-xs" style={{ color: '#2C1810', opacity: 0.5 }}>{label}</p>
                                </div>
                            ))}
                        </div>

                        {test.instructions && (
                            <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: '#F7F4EF', border: '1px solid rgba(193,68,14,0.1)' }}>
                                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#C1440E' }}>Instructions</p>
                                <p className="text-sm" style={{ color: '#2C1810', opacity: 0.7 }}>{test.instructions}</p>
                            </div>
                        )}

                        <button onClick={() => setStarted(true)}
                            className="w-full py-3.5 rounded-xl font-bold text-sm"
                            style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                            Start Test
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F4EF' }}>
            {/* Top bar */}
            <div className="px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40"
                style={{ backgroundColor: '#2C1810' }}>
                <div>
                    <p className="text-xs font-medium" style={{ color: '#F5F0E8', opacity: 0.6 }}>{test.name}</p>
                    <p className="text-xs" style={{ color: '#F5F0E8', opacity: 0.4 }}>
                        Q {current + 1}/{test.questions.length} · {answered} answered
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                    style={{ backgroundColor: isUrgent ? '#C1440E' : 'rgba(245,240,232,0.15)' }}>
                    <Clock size={13} color="#F5F0E8" />
                    <span className="text-sm font-bold" style={{ color: '#F5F0E8' }}>{formatTime(timeLeft)}</span>
                </div>
            </div>

            {/* Question palette */}
            <div className="px-4 py-2.5 flex gap-1.5 overflow-x-auto"
                style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(193,68,14,0.08)' }}>
                {test.questions.map((_, i) => (
                    <button key={i} onClick={() => setCurrent(i)}
                        className="w-7 h-7 rounded-lg flex-shrink-0 text-xs font-bold transition-all"
                        style={{
                            backgroundColor: i === current ? '#C1440E' : answers[test.questions[i]._id] ? '#16a34a' : '#F5F0E8',
                            color: (i === current || answers[test.questions[i]._id]) ? '#FFFFFF' : '#2C1810',
                        }}>
                        {i + 1}
                    </button>
                ))}
            </div>

            {/* Question */}
            <div className="flex-1 px-5 py-5">
                <div className="rounded-2xl p-5 shadow-sm mb-4"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>{current + 1}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: 'rgba(193,68,14,0.1)', color: '#C1440E' }}>
                            {q.type === 'mcq' ? 'MCQ' : 'Subjective'} · {q.marks} marks
                        </span>
                    </div>
                    <p className="text-base font-semibold leading-relaxed"
                        style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                        {q.text}
                    </p>
                </div>

                {q.type === 'mcq' ? (
                    <div className="space-y-2.5">
                        {q.options.map((opt, i) => (
                            <button key={i}
                                onClick={() => setAnswers(prev => ({ ...prev, [q._id]: { selectedOption: String(i) } }))}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
                                style={{
                                    backgroundColor: answers[q._id]?.selectedOption === String(i) ? '#C1440E' : '#FFFFFF',
                                    border: `2px solid ${answers[q._id]?.selectedOption === String(i) ? '#C1440E' : 'rgba(193,68,14,0.12)'}`,
                                    color: answers[q._id]?.selectedOption === String(i) ? '#F5F0E8' : '#2C1810',
                                }}>
                                <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                                    style={{
                                        backgroundColor: answers[q._id]?.selectedOption === String(i) ? 'rgba(255,255,255,0.2)' : 'rgba(193,68,14,0.1)',
                                        color: answers[q._id]?.selectedOption === String(i) ? '#F5F0E8' : '#C1440E',
                                    }}>
                                    {['A', 'B', 'C', 'D'][i]}
                                </span>
                                <span className="text-sm">{opt}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl p-4 shadow-sm"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-2"
                            style={{ color: '#2C1810', opacity: 0.6 }}>Your Answer</label>
                        <textarea
                            value={answers[q._id]?.textAnswer || ''}
                            onChange={e => setAnswers(prev => ({ ...prev, [q._id]: { textAnswer: e.target.value } }))}
                            rows={5} placeholder="Write your answer here..."
                            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                            style={{ backgroundColor: '#F7F4EF', border: '1.5px solid transparent', color: '#2C1810' }}
                            onFocus={e => e.target.style.borderColor = '#C1440E'}
                            onBlur={e => e.target.style.borderColor = 'transparent'} />
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="px-5 py-4 flex gap-3"
                style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid rgba(193,68,14,0.08)' }}>
                <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: '#F7F4EF', color: '#2C1810', opacity: current === 0 ? 0.4 : 1 }}>
                    <ChevronLeft size={16} /> Prev
                </button>

                {!isLast ? (
                    <button onClick={() => setCurrent(current + 1)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold"
                        style={{ backgroundColor: '#2C1810', color: '#F5F0E8' }}>
                        Next <ChevronRight size={16} />
                    </button>
                ) : (
                    <button onClick={() => handleSubmit()}
                        className="flex-1 py-3 rounded-xl text-sm font-bold"
                        style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                        Submit Test
                    </button>
                )}
            </div>

            <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Submit Test?" size="sm">
                <div className="text-center">
                    <AlertCircle size={36} color="#C1440E" className="mx-auto mb-3" />
                    <p className="text-sm mb-2" style={{ color: '#2C1810' }}>
                        You have answered {answered} of {test.questions.length} questions.
                    </p>
                    {answered < test.questions.length && (
                        <p className="text-xs mb-4 px-3 py-2 rounded-xl"
                            style={{ backgroundColor: 'rgba(193,68,14,0.08)', color: '#C1440E' }}>
                            {test.questions.length - answered} question(s) unanswered
                        </p>
                    )}
                    <p className="text-xs mb-6" style={{ color: '#2C1810', opacity: 0.5 }}>This action cannot be undone.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowConfirm(false)}
                            className="flex-1 py-3 rounded-xl text-sm font-medium"
                            style={{ backgroundColor: '#F7F4EF', color: '#2C1810' }}>
                            Review
                        </button>
                        <button onClick={() => handleSubmit(true)} disabled={submitting}
                            className="flex-1 py-3 rounded-xl text-sm font-bold"
                            style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                            {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
