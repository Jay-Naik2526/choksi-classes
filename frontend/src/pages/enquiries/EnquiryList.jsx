import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Phone, MessageSquare, ChevronDown, ChevronUp,
    CheckCircle, XCircle, Clock, User, BookOpen,
    Trash2, StickyNote, Inbox,
} from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import { PageLoader } from '../../components/ui/Spinner';
import {
    SpotlightCard, GlowCard, StaggerContainer, StaggerItem,
    PageTransition, BorderBeam, NumberTicker,
} from '../../components/ui/MagicUI';
import api from '../../utils/api';

/* ── Helpers ── */
const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const STATUS_META = {
    new:       { label: 'New',       color: '#C1440E', bg: 'rgba(193,68,14,0.1)',  icon: Clock },
    contacted: { label: 'Contacted', color: '#2563eb', bg: 'rgba(37,99,235,0.1)', icon: Phone },
    enrolled:  { label: 'Enrolled',  color: '#16a34a', bg: 'rgba(22,163,74,0.1)', icon: CheckCircle },
    closed:    { label: 'Closed',    color: '#78716c', bg: 'rgba(120,113,108,0.1)',icon: XCircle },
};

const FILTERS = ['all', 'new', 'contacted', 'enrolled', 'closed'];

/* ── Single Enquiry Card ── */
function EnquiryCard({ enquiry, onUpdate, onDelete }) {
    const [expanded, setExpanded]   = useState(false);
    const [note, setNote]           = useState(enquiry.note || '');
    const [saving, setSaving]       = useState(false);
    const [deleting, setDeleting]   = useState(false);

    const meta = STATUS_META[enquiry.status] || STATUS_META.new;
    const StatusIcon = meta.icon;

    const saveStatus = async (newStatus) => {
        setSaving(true);
        try {
            const { data } = await api.patch(`/enquiry/${enquiry._id}`, { status: newStatus });
            onUpdate(data.enquiry);
        } catch {}
        setSaving(false);
    };

    const saveNote = async () => {
        setSaving(true);
        try {
            const { data } = await api.patch(`/enquiry/${enquiry._id}`, { note });
            onUpdate(data.enquiry);
        } catch {}
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!confirm('Delete this enquiry?')) return;
        setDeleting(true);
        try {
            await api.delete(`/enquiry/${enquiry._id}`);
            onDelete(enquiry._id);
        } catch {}
        setDeleting(false);
    };

    return (
        <SpotlightCard
            spotColor={`${meta.color}12`}
            style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                border: `1px solid ${enquiry.status === 'new' ? 'rgba(193,68,14,0.25)' : 'rgba(44,24,16,0.07)'}`,
                boxShadow: enquiry.status === 'new' ? '0 4px 20px rgba(193,68,14,0.08)' : '0 2px 12px rgba(44,24,16,0.04)',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {enquiry.status === 'new' && <BorderBeam colorA="#C1440E" colorB="#E8A020" duration={4} />}

            {/* ── CARD HEADER ── */}
            <div
                style={{ padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                onClick={() => setExpanded(e => !e)}
            >
                {/* avatar */}
                <div style={{
                    width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                    backgroundColor: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 18, color: meta.color }}>
                        {enquiry.parentName[0]?.toUpperCase()}
                    </span>
                </div>

                {/* info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <p style={{ fontWeight: 700, color: '#2C1810', fontSize: 14 }}>{enquiry.parentName}</p>
                        {/* NEW badge */}
                        {enquiry.status === 'new' && (
                            <motion.span
                                animate={{ scale: [1, 1.12, 1] }}
                                transition={{ repeat: Infinity, duration: 1.6 }}
                                style={{ padding: '2px 8px', borderRadius: 50, backgroundColor: '#C1440E', color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                            >
                                NEW
                            </motion.span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                        {enquiry.childName && <span style={{ fontSize: 12, color: 'rgba(44,24,16,0.55)' }}>{enquiry.childName}</span>}
                        {enquiry.childName && enquiry.className && <span style={{ color: 'rgba(44,24,16,0.2)', fontSize: 10 }}>·</span>}
                        {enquiry.className && <span style={{ fontSize: 12, color: '#C1440E', fontWeight: 600 }}>{enquiry.className}</span>}
                        {enquiry.board && <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}>{enquiry.board}</span>}
                    </div>
                </div>

                {/* right: status chip + time + chevron */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 50, backgroundColor: meta.bg }}>
                        <StatusIcon size={10} color={meta.color} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: meta.color }}>{meta.label}</span>
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(44,24,16,0.35)' }}>{timeAgo(enquiry.createdAt)}</span>
                </div>

                {expanded ? <ChevronUp size={16} color="rgba(44,24,16,0.3)" /> : <ChevronDown size={16} color="rgba(44,24,16,0.3)" />}
            </div>

            {/* ── EXPANDED DETAILS ── */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(44,24,16,0.06)', paddingTop: 16 }}>

                            {/* phone + call */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Phone size={14} color="#C1440E" />
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#C1440E' }}>{enquiry.phone}</span>
                                </div>
                                <motion.a
                                    whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                                    href={`tel:${enquiry.phone}`}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, backgroundColor: '#C1440E', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
                                >
                                    <Phone size={12} /> Call Now
                                </motion.a>
                            </div>

                            {/* message */}
                            {enquiry.message && (
                                <div style={{ padding: '10px 12px', borderRadius: 12, backgroundColor: '#F7F4EF', border: '1px solid rgba(44,24,16,0.07)', marginBottom: 14 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                        <MessageSquare size={12} color="rgba(44,24,16,0.4)" />
                                        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(44,24,16,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Message</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: 'rgba(44,24,16,0.7)', lineHeight: 1.6 }}>{enquiry.message}</p>
                                </div>
                            )}

                            {/* status buttons */}
                            <div style={{ marginBottom: 14 }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(44,24,16,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Update Status</p>
                                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                                    {Object.entries(STATUS_META).map(([key, m]) => (
                                        <motion.button
                                            key={key}
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => saveStatus(key)}
                                            disabled={saving || enquiry.status === key}
                                            style={{
                                                padding: '6px 12px', borderRadius: 50, fontSize: 11, fontWeight: 700, cursor: enquiry.status === key ? 'default' : 'pointer', border: 'none',
                                                backgroundColor: enquiry.status === key ? m.color : m.bg,
                                                color: enquiry.status === key ? '#fff' : m.color,
                                                opacity: saving ? 0.6 : 1,
                                            }}
                                        >
                                            {m.label}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* note */}
                            <div style={{ marginBottom: 14 }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(44,24,16,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                                    <StickyNote size={10} style={{ display: 'inline', marginRight: 4 }} />Internal Note
                                </p>
                                <textarea
                                    rows={2}
                                    placeholder="Add a private note (e.g. 'Called, will visit Saturday')"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid rgba(44,24,16,0.12)', backgroundColor: '#F7F4EF', fontSize: 13, color: '#2C1810', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                                    onFocus={e => e.target.style.borderColor = '#C1440E'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(44,24,16,0.12)'}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                        onClick={saveNote}
                                        disabled={saving}
                                        style={{ padding: '7px 16px', borderRadius: 10, backgroundColor: '#2C1810', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
                                    >
                                        {saving ? 'Saving…' : 'Save Note'}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', borderRadius: 10, backgroundColor: 'rgba(193,68,14,0.08)', color: '#C1440E', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', opacity: deleting ? 0.6 : 1 }}
                                    >
                                        <Trash2 size={12} /> Delete
                                    </motion.button>
                                </div>
                            </div>

                            {/* meta footer */}
                            <p style={{ fontSize: 10, color: 'rgba(44,24,16,0.3)', textAlign: 'right' }}>
                                Submitted {new Date(enquiry.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </SpotlightCard>
    );
}

/* ── MAIN PAGE ── */
export default function EnquiryList() {
    const [enquiries, setEnquiries] = useState([]);
    const [newCount, setNewCount]   = useState(0);
    const [filter, setFilter]       = useState('all');
    const [loading, setLoading]     = useState(true);

    const load = async (status = 'all') => {
        setLoading(true);
        try {
            const { data } = await api.get(`/enquiry${status !== 'all' ? `?status=${status}` : ''}`);
            setEnquiries(data.enquiries);
            setNewCount(data.newCount);
        } catch {}
        setLoading(false);
    };

    useEffect(() => { load(filter); }, [filter]);

    const handleUpdate = (updated) => setEnquiries(prev => prev.map(e => e._id === updated._id ? updated : e));
    const handleDelete = (id)      => setEnquiries(prev => prev.filter(e => e._id !== id));

    const counts = enquiries.reduce((acc, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc; }, {});

    if (loading) return <PageLoader />;

    return (
        <PageTransition>
            <div style={{ minHeight: '100vh', backgroundColor: '#F7F4EF', paddingBottom: 100, fontFamily: 'Inter, sans-serif' }}>

                {/* ── HEADER ── */}
                <div style={{ backgroundColor: '#2C1810', padding: '28px 20px 20px', position: 'relative', overflow: 'hidden' }}>
                    {/* decorative glow */}
                    <div style={{ position: 'absolute', top: '-40%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(193,68,14,0.25) 0%, transparent 65%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(245,240,232,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Choksi Classes</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Inbox size={22} color="#E8A020" />
                            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#F5F0E8' }}>Admissions Inbox</h1>
                            {newCount > 0 && (
                                <motion.span
                                    animate={{ scale: [1, 1.15, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    style={{ padding: '3px 10px', borderRadius: 50, backgroundColor: '#C1440E', color: '#fff', fontSize: 11, fontWeight: 700 }}
                                >
                                    {newCount} new
                                </motion.span>
                            )}
                        </div>
                        <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.45)', marginTop: 6 }}>
                            {enquiries.length === 0 ? 'No enquiries yet' : `${enquiries.length} total enquir${enquiries.length === 1 ? 'y' : 'ies'}`}
                        </p>
                    </div>
                </div>

                {/* ── SUMMARY PILLS ── */}
                <div style={{ padding: '16px 20px 4px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {FILTERS.map(f => {
                        const isActive = filter === f;
                        const count = f === 'all' ? enquiries.length : (counts[f] || 0);
                        const meta   = f === 'all' ? { color: '#2C1810', bg: 'rgba(44,24,16,0.08)' } : STATUS_META[f];
                        return (
                            <motion.button
                                key={f}
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => setFilter(f)}
                                style={{
                                    flexShrink: 0, padding: '7px 14px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
                                    backgroundColor: isActive ? meta.color : meta.bg,
                                    color: isActive ? '#fff' : meta.color,
                                    transition: 'background-color 0.2s',
                                }}
                            >
                                {f} {count > 0 && `(${count})`}
                            </motion.button>
                        );
                    })}
                </div>

                {/* ── LIST ── */}
                <div style={{ padding: '12px 20px' }}>
                    {enquiries.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            style={{ textAlign: 'center', padding: '60px 24px' }}
                        >
                            <Inbox size={48} color="rgba(44,24,16,0.12)" style={{ margin: '0 auto 16px', display: 'block' }} />
                            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'rgba(44,24,16,0.3)', marginBottom: 8 }}>
                                No enquiries yet
                            </p>
                            <p style={{ fontSize: 13, color: 'rgba(44,24,16,0.3)' }}>
                                {filter === 'all' ? 'When parents fill the admissions form, they\'ll appear here.' : `No ${filter} enquiries.`}
                            </p>
                        </motion.div>
                    ) : (
                        <StaggerContainer style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {enquiries.map((e) => (
                                <StaggerItem key={e._id}>
                                    <EnquiryCard
                                        enquiry={e}
                                        onUpdate={handleUpdate}
                                        onDelete={handleDelete}
                                    />
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    )}
                </div>

                <BottomNav />
            </div>
        </PageTransition>
    );
}
