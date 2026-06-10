import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Phone, MapPin, Clock, Sparkles } from 'lucide-react';
import api from '../utils/api';
import {
    SpotlightCard, ShimmerButton, MagneticButton,
    BorderBeam, GradientText, AuroraBackground, DotGrid,
    StaggerContainer, StaggerItem, PageTransition, FadeUp,
} from '../components/ui/MagicUI';

const CLASSES = ['Std 1','Std 2','Std 3','Std 4','Std 5','Std 6','Std 7','Std 8','Std 9','Std 10','Std 11 Commerce','Std 12 Commerce'];
const BOARDS  = ['CBSE','GSEB'];

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap');
`;

const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: '1.5px solid rgba(44,24,16,0.12)', backgroundColor: '#F7F4EF',
    fontSize: 14, color: '#2C1810', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s',
};

export default function Admissions() {
    const navigate = useNavigate();
    const [form, setForm]     = useState({ parentName: '', childName: '', className: '', board: '', phone: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError]   = useState('');
    const [focusedField, setFocusedField] = useState(null);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await api.post('/enquiry', form);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send. Please call us directly.');
        } finally { setLoading(false); }
    };

    return (
        <PageTransition>
            <style>{STYLES}</style>
            <div style={{ minHeight: '100vh', backgroundColor: '#F7F4EF', fontFamily: 'Inter, sans-serif' }}>

                {/* ── HEADER ── */}
                <div style={{ backgroundColor: '#0D0603', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, position: 'relative', overflow: 'hidden' }}>
                    <AuroraBackground colors={['#C1440E','#E8A020','#1a0a05']} opacity={0.15} />
                    <DotGrid color="rgba(193,68,14,0.06)" size={28} />
                    <motion.button
                        whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(245,240,232,0.6)', fontSize: 13, position: 'relative', zIndex: 1 }}
                    >
                        <ArrowLeft size={16} /> Back
                    </motion.button>
                    <div style={{ flex: 1 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: 'rgba(193,68,14,0.28)', border: '1px solid rgba(193,68,14,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontWeight: 700, fontSize: 16 }}>C</span>
                        </div>
                        <span style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontWeight: 700, fontSize: 16 }}>Choksi Classes</span>
                    </div>
                </div>

                <div style={{ maxWidth: 1020, margin: '0 auto', padding: '48px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 48, alignItems: 'start' }}>

                    {/* ── LEFT INFO ── */}
                    <FadeUp>
                        <p style={{ color: '#C1440E', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Admissions Open</p>
                        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#2C1810', lineHeight: 1.1, marginBottom: 20 }}>
                            Join the Best<br/>
                            <GradientText colors={['#C1440E','#E8A020','#C1440E']}>Class in Town</GradientText>
                        </h1>
                        <p style={{ color: 'rgba(44,24,16,0.65)', fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
                            Fill out this form and our team will contact you within 24 hours. Admissions are open for all standards.
                        </p>

                        <StaggerContainer style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                            {[
                                { icon: Phone,  title: 'Dip Choksi',        sub: '+91 82382 16622',                                         href: 'tel:+918238216622' },
                                { icon: Phone,  title: 'CA Kairavi Choksi', sub: '+91 97260 19001',                                         href: 'tel:+919726019001' },
                                { icon: MapPin, title: 'Location',          sub: '304/5/6/7, Union Heights, Ashanagar, Navsari' },
                                { icon: Clock,  title: 'Helpline',          sub: '24 hours · 7 days a week' },
                            ].map((c, i) => (
                                <StaggerItem key={i}>
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        style={{ display: 'flex', gap: 14, alignItems: 'flex-start', cursor: c.href ? 'pointer' : 'default' }}
                                        onClick={() => c.href && (window.location.href = c.href)}
                                    >
                                        <div style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(193,68,14,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <c.icon size={16} color="#C1440E" />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, color: '#2C1810', fontSize: 14, marginBottom: 2 }}>{c.title}</p>
                                            <p style={{ color: 'rgba(44,24,16,0.6)', fontSize: 13 }}>{c.sub}</p>
                                        </div>
                                    </motion.div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>

                        {/* Courses card */}
                        <SpotlightCard
                            spotColor="rgba(193,68,14,0.1)"
                            style={{ padding: 22, borderRadius: 18, backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 4px 20px rgba(44,24,16,0.05)' }}
                        >
                            <p style={{ fontWeight: 700, color: '#2C1810', marginBottom: 14, fontSize: 14 }}>Courses Offered</p>
                            {[
                                { label: 'CBSE Board',      sub: 'Std 1 – 10',             color: '#C1440E' },
                                { label: 'GSEB Board',      sub: 'Std 1 – 12',             color: '#E8A020' },
                                { label: 'Commerce Stream', sub: 'Std 11 – 12 · CBSE & GSEB', color: '#2563eb' },
                            ].map((c, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.08 }}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < 2 ? '1px solid rgba(44,24,16,0.06)' : 'none' }}
                                >
                                    <span style={{ fontWeight: 500, color: '#2C1810', fontSize: 13 }}>{c.label}</span>
                                    <span style={{ color: c.color, fontSize: 12, fontWeight: 700 }}>{c.sub}</span>
                                </motion.div>
                            ))}
                        </SpotlightCard>
                    </FadeUp>

                    {/* ── FORM ── */}
                    <FadeUp delay={0.1}>
                        <SpotlightCard
                            spotColor="rgba(193,68,14,0.07)"
                            style={{ position: 'relative', backgroundColor: '#FFFFFF', borderRadius: 26, overflow: 'hidden', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 12px 50px rgba(44,24,16,0.1)' }}
                        >
                            <BorderBeam colorA="#C1440E" colorB="#E8A020" duration={5} />
                            <div style={{ padding: 36 }}>
                                <AnimatePresence mode="wait">
                                    {success ? (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            style={{ textAlign: 'center', padding: '40px 0' }}
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                                                style={{ width: 76, height: 76, borderRadius: '50%', backgroundColor: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
                                            >
                                                <CheckCircle size={38} color="#16a34a" />
                                            </motion.div>
                                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#2C1810', marginBottom: 12 }}>Enquiry Sent!</h2>
                                            <p style={{ color: 'rgba(44,24,16,0.6)', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                                                We've received your enquiry and will contact you within 24 hours. You can also call us directly.
                                            </p>
                                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                                                <ShimmerButton
                                                    onClick={() => window.location.href = 'tel:+918238216622'}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14, backgroundColor: '#C1440E', color: '#fff', fontSize: 14, fontWeight: 700 }}
                                                >
                                                    <Phone size={15} /> Call Now
                                                </ShimmerButton>
                                                <MagneticButton
                                                    onClick={() => navigate('/')}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14, backgroundColor: 'transparent', color: '#C1440E', fontSize: 14, fontWeight: 700, border: '1.5px solid rgba(193,68,14,0.3)' }}
                                                >
                                                    Back Home
                                                </MagneticButton>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.form
                                            key="form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onSubmit={handleSubmit}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                <Sparkles size={16} color="#E8A020" />
                                                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#2C1810', fontSize: 22 }}>Admission Enquiry</h2>
                                            </div>
                                            <p style={{ color: 'rgba(44,24,16,0.5)', fontSize: 13, marginBottom: 28 }}>We'll get back to you within 24 hours.</p>

                                            {[
                                                { key: 'parentName', label: "Parent's Name *",  placeholder: 'Your full name',    type: 'text' },
                                                { key: 'childName',  label: "Child's Name",      placeholder: "Child's full name", type: 'text' },
                                                { key: 'phone',      label: 'Phone Number *',    placeholder: '+91 98765 43210',   type: 'tel' },
                                            ].map(f => (
                                                <div key={f.key} style={{ marginBottom: 16 }}>
                                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(44,24,16,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{f.label}</label>
                                                    <input
                                                        type={f.type}
                                                        placeholder={f.placeholder}
                                                        value={form[f.key]}
                                                        onChange={e => set(f.key, e.target.value)}
                                                        style={{ ...inputStyle, borderColor: focusedField === f.key ? '#C1440E' : 'rgba(44,24,16,0.12)' }}
                                                        onFocus={() => setFocusedField(f.key)}
                                                        onBlur={() => setFocusedField(null)}
                                                    />
                                                </div>
                                            ))}

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                                {[
                                                    { key: 'className', label: 'Class', options: CLASSES, placeholder: 'Select class' },
                                                    { key: 'board',     label: 'Board', options: BOARDS,  placeholder: 'Select board' },
                                                ].map(f => (
                                                    <div key={f.key}>
                                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(44,24,16,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{f.label}</label>
                                                        <select
                                                            value={form[f.key]}
                                                            onChange={e => set(f.key, e.target.value)}
                                                            style={{ ...inputStyle, borderColor: focusedField === f.key ? '#C1440E' : 'rgba(44,24,16,0.12)' }}
                                                            onFocus={() => setFocusedField(f.key)}
                                                            onBlur={() => setFocusedField(null)}
                                                        >
                                                            <option value="">{f.placeholder}</option>
                                                            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ marginBottom: 22 }}>
                                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(44,24,16,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Message (optional)</label>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Any specific questions or requirements..."
                                                    value={form.message}
                                                    onChange={e => set('message', e.target.value)}
                                                    style={{ ...inputStyle, resize: 'vertical', borderColor: focusedField === 'message' ? '#C1440E' : 'rgba(44,24,16,0.12)' }}
                                                    onFocus={() => setFocusedField('message')}
                                                    onBlur={() => setFocusedField(null)}
                                                />
                                            </div>

                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                                    style={{ padding: '10px 14px', borderRadius: 10, backgroundColor: 'rgba(193,68,14,0.07)', color: '#C1440E', fontSize: 13, marginBottom: 16, border: '1px solid rgba(193,68,14,0.2)' }}
                                                >
                                                    {error}
                                                </motion.div>
                                            )}

                                            <ShimmerButton
                                                onClick={null}
                                                disabled={loading}
                                                style={{ width: '100%', padding: '14px', borderRadius: 14, backgroundColor: '#C1440E', color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(193,68,14,0.35)', opacity: loading ? 0.8 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                                            >
                                                {loading ? (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                        style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                                                    />
                                                ) : (
                                                    <><span>Send Enquiry</span><ArrowRight size={16} /></>
                                                )}
                                            </ShimmerButton>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>
                        </SpotlightCard>
                    </FadeUp>
                </div>
            </div>
        </PageTransition>
    );
}
