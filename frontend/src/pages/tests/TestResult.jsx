import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Award, CheckCircle, XCircle, ChevronDown, ChevronUp,
    Users, TrendingUp, PenLine, Save, ArrowLeft, BarChart2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageHeader from '../../components/layout/PageHeader';
import BottomNav from '../../components/layout/BottomNav';
import { PageLoader } from '../../components/ui/Spinner';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

// ─── Sir: individual student grading sheet ─────────────────────────────────
function GradingSheet({ attempt, totalMarks, testId, onBack, onSaved }) {
    const [marks, setMarks] = useState({});
    const [saving, setSaving] = useState(null);
    const [saved, setSaved] = useState({});

    const hasSubjective = attempt.answers.some(a => {
        const q = a.questionId;
        return q && q.type === 'subjective';
    });

    const saveGrade = async (ans) => {
        const q = ans.questionId;
        const awarded = Number(marks[q._id] ?? ans.marksAwarded ?? 0);
        if (awarded < 0 || awarded > q.marks) return;
        setSaving(q._id);
        try {
            await api.patch(`/tests/${testId}/grade`, {
                attemptId: attempt._id,
                questionId: q._id,
                marksAwarded: awarded,
            });
            setSaved(prev => ({ ...prev, [q._id]: true }));
            onSaved();
        } catch (e) {
            alert('Failed to save. Try again.');
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="min-h-screen pb-28 page-fade" style={{ backgroundColor: '#F7F4EF' }}>
            <div className="sticky top-0 z-10 px-6 pt-safe"
                style={{ backgroundColor: '#F7F4EF', paddingTop: '1rem', paddingBottom: '0.75rem' }}>
                <button onClick={onBack} className="flex items-center gap-2 mb-3">
                    <ArrowLeft size={16} color="#C1440E" />
                    <span className="text-sm font-semibold" style={{ color: '#C1440E' }}>Back to Results</span>
                </button>
                <div className="rounded-2xl p-4 shadow-sm"
                    style={{ backgroundColor: '#2C1810' }}>
                    <p className="text-lg font-black" style={{ color: '#F5F0E8', fontFamily: 'Playfair Display, serif' }}>
                        {attempt.studentId?.name || 'Student'}
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: '#F5F0E8', opacity: 0.6 }}>
                        Score: {attempt.score} / {totalMarks} &nbsp;·&nbsp; {attempt.percentage}%
                        {attempt.studentId?.rollNumber && ` · Roll #${attempt.studentId.rollNumber}`}
                    </p>
                    {!hasSubjective && (
                        <p className="text-xs mt-2 px-2 py-1 rounded-lg inline-block"
                            style={{ backgroundColor: 'rgba(22,163,74,0.2)', color: '#4ade80' }}>
                            All MCQ — auto-graded
                        </p>
                    )}
                </div>
            </div>

            <div className="px-6 space-y-3 mt-2">
                {attempt.answers.map((ans, i) => {
                    const q = ans.questionId;
                    if (!q) return null;
                    const isSubjective = q.type === 'subjective';
                    const currentMarks = marks[q._id] !== undefined ? marks[q._id] : (ans.marksAwarded ?? 0);
                    const isSaved = saved[q._id];

                    return (
                        <div key={i} className="rounded-2xl overflow-hidden shadow-sm"
                            style={{
                                backgroundColor: '#FFFFFF',
                                border: `1px solid ${ans.isCorrect ? 'rgba(22,163,74,0.2)' : isSubjective ? 'rgba(232,160,32,0.25)' : 'rgba(193,68,14,0.15)'}`,
                            }}>
                            <div className="px-5 py-4">
                                {/* Question header */}
                                <div className="flex items-start gap-2 mb-3">
                                    <span className="text-xs font-bold mt-0.5 flex-shrink-0"
                                        style={{ color: '#2C1810', opacity: 0.4 }}>Q{i + 1}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium" style={{ color: '#2C1810' }}>{q.text}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                style={{
                                                    backgroundColor: isSubjective ? 'rgba(232,160,32,0.12)' : 'rgba(193,68,14,0.08)',
                                                    color: isSubjective ? '#b45309' : '#C1440E'
                                                }}>
                                                {isSubjective ? 'Subjective' : 'MCQ'}
                                            </span>
                                            <span className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>
                                                Max: {q.marks} marks
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* MCQ: show options */}
                                {q.type === 'mcq' && (
                                    <div className="space-y-1.5 mb-3">
                                        {q.options.map((opt, oi) => {
                                            const isSelected = ans.selectedOption === String(oi);
                                            const isCorrectOpt = q.correctAnswer === String(oi);
                                            return (
                                                <div key={oi} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                                    style={{
                                                        backgroundColor: isCorrectOpt ? 'rgba(22,163,74,0.08)' : isSelected ? 'rgba(193,68,14,0.06)' : '#F5F0E8',
                                                        border: `1px solid ${isCorrectOpt ? 'rgba(22,163,74,0.25)' : isSelected && !isCorrectOpt ? 'rgba(193,68,14,0.2)' : 'transparent'}`,
                                                    }}>
                                                    {isCorrectOpt
                                                        ? <CheckCircle size={13} color="#16a34a" />
                                                        : isSelected
                                                        ? <XCircle size={13} color="#C1440E" />
                                                        : <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(44,24,16,0.12)' }} />
                                                    }
                                                    <span className="text-sm" style={{ color: '#2C1810' }}>{opt}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Subjective: show answer + marks input */}
                                {isSubjective && (
                                    <div className="space-y-3">
                                        <div className="rounded-xl p-3"
                                            style={{ backgroundColor: '#F7F4EF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                                            <p className="text-xs font-semibold mb-1" style={{ color: '#2C1810', opacity: 0.5 }}>
                                                Student's Answer:
                                            </p>
                                            <p className="text-sm" style={{ color: '#2C1810' }}>
                                                {ans.textAnswer || <span style={{ opacity: 0.4 }}>No answer written</span>}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 flex-1">
                                                <PenLine size={14} color="#E8A020" />
                                                <label className="text-xs font-semibold" style={{ color: '#2C1810' }}>
                                                    Award Marks (0–{q.marks}):
                                                </label>
                                            </div>
                                            <input
                                                type="number"
                                                min={0}
                                                max={q.marks}
                                                value={currentMarks}
                                                onChange={e => {
                                                    setSaved(prev => ({ ...prev, [q._id]: false }));
                                                    setMarks(prev => ({ ...prev, [q._id]: e.target.value }));
                                                }}
                                                className="w-20 px-3 py-2 rounded-xl text-sm font-bold text-center outline-none"
                                                style={{
                                                    border: '1.5px solid rgba(193,68,14,0.25)',
                                                    backgroundColor: '#FFFFFF',
                                                    color: '#2C1810',
                                                }}
                                            />
                                            <button
                                                onClick={() => saveGrade(ans)}
                                                disabled={saving === q._id}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                                                style={{
                                                    backgroundColor: isSaved ? '#16a34a' : '#C1440E',
                                                    color: '#FFFFFF',
                                                    opacity: saving === q._id ? 0.6 : 1,
                                                }}>
                                                {saving === q._id
                                                    ? '...'
                                                    : isSaved
                                                    ? <><CheckCircle size={12} /> Saved</>
                                                    : <><Save size={12} /> Save</>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* MCQ auto-result badge */}
                                {q.type === 'mcq' && (
                                    <div className="flex items-center gap-1.5 mt-2">
                                        {ans.isCorrect
                                            ? <><CheckCircle size={13} color="#16a34a" /><span className="text-xs font-semibold" style={{ color: '#16a34a' }}>Correct · {ans.marksAwarded} marks</span></>
                                            : ans.selectedOption !== null && ans.selectedOption !== undefined
                                            ? <><XCircle size={13} color="#C1440E" /><span className="text-xs font-semibold" style={{ color: '#C1440E' }}>Wrong · 0 marks</span></>
                                            : <><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#94a3b8' }} /><span className="text-xs" style={{ color: '#94a3b8' }}>Skipped</span></>
                                        }
                                    </div>
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

// ─── Sir View: leaderboard + analytics ────────────────────────────────────
function SirResultsView({ data, testId }) {
    const { attempts: initialAttempts, classAvg: initialAvg, totalMarks, test } = data;
    const [attempts, setAttempts] = useState(initialAttempts);
    const [classAvg, setClassAvg] = useState(initialAvg);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    const refreshAttempts = async () => {
        try {
            const r = await api.get(`/tests/${testId}/results`);
            setAttempts(r.data.attempts);
            setClassAvg(r.data.classAvg);
            // update selected attempt too
            if (selectedAttempt) {
                const updated = r.data.attempts.find(a => a._id === selectedAttempt._id);
                if (updated) setSelectedAttempt(updated);
            }
        } catch (_) {}
    };

    if (selectedAttempt) {
        return (
            <GradingSheet
                attempt={selectedAttempt}
                totalMarks={totalMarks}
                testId={testId}
                onBack={() => setSelectedAttempt(null)}
                onSaved={refreshAttempts}
            />
        );
    }

    const getRankMedal = (i) => {
        if (i === 0) return { color: '#E8A020', label: '1st' };
        if (i === 1) return { color: '#94a3b8', label: '2nd' };
        if (i === 2) return { color: '#b45309', label: '3rd' };
        return null;
    };

    // Build analytics data
    const scoreDistribution = (() => {
        const buckets = [
            { range: '0-25', count: 0 },
            { range: '26-50', count: 0 },
            { range: '51-75', count: 0 },
            { range: '76-100', count: 0 },
        ];
        attempts.forEach(a => {
            const p = a.percentage;
            if (p <= 25) buckets[0].count++;
            else if (p <= 50) buckets[1].count++;
            else if (p <= 75) buckets[2].count++;
            else buckets[3].count++;
        });
        return buckets;
    })();

    // Question-wise accuracy from first attempt's answer set
    const questionAccuracy = (() => {
        if (!attempts.length || !attempts[0].answers) return [];
        const qMap = {};
        attempts.forEach(a => {
            a.answers.forEach((ans, i) => {
                const q = ans.questionId;
                if (!q) return;
                const key = q._id || i;
                if (!qMap[key]) qMap[key] = { label: `Q${i+1}`, correct: 0, total: 0 };
                qMap[key].total++;
                if (ans.isCorrect) qMap[key].correct++;
            });
        });
        return Object.values(qMap).map(q => ({
            label: q.label,
            accuracy: q.total ? Math.round((q.correct / q.total) * 100) : 0,
        }));
    })();

    return (
        <div className="min-h-screen pb-28 page-fade" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader title="Test Results" subtitle={test?.name || ''} backTo="/tests" />

            <div className="px-6 space-y-4">
                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Students', value: attempts.length, icon: <Users size={16} color="#C1440E" /> },
                        { label: 'Class Avg', value: `${classAvg}%`, icon: <TrendingUp size={16} color="#E8A020" /> },
                        { label: 'Total Marks', value: totalMarks, icon: <Award size={16} color="#2C1810" /> },
                    ].map(({ label, value, icon }) => (
                        <div key={label} className="rounded-2xl p-4 text-center shadow-sm"
                            style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                            <div className="flex justify-center mb-1">{icon}</div>
                            <p className="text-xl font-black" style={{ color: '#2C1810', fontFamily: 'Playfair Display, serif' }}>{value}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#2C1810', opacity: 0.5 }}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Analytics toggle */}
                {attempts.length > 0 && (
                    <button onClick={() => setShowAnalytics(p => !p)}
                        className="flex items-center gap-2 w-full px-5 py-3 rounded-2xl shadow-sm transition-all"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <BarChart2 size={16} color="#C1440E" />
                        <span className="text-sm font-semibold" style={{ color: '#2C1810' }}>View Analytics</span>
                        {showAnalytics ? <ChevronUp size={14} color="#2C1810" opacity={0.4} className="ml-auto" />
                            : <ChevronDown size={14} color="#2C1810" opacity={0.4} className="ml-auto" />}
                    </button>
                )}

                {/* Analytics panel */}
                {showAnalytics && attempts.length > 0 && (
                    <div className="rounded-2xl p-5 shadow-sm space-y-5"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>

                        {/* Score Distribution */}
                        <div>
                            <p className="text-sm font-bold mb-3" style={{ color: '#2C1810', fontFamily: 'Playfair Display, serif' }}>
                                Score Distribution
                            </p>
                            <ResponsiveContainer width="100%" height={130}>
                                <BarChart data={scoreDistribution} barCategoryGap="25%">
                                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#2C1810' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#2C1810' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip formatter={(v) => [`${v} students`]} contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {scoreDistribution.map((entry, i) => (
                                            <Cell key={i} fill={i === 0 ? '#C1440E' : i === 1 ? '#E8A020' : i === 2 ? '#4338CA' : '#16a34a'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Question Accuracy */}
                        {questionAccuracy.length > 0 && (
                            <div>
                                <p className="text-sm font-bold mb-3" style={{ color: '#2C1810', fontFamily: 'Playfair Display, serif' }}>
                                    Question-wise Accuracy
                                </p>
                                <div className="space-y-2">
                                    {questionAccuracy.map((q, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-xs font-semibold w-6 flex-shrink-0" style={{ color: '#2C1810', opacity: 0.5 }}>
                                                {q.label}
                                            </span>
                                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(193,68,14,0.08)' }}>
                                                <div className="h-full rounded-full transition-all"
                                                    style={{
                                                        width: `${q.accuracy}%`,
                                                        backgroundColor: q.accuracy >= 70 ? '#16a34a' : q.accuracy >= 40 ? '#E8A020' : '#C1440E',
                                                    }} />
                                            </div>
                                            <span className="text-xs font-bold w-10 text-right flex-shrink-0"
                                                style={{ color: q.accuracy >= 70 ? '#16a34a' : q.accuracy >= 40 ? '#E8A020' : '#C1440E' }}>
                                                {q.accuracy}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <p className="text-xs px-1" style={{ color: '#2C1810', opacity: 0.5 }}>
                    Tap a student to review answers and grade subjective questions.
                </p>

                {attempts.length === 0 ? (
                    <div className="rounded-2xl p-10 text-center shadow-sm"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <Users size={36} color="#C1440E" opacity={0.2} className="mx-auto mb-3" />
                        <p className="text-sm font-medium" style={{ color: '#2C1810' }}>No submissions yet</p>
                    </div>
                ) : (
                    <div className="rounded-2xl overflow-hidden shadow-sm"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(193,68,14,0.08)' }}>
                            <p className="text-sm font-bold" style={{ color: '#2C1810', fontFamily: 'Playfair Display, serif' }}>
                                Leaderboard
                            </p>
                        </div>
                        <div className="divide-y" style={{ borderColor: 'rgba(193,68,14,0.06)' }}>
                            {attempts.map((a, i) => {
                                const medal = getRankMedal(i);
                                const pct = a.percentage;
                                const barColor = pct >= 75 ? '#16a34a' : pct >= 50 ? '#E8A020' : '#C1440E';
                                const needsGrading = a.status !== 'graded' && a.answers?.some(ans => {
                                    const q = ans.questionId;
                                    return q && q.type === 'subjective';
                                });

                                return (
                                    <div key={a._id}
                                        className="px-5 py-3 flex items-center gap-3 cursor-pointer active:opacity-70 transition-opacity"
                                        onClick={() => setSelectedAttempt(a)}>
                                        {/* Rank */}
                                        <div className="w-8 text-center flex-shrink-0">
                                            {medal ? (
                                                <span className="text-sm font-black" style={{ color: medal.color }}>{medal.label}</span>
                                            ) : (
                                                <span className="text-sm font-semibold" style={{ color: '#2C1810', opacity: 0.4 }}>#{i + 1}</span>
                                            )}
                                        </div>

                                        {/* Avatar */}
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: 'rgba(193,68,14,0.1)' }}>
                                            <span className="text-sm font-bold" style={{ color: '#C1440E' }}>
                                                {a.studentId?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </span>
                                        </div>

                                        {/* Name + progress */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <p className="text-sm font-semibold truncate" style={{ color: '#2C1810' }}>
                                                        {a.studentId?.name || 'Unknown'}
                                                    </p>
                                                    {needsGrading && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: 'rgba(232,160,32,0.15)', color: '#b45309' }}>
                                                            Grade
                                                        </span>
                                                    )}
                                                    {a.status === 'graded' && (
                                                        <CheckCircle size={12} color="#16a34a" className="flex-shrink-0" />
                                                    )}
                                                </div>
                                                <span className="text-sm font-bold flex-shrink-0 ml-2" style={{ color: barColor }}>
                                                    {a.score}/{totalMarks}
                                                </span>
                                            </div>
                                            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(193,68,14,0.08)' }}>
                                                <div className="h-full rounded-full"
                                                    style={{ width: `${pct}%`, backgroundColor: barColor }} />
                                            </div>
                                            <div className="flex items-center justify-between mt-0.5">
                                                {a.studentId?.rollNumber && (
                                                    <p className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>Roll #{a.studentId.rollNumber}</p>
                                                )}
                                                <p className="text-xs font-medium ml-auto" style={{ color: barColor }}>{pct}%</p>
                                            </div>
                                        </div>

                                        <ChevronDown size={14} color="#2C1810" opacity={0.3} className="flex-shrink-0" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            <BottomNav />
        </div>
    );
}

// ─── Student View ──────────────────────────────────────────────────────────
function StudentResultView({ data }) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(null);
    const { attempt, test } = data;
    const pct = attempt.percentage;
    const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';
    const gradeColor = pct >= 70 ? '#16a34a' : pct >= 50 ? '#E8A020' : '#C1440E';

    return (
        <div className="min-h-screen pb-10" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader title="Test Result" backTo="/tests" />
            <div className="px-6 space-y-4">
                <div className="rounded-2xl p-6 text-center overflow-hidden relative shadow-sm"
                    style={{ backgroundColor: '#2C1810' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                        style={{ backgroundColor: '#E8A020', transform: 'translate(20%, -20%)' }} />
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: 'rgba(245,240,232,0.1)' }}>
                        <p className="text-4xl font-black" style={{ color: gradeColor, fontFamily: 'Playfair Display, serif' }}>{grade}</p>
                    </div>
                    <p className="text-5xl font-black mb-1" style={{ color: '#F5F0E8', fontFamily: 'Playfair Display, serif' }}>{pct}%</p>
                    <p className="text-lg font-semibold mb-1" style={{ color: '#F5F0E8', opacity: 0.8 }}>{attempt.score} / {test.totalMarks} marks</p>
                    <p className="text-sm" style={{ color: '#F5F0E8', opacity: 0.5 }}>{test.name}</p>
                    <div className="grid grid-cols-3 gap-3 mt-5">
                        {[
                            { label: 'Correct', value: attempt.answers.filter(a => a.isCorrect).length, color: '#4ade80' },
                            { label: 'Wrong', value: attempt.answers.filter(a => !a.isCorrect && a.selectedOption !== null && a.selectedOption !== undefined).length, color: '#f87171' },
                            { label: 'Skipped', value: attempt.answers.filter(a => !a.selectedOption && !a.textAnswer).length, color: '#94a3b8' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="rounded-xl p-3" style={{ backgroundColor: 'rgba(245,240,232,0.08)' }}>
                                <p className="text-xl font-bold" style={{ color }}>{value}</p>
                                <p className="text-xs mt-0.5" style={{ color: '#F5F0E8', opacity: 0.5 }}>{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {attempt.answers.map((ans, i) => {
                    const q = ans.questionId;
                    if (!q) return null;
                    const correct = ans.isCorrect;
                    const skipped = !ans.selectedOption && !ans.textAnswer;
                    return (
                        <div key={i} className="rounded-2xl shadow-sm overflow-hidden"
                            style={{
                                backgroundColor: '#FFFFFF',
                                border: `1px solid ${correct ? 'rgba(22,163,74,0.2)' : skipped ? 'rgba(148,163,184,0.2)' : 'rgba(193,68,14,0.2)'}`,
                            }}>
                            <div className="flex items-start gap-3 px-5 py-4 cursor-pointer"
                                onClick={() => setExpanded(expanded === i ? null : i)}>
                                <div className="mt-0.5 flex-shrink-0">
                                    {correct ? <CheckCircle size={18} color="#16a34a" />
                                        : skipped ? <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: '#94a3b8' }} />
                                        : <XCircle size={18} color="#C1440E" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold" style={{ color: '#2C1810', opacity: 0.4 }}>Q{i + 1}</span>
                                        <span className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>·</span>
                                        <span className="text-xs font-semibold" style={{ color: ans.marksAwarded > 0 ? '#16a34a' : '#C1440E' }}>
                                            {ans.marksAwarded}/{q.marks} marks
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium line-clamp-2" style={{ color: '#2C1810' }}>{q.text}</p>
                                </div>
                                {expanded === i ? <ChevronUp size={14} color="#2C1810" opacity={0.4} /> : <ChevronDown size={14} color="#2C1810" opacity={0.4} />}
                            </div>
                            {expanded === i && (
                                <div className="px-5 pb-4 space-y-3 border-t" style={{ borderColor: 'rgba(193,68,14,0.06)' }}>
                                    {q.type === 'mcq' && (
                                        <div className="space-y-2 pt-3">
                                            {q.options.map((opt, oi) => {
                                                const isSelected = ans.selectedOption === String(oi);
                                                const isCorrectOpt = q.correctAnswer === String(oi);
                                                return (
                                                    <div key={oi} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                                        style={{
                                                            backgroundColor: isCorrectOpt ? 'rgba(22,163,74,0.1)' : isSelected ? 'rgba(193,68,14,0.08)' : '#F5F0E8',
                                                            border: `1px solid ${isCorrectOpt ? 'rgba(22,163,74,0.3)' : isSelected ? 'rgba(193,68,14,0.2)' : 'transparent'}`,
                                                        }}>
                                                        {isCorrectOpt ? <CheckCircle size={13} color="#16a34a" />
                                                            : isSelected ? <XCircle size={13} color="#C1440E" />
                                                            : <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(44,24,16,0.15)' }} />}
                                                        <span className="text-sm" style={{ color: '#2C1810' }}>{opt}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {q.type === 'subjective' && (
                                        <div className="pt-3">
                                            <p className="text-xs font-semibold mb-1" style={{ color: '#2C1810', opacity: 0.5 }}>Your Answer:</p>
                                            <p className="text-sm" style={{ color: '#2C1810' }}>{ans.textAnswer || '—'}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                <button onClick={() => navigate('/tests')}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm"
                    style={{ backgroundColor: '#2C1810', color: '#F5F0E8' }}>
                    Back to Tests
                </button>
            </div>
        </div>
    );
}

// ─── Root export ────────────────────────────────────────────────────────────
export default function TestResult() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/tests/${id}/results`)
            .then(r => setData(r.data))
            .catch(() => navigate('/tests'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <PageLoader />;
    if (!data) return null;

    if (user?.role === 'sir') return <SirResultsView data={data} testId={id} />;
    return <StudentResultView data={data} />;
}
