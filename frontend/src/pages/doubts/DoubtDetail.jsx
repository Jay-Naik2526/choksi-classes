import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Clock, Upload, X, Send, Wifi } from 'lucide-react';
import { io } from 'socket.io-client';
import PageHeader from '../../components/layout/PageHeader';
import Spinner from '../../components/ui/Spinner';
import { PageLoader } from '../../components/ui/Spinner';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function DoubtDetail() {
    const { id } = useParams();
    const { user } = useAuthStore();
    const [doubt, setDoubt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answer, setAnswer] = useState('');
    const [answerImage, setAnswerImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [msgText, setMsgText] = useState('');
    const [sendingMsg, setSendingMsg] = useState(false);
    const [connected, setConnected] = useState(false);
    const bottomRef = useRef(null);
    const socketRef = useRef(null);

    const loadDoubt = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const r = await api.get(`/doubts/${id}`);
            setDoubt(r.data.doubt);
        } catch {}
        finally { if (!silent) setLoading(false); }
    }, [id]);

    // Initial load
    useEffect(() => { loadDoubt(); }, [loadDoubt]);

    // Socket.IO — real-time follow-up messages
    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            socket.emit('join_doubt', id);
        });

        socket.on('disconnect', () => setConnected(false));

        socket.on('new_message', ({ messages }) => {
            setDoubt(prev => prev ? { ...prev, messages } : prev);
        });

        return () => {
            socket.emit('leave_doubt', id);
            socket.disconnect();
        };
    }, [id]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (doubt?.messages?.length) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [doubt?.messages?.length]);

    const handleAnswer = async (e) => {
        e.preventDefault();
        if (!answer.trim()) return setError('Answer cannot be empty');
        setSubmitting(true); setError('');
        try {
            const fd = new FormData();
            fd.append('answer', answer);
            if (answerImage) fd.append('image', answerImage);
            const res = await api.put(`/doubts/${id}/answer`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setDoubt(res.data.doubt);
            setAnswer(''); setAnswerImage(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit');
        } finally { setSubmitting(false); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!msgText.trim()) return;
        setSendingMsg(true);
        const text = msgText.trim();
        setMsgText('');
        try {
            await api.post(`/doubts/${id}/messages`, { text });
            // Socket.IO will broadcast the update — no need to manually set state
        } catch {
            setMsgText(text);
        } finally { setSendingMsg(false); }
    };

    if (loading) return <PageLoader />;
    if (!doubt) return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F4EF' }}>
            <p style={{ color: '#2C1810' }}>Doubt not found</p>
        </div>
    );

    const isSir = user?.role === 'sir';
    const isAnswered = doubt.status === 'answered';
    const messages = doubt.messages || [];

    return (
        <div className="min-h-screen flex flex-col page-fade" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader
                title="Doubt Thread"
                backTo="/doubts"
                action={
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                        style={{ backgroundColor: connected ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)' }}>
                        <Wifi size={12} color={connected ? '#16a34a' : '#dc2626'} />
                        <span className="text-xs font-medium" style={{ color: connected ? '#16a34a' : '#dc2626' }}>
                            {connected ? 'Live' : 'Offline'}
                        </span>
                    </div>
                }
            />

            <div className="flex-1 px-4 pb-48 space-y-4 overflow-y-auto page-fade">

                {/* ── Question Card ─────────────────────────────────── */}
                <div className="rounded-2xl p-5 shadow-sm"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                            style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                            {doubt.studentId?.name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold" style={{ color: '#2C1810' }}>
                                {doubt.studentId?.name || 'Student'}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                <span className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: 'rgba(193,68,14,0.1)', color: '#C1440E' }}>
                                    {doubt.subject}
                                </span>
                                {doubt.chapter && (
                                    <span className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>{doubt.chapter}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            {isAnswered
                                ? <div className="flex items-center gap-1 px-2 py-1 rounded-full"
                                    style={{ backgroundColor: 'rgba(22,163,74,0.1)' }}>
                                    <CheckCircle size={11} color="#16a34a" />
                                    <span className="text-xs font-medium" style={{ color: '#16a34a' }}>Answered</span>
                                </div>
                                : <div className="flex items-center gap-1 px-2 py-1 rounded-full"
                                    style={{ backgroundColor: 'rgba(232,160,32,0.1)' }}>
                                    <Clock size={11} color="#E8A020" />
                                    <span className="text-xs font-medium" style={{ color: '#E8A020' }}>Pending</span>
                                </div>
                            }
                        </div>
                    </div>
                    <h3 className="text-base font-semibold leading-relaxed mb-3"
                        style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                        {doubt.question}
                    </h3>
                    {doubt.questionImageUrl && (
                        <img src={doubt.questionImageUrl} alt="question"
                            className="w-full rounded-xl object-cover max-h-64 mt-2" />
                    )}
                </div>

                {/* ── Answer Block ──────────────────────────────────── */}
                {isAnswered && (
                    <div className="rounded-2xl p-5 shadow-sm"
                        style={{ backgroundColor: '#FFFFFF', border: '2px solid rgba(22,163,74,0.18)' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: '#16a34a', color: '#fff' }}>
                                {doubt.answeredBy?.name?.[0]?.toUpperCase() || 'S'}
                            </div>
                            <div>
                                <p className="text-sm font-semibold" style={{ color: '#16a34a' }}>
                                    {doubt.answeredBy?.name || 'Sir'}
                                </p>
                                {doubt.answeredAt && (
                                    <p className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>
                                        {timeAgo(doubt.answeredAt)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: '#2C1810' }}>{doubt.answer}</p>
                        {doubt.answerImageUrl && (
                            <img src={doubt.answerImageUrl} alt="answer"
                                className="w-full rounded-xl object-cover max-h-64 mt-3" />
                        )}
                    </div>
                )}

                {/* ── Write Answer (Sir only, unanswered) ───────────── */}
                {!isAnswered && isSir && (
                    <div className="rounded-2xl p-5 shadow-sm"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <h3 className="text-sm font-bold mb-4"
                            style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                            Write Answer
                        </h3>
                        <form onSubmit={handleAnswer} className="space-y-4">
                            <textarea value={answer} onChange={e => setAnswer(e.target.value)}
                                rows={4} placeholder="Type your answer here…"
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                                style={{ backgroundColor: '#F7F4EF', border: '1.5px solid transparent', color: '#2C1810' }}
                                onFocus={e => e.target.style.borderColor = '#C1440E'}
                                onBlur={e => e.target.style.borderColor = 'transparent'} />
                            {answerImage ? (
                                <div className="flex items-center gap-3 p-3 rounded-xl"
                                    style={{ backgroundColor: '#F7F4EF', border: '1.5px dashed rgba(193,68,14,0.3)' }}>
                                    <img src={URL.createObjectURL(answerImage)} alt="preview"
                                        className="w-10 h-10 object-cover rounded-lg" />
                                    <p className="flex-1 text-xs truncate" style={{ color: '#2C1810' }}>{answerImage.name}</p>
                                    <button type="button" onClick={() => setAnswerImage(null)}>
                                        <X size={14} color="#C1440E" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex items-center gap-2 text-xs cursor-pointer w-fit"
                                    style={{ color: '#C1440E' }}>
                                    <Upload size={13} /> Attach image
                                    <input type="file" accept="image/*" className="hidden"
                                        onChange={e => setAnswerImage(e.target.files[0])} />
                                </label>
                            )}
                            {error && <p className="text-xs py-2 text-center rounded-lg"
                                style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>{error}</p>}
                            <button type="submit" disabled={submitting}
                                className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                                style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                                {submitting ? <><Spinner size="sm" color="#F5F0E8" /> Submitting…</> : 'Submit Answer →'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Pending state for student ─────────────────────── */}
                {!isAnswered && !isSir && (
                    <div className="rounded-2xl p-6 text-center"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <Clock size={28} color="#E8A020" className="mx-auto mb-2" />
                        <p className="text-sm" style={{ color: '#2C1810', opacity: 0.6 }}>
                            Your doubt is with Sir. You'll be notified when answered.
                        </p>
                    </div>
                )}

                {/* ── Follow-up Thread ──────────────────────────────── */}
                {isAnswered && (
                    <div className="space-y-1">
                        {/* Section label */}
                        <div className="flex items-center gap-3 px-1 py-2">
                            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(193,68,14,0.1)' }} />
                            <p className="text-xs font-semibold uppercase tracking-widest flex-shrink-0"
                                style={{ color: '#2C1810', opacity: 0.35 }}>
                                Follow-up
                            </p>
                            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(193,68,14,0.1)' }} />
                        </div>

                        {messages.length === 0 ? (
                            <p className="text-xs text-center py-4" style={{ color: '#2C1810', opacity: 0.35 }}>
                                No follow-up messages yet. Start the conversation below.
                            </p>
                        ) : (
                            messages.map((msg, i) => {
                                // Use senderRole for reliable alignment:
                                //   • senderRole matches current user's role → RIGHT (my bubble)
                                //   • Opposite role → LEFT (their bubble)
                                // This is correct because each doubt is exactly 1 student ↔ 1 sir.
                                const isMe = msg.senderRole === user?.role;
                                const isSirMsg = msg.senderRole === 'sir';

                                return (
                                    <div key={msg._id || i}
                                        className={`flex gap-2 py-1 ${isMe ? 'justify-end' : 'justify-start'}`}>

                                        {/* Avatar (opposite side only) */}
                                        {!isMe && (
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1"
                                                style={{
                                                    backgroundColor: isSirMsg ? '#2C1810' : '#C1440E',
                                                    color: '#F5F0E8',
                                                }}>
                                                {msg.senderName?.[0]?.toUpperCase() || '?'}
                                            </div>
                                        )}

                                        <div className="max-w-[72%] flex flex-col">
                                            {/* Sender name (opposite only) */}
                                            {!isMe && (
                                                <p className="text-xs ml-1 mb-1 font-medium"
                                                    style={{ color: isSirMsg ? '#2C1810' : '#C1440E' }}>
                                                    {msg.senderName}
                                                </p>
                                            )}

                                            {/* Bubble */}
                                            <div className="px-4 py-2.5"
                                                style={{
                                                    backgroundColor: isMe ? '#C1440E' : '#FFFFFF',
                                                    color: isMe ? '#F5F0E8' : '#2C1810',
                                                    border: isMe ? 'none' : '1px solid rgba(193,68,14,0.1)',
                                                    borderRadius: isMe
                                                        ? '18px 4px 18px 18px'
                                                        : '4px 18px 18px 18px',
                                                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                                }}>
                                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                            </div>

                                            {/* Timestamp */}
                                            <p className="text-xs mt-0.5 px-1"
                                                style={{
                                                    color: '#2C1810',
                                                    opacity: 0.35,
                                                    textAlign: isMe ? 'right' : 'left',
                                                }}>
                                                {timeAgo(msg.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* ── Message input bar (answered doubts only) ─────────── */}
            {isAnswered && (
                <div className="fixed left-0 right-0"
                    style={{
                        bottom: 'calc(57px + env(safe-area-inset-bottom))',
                        backgroundColor: '#FFFFFF',
                        borderTop: '1px solid rgba(193,68,14,0.1)',
                        padding: '10px 16px',
                    }}>
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                        <input
                            value={msgText}
                            onChange={e => setMsgText(e.target.value)}
                            placeholder={isSir ? 'Reply to student…' : 'Follow-up message…'}
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                            style={{
                                backgroundColor: '#F7F4EF',
                                border: '1.5px solid transparent',
                                color: '#2C1810',
                            }}
                            onFocus={e => e.target.style.borderColor = '#C1440E'}
                            onBlur={e => e.target.style.borderColor = 'transparent'}
                        />
                        <button
                            type="submit"
                            disabled={sendingMsg || !msgText.trim()}
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                                backgroundColor: msgText.trim() ? '#C1440E' : 'rgba(193,68,14,0.15)',
                            }}>
                            {sendingMsg
                                ? <Spinner size="sm" color="#F5F0E8" />
                                : <Send size={16} color={msgText.trim() ? '#F5F0E8' : '#C1440E'} />
                            }
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
