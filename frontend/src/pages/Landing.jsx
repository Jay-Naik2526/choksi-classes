import { useState, useRef, useEffect } from 'react';

/* responsive hook */
function useBreakpoint() {
    const [w, setW] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1200);
    useEffect(() => {
        const fn = () => setW(window.innerWidth);
        window.addEventListener('resize', fn);
        return () => window.removeEventListener('resize', fn);
    }, []);
    return { isMobile: w < 640, isTablet: w < 1024, w };
}
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
    Star, MapPin, Phone, ArrowRight, BookOpen,
    Award, ChevronDown, Sparkles, GraduationCap,
    TrendingUp, Quote, ExternalLink, Check, X,
    Bell, ClipboardList, Inbox, Users, Smartphone,
    MessageSquare, IndianRupee, FileText, Zap,
} from 'lucide-react';
import {
    SpotlightCard, BorderBeam, ShimmerButton, MagneticButton,
    NumberTicker, WordRotate, TiltCard, GlowCard,
    StaggerContainer, StaggerItem, FadeUp,
    AuroraBackground, DotGrid, GradientText, PageTransition,
    Meteors, RetroGrid, LetterReveal, FlipCard, RippleButton,
    AnimatedBadge, ScrollText, BeamLine,
} from '../components/ui/MagicUI';

/* ────────────────────────────────────────────────
   GLOBAL STYLES
──────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700;800&display=swap');

@keyframes floatA { 0%,100%{ transform:translateY(0px) rotate(0deg); } 33%{ transform:translateY(-22px) rotate(4deg); } 66%{ transform:translateY(-10px) rotate(-3deg); } }
@keyframes floatB { 0%,100%{ transform:translateY(0px); } 50%{ transform:translateY(-30px) rotate(-5deg); } }
@keyframes floatC { 0%,100%{ transform:translateY(0px); } 40%{ transform:translateY(-15px); } }
@keyframes spinSlow  { from{ transform:rotate(0deg); } to{ transform:rotate(360deg); } }
@keyframes spinSlowR { from{ transform:rotate(0deg); } to{ transform:rotate(-360deg); } }
@keyframes marqueeL { 0%{ transform:translateX(0); } 100%{ transform:translateX(-50%); } }
@keyframes marqueeR { 0%{ transform:translateX(-50%); } 100%{ transform:translateX(0); } }
@keyframes bounceDown { 0%,100%{ transform:translateY(0); opacity:1; } 50%{ transform:translateY(8px); opacity:.5; } }
@keyframes livePulse { 0%,100%{ box-shadow:0 0 0 0 rgba(37,211,102,0.5); } 50%{ box-shadow:0 0 0 8px rgba(37,211,102,0); } }
@keyframes checkPop { 0%{ transform:scale(0) rotate(-20deg); } 70%{ transform:scale(1.2) rotate(4deg); } 100%{ transform:scale(1) rotate(0deg); } }

.animate-float-a { animation:floatA 7s ease-in-out infinite; }
.animate-float-b { animation:floatB 9s ease-in-out infinite; }
.animate-float-c { animation:floatC 5s ease-in-out infinite; }
.animate-spin-slow { animation:spinSlow 18s linear infinite; }
.animate-spin-slow-r { animation:spinSlowR 24s linear infinite; }
.animate-bounce-down { animation:bounceDown 1.8s ease-in-out infinite; }
.marquee-l { animation:marqueeL 22s linear infinite; }
.marquee-r { animation:marqueeR 28s linear infinite; }

.glass { background:rgba(255,255,255,0.04); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.08); }
.glass-light { background:rgba(255,255,255,0.7); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.5); }

/* ── Responsive helpers ── */
@media (max-width: 639px) {
  .hide-mobile { display: none !important; }
  .stat-grid   { grid-template-columns: repeat(2,1fr) !important; }
  .bento-grid  { grid-template-columns: 1fr !important; }
  .bento-large { grid-column: 1 !important; }
  .cmp-grid    { grid-template-columns: 1fr 36px 36px !important; gap: 8px !important; }
  .how-row     { flex-direction: column !important; align-items: stretch !important; }
  .about-grid  { grid-template-columns: 1fr !important; }
  .footer-row  { flex-direction: column !important; align-items: flex-start !important; }
  .hero-nav    { padding: 16px !important; }
  .hero-content{ padding: 24px 16px 100px !important; }
  .section-pad { padding-left: 16px !important; padding-right: 16px !important; }
  .cta-row     { flex-direction: column !important; align-items: stretch !important; }
  .cta-row > * { width: 100% !important; justify-content: center !important; }
}
@media (min-width: 640px) and (max-width: 1023px) {
  .bento-grid  { grid-template-columns: repeat(2,1fr) !important; }
  .bento-large { grid-column: 1 / 3 !important; }
  .stat-grid   { grid-template-columns: repeat(2,1fr) !important; }
}
`;

/* ────────────────────────────────────────────────
   DATA
──────────────────────────────────────────────── */
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
    id: i, size: 2 + (i % 4),
    x: (i * 37 + 11) % 100, y: (i * 53 + 7) % 100,
    anim: ['animate-float-a', 'animate-float-b', 'animate-float-c'][i % 3],
    delay: `${(i * 0.4) % 5}s`,
    color: i % 3 === 0 ? 'rgba(193,68,14,0.5)' : i % 3 === 1 ? 'rgba(232,160,32,0.4)' : 'rgba(245,240,232,0.2)',
}));

const TICKER = ['CBSE','GSEB','Commerce','Std 1–10','Navsari','20+ Years','Daily Tests','Expert Faculty'];
const TICKER_LONG = [...TICKER, ...TICKER, ...TICKER, ...TICKER];

const REVIEWS = [
    { name:'Vardhaman Patel', initial:'V', text:'Had a great experience while studying there till 10th Grade. The teachers are amazing and always ready to help.',  stars:5, role:'Class 10 Student' },
    { name:'Isha Panchal',    initial:'I', text:'Best place for learning 👍🙌 Absolutely loved every class. Highly recommend to every student in Navsari!',         stars:5, role:'Science Student' },
    { name:'Nimit Shah',      initial:'N', text:'Awesome Teaching And Best Teachers 👍👍👍 My grades improved significantly after joining Choksi Classes.',          stars:5, role:'Commerce Student' },
    { name:'Justdial',        initial:'J', text:'Rated 4.6/5 by 38 students on Justdial. One of the top-rated coaching centres in Navsari, Gujarat.',                stars:5, role:'Justdial · 38 Votes' },
    { name:'Facebook',        initial:'F', text:'Rated 5/5 on Facebook. Students and parents speak highly of the dedicated teaching staff and results.',              stars:5, role:'Facebook · 5★' },
];

const COURSES = [
    { icon: BookOpen,      title:'CBSE Board',      sub:'Std 1 – 10',  desc:'Complete CBSE curriculum — all subjects with concept-first approach and focused board prep.',          color:'#C1440E', bg:'rgba(193,68,14,0.10)' },
    { icon: GraduationCap, title:'GSEB Board',      sub:'Std 1 – 12',  desc:'Gujarat State Board coaching in Gujarati and English medium for all subjects.',                       color:'#E8A020', bg:'rgba(232,160,32,0.10)' },
    { icon: TrendingUp,    title:'Commerce Stream', sub:'Std 11 – 12', desc:'Accounts, Economics, Business Studies & Stats — taught by CA Kairavi Choksi with real-world expertise.', color:'#2563eb', bg:'rgba(37,99,235,0.10)' },
    { icon: Award,         title:'Daily Evaluation',sub:'All Batches', desc:'Daily tests, regular assessments, and doubt-clearing sessions ensure continuous progress.',            color:'#16a34a', bg:'rgba(22,163,74,0.10)' },
];

const PORTAL_FEATURES = [
    {
        icon: Smartphone, title: 'Student Portal',
        desc: 'Tests, homework, materials, doubts — all in one private dashboard. Every student gets their own login.',
        color: '#C1440E', bg: 'rgba(193,68,14,0.10)', large: true,
        items: ['Digital Tests & Results', 'Homework Tracking', 'Study Materials', 'Doubt Clearing'],
        flip: 'India\'s coaching classes run on WhatsApp. Choksi Classes runs on a full portal — built exclusively for students.',
    },
    {
        icon: Users, title: 'Parent Dashboard',
        desc: 'Fee tracking, child\'s progress, and live notices — parents always know what\'s happening.',
        color: '#2563eb', bg: 'rgba(37,99,235,0.10)',
        items: ['Fee History & Dues', 'Test Scores', 'Notice Board'],
        flip: 'Parents can check fees, progress reports and school notices any time — no WhatsApp chasing.',
    },
    {
        icon: FileText, title: 'Digital Tests',
        desc: 'Auto-graded tests with instant results. Sir creates once — students attempt online.',
        color: '#16a34a', bg: 'rgba(22,163,74,0.10)',
        items: ['MCQ + Subjective', 'Auto-graded'],
        flip: 'No paper, no manual correction. Tests created once, results delivered instantly.',
    },
    {
        icon: ClipboardList, title: 'Homework System',
        desc: 'Assign homework batch-wise. Students submit digitally. Sir reviews in-portal.',
        color: '#E8A020', bg: 'rgba(232,160,32,0.10)',
        items: ['Batch-wise assign', 'Digital submit'],
        flip: 'Homework assigned digitally — no lost papers, no excuses. Every submission tracked.',
    },
    {
        icon: Bell, title: 'Push Notifications',
        desc: 'Instant alerts to students & parents — new tests, notices, fees — even when app is closed.',
        color: '#7c3aed', bg: 'rgba(124,58,237,0.10)',
        items: ['Instant delivery', 'Works offline'],
        flip: 'Like a WhatsApp message — but smarter. Goes directly to the student or parent\'s phone.',
    },
    {
        icon: Inbox, title: 'Admissions Inbox',
        desc: 'Every enquiry from the website lands here. Sir sees it first — track, follow up, enroll.',
        color: '#059669', bg: 'rgba(5,150,105,0.10)',
        items: ['Lead tracking', 'Status pipeline'],
        flip: 'Sir gets a private inbox for every admission enquiry — no emails, no missed leads.',
    },
];

const COMPARISON = [
    { feature: 'Student Login Portal',        us: true, them: false },
    { feature: 'Parent Dashboard',            us: true, them: false },
    { feature: 'Digital Tests & Auto-grading',us: true, them: false },
    { feature: 'Online Homework System',      us: true, them: false },
    { feature: 'Fee Tracking Online',         us: true, them: false },
    { feature: 'Push Notifications',          us: true, them: false },
    { feature: 'Doubt Clearing System',       us: true, them: false },
    { feature: 'Admissions Inbox for Sir',    us: true, them: false },
    { feature: 'Study Materials Library',     us: true, them: false },
    { feature: 'WhatsApp Group',              us: true, them: true  },
];

const HOW_STEPS = [
    { num: '01', title: 'Enquire',   desc: 'Fill the form on our Admissions page — takes 60 seconds. Sir gets notified instantly.',    icon: Phone,         color: '#C1440E' },
    { num: '02', title: 'Enroll',    desc: 'Join your batch. Get your student login. Access everything from day one.',                   icon: GraduationCap, color: '#E8A020' },
    { num: '03', title: 'Excel',     desc: 'Daily tests, live results, doubt clearing — everything you need to top your board exams.',   icon: TrendingUp,    color: '#16a34a' },
];

/* ────────────────────────────────────────────────
   HERO — CHOKSI TITLE with framer-motion reveal
──────────────────────────────────────────────── */
function HeroTitle() {
    return (
        <div style={{ textAlign: 'center' }}>
            <motion.div
                initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
                animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            >
                <h1 style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 'clamp(64px,14vw,168px)',
                    fontWeight: 900, lineHeight: 0.88,
                    letterSpacing: '-0.02em',
                    color: '#F5F0E8',
                }}>CHOKSI</h1>
            </motion.div>

            <motion.div
                initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
                animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
                style={{ marginBottom: 28 }}
            >
                <h1 style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 'clamp(64px,14vw,168px)',
                    fontWeight: 900, lineHeight: 0.88,
                    letterSpacing: '-0.02em',
                }}>
                    <GradientText colors={['#C1440E','#E8A020','#F5D080','#E8A020','#C1440E']}>
                        CLASSES
                    </GradientText>
                </h1>
            </motion.div>
        </div>
    );
}

/* ────────────────────────────────────────────────
   STAT CARD  (used in stats section)
──────────────────────────────────────────────── */
function StatCard({ value, isFixed, suffix, label, note, color, delay }) {
    return (
        <FadeUp delay={delay}>
            <SpotlightCard
                spotColor={`${color}22`}
                style={{
                    textAlign: 'center', padding: '44px 24px',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                }}
            >
                <p style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 'clamp(52px,7vw,76px)',
                    fontWeight: 900, color, lineHeight: 1, marginBottom: 12,
                }}>
                    {isFixed ? value : <NumberTicker value={value} decimals={value % 1 !== 0 ? 1 : 0} suffix={suffix} />}
                    {isFixed && suffix}
                </p>
                <p style={{ color: 'rgba(245,240,232,0.85)', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{label}</p>
                <p style={{ color: 'rgba(245,240,232,0.35)', fontSize: 12, letterSpacing: '0.05em' }}>{note}</p>
            </SpotlightCard>
        </FadeUp>
    );
}

/* ────────────────────────────────────────────────
   PORTAL FEATURE BENTO CARD
──────────────────────────────────────────────── */
function BentoCard({ feature, index }) {
    const pad = feature.large ? 32 : 24;
    const baseCard = {
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(12px)',
        width: '100%', height: '100%',
        position: 'relative', overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
        padding: pad,
    };
    const front = (
        <SpotlightCard spotColor={`${feature.color}20`} style={baseCard}>
            <BorderBeam colorA={feature.color} colorB="#E8A020" duration={5 + index} />
            {/* icon */}
            <div style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: feature.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, flexShrink: 0 }}>
                <feature.icon size={22} color={feature.color} />
            </div>
            {/* title */}
            <p style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#F5F0E8', fontSize: feature.large ? 20 : 16, marginBottom: 8, flexShrink: 0 }}>
                {feature.title}
            </p>
            {/* desc */}
            <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: 12, lineHeight: 1.65, marginBottom: 14, flexShrink: 0 }}>
                {feature.desc}
            </p>
            {/* pills */}
            {feature.items && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 'auto' }}>
                    {feature.items.map((item, i) => (
                        <span key={i} style={{ padding: '3px 9px', borderRadius: 50, backgroundColor: `${feature.color}18`, border: `1px solid ${feature.color}35`, color: feature.color, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {item}
                        </span>
                    ))}
                    <span style={{ padding: '3px 8px', borderRadius: 50, color: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 500, letterSpacing: '0.06em', alignSelf: 'center' }}>
                        ↺ flip
                    </span>
                </div>
            )}
        </SpotlightCard>
    );
    const back = (
        <div style={{ ...baseCard, backgroundColor: feature.color, justifyContent: 'center', alignItems: 'center', textAlign: 'center', border: 'none' }}>
            <feature.icon size={32} color="rgba(255,255,255,0.55)" style={{ marginBottom: 16 }} />
            <p style={{ color: '#fff', fontSize: 13, lineHeight: 1.8, fontWeight: 500, maxWidth: 260 }}>{feature.flip}</p>
        </div>
    );
    return <FlipCard front={front} back={back} height={feature.large ? 300 : 240} style={{ height: '100%', minHeight: feature.large ? 260 : 210 }} />;
}

/* ────────────────────────────────────────────────
   COMPARISON ROW
──────────────────────────────────────────────── */
function CompareRow({ feature, us, them, index }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.5 });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="cmp-grid"
            style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto',
                alignItems: 'center', gap: 16,
                padding: '12px 20px',
                borderRadius: 12,
                backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.04)',
            }}
        >
            <span style={{ color: 'rgba(245,240,232,0.75)', fontSize: 14, fontWeight: 500 }}>{feature}</span>
            <motion.div
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ delay: index * 0.06 + 0.2, type: 'spring', stiffness: 280, damping: 18 }}
                style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(22,163,74,0.15)', border: '1.5px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Check size={15} color="#16a34a" strokeWidth={2.5} />
            </motion.div>
            <motion.div
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ delay: index * 0.06 + 0.3, type: 'spring', stiffness: 280, damping: 18 }}
                style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: them ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.12)', border: `1.5px solid ${them ? '#16a34a' : '#ef4444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                {them
                    ? <Check size={15} color="#16a34a" strokeWidth={2.5} />
                    : <X size={15} color="#ef4444" strokeWidth={2.5} />
                }
            </motion.div>
        </motion.div>
    );
}

/* ────────────────────────────────────────────────
   MAIN
──────────────────────────────────────────────── */
export default function Landing() {
    const navigate = useNavigate();
    const { isMobile, isTablet } = useBreakpoint();
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    const [heroSpot, setHeroSpot] = useState({ x: '50%', y: '50%' });
    const handleHeroMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHeroSpot({ x: `${e.clientX - rect.left}px`, y: `${e.clientY - rect.top}px` });
    };

    return (
        <PageTransition>
            <style>{STYLES}</style>
            <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F7F4EF', overflowX: 'hidden' }}>

                {/* ══════════════════════════════════════════════
                    §1  HERO
                ══════════════════════════════════════════════ */}
                <section
                    ref={heroRef}
                    onMouseMove={handleHeroMove}
                    style={{ minHeight: '100vh', backgroundColor: '#0D0603', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                    <AuroraBackground colors={['#C1440E','#E8A020','#1a0a05']} opacity={0.22} />
                    <DotGrid color="rgba(193,68,14,0.08)" size={32} />
                    <Meteors count={18} color="rgba(193,68,14,0.45)" />

                    {/* hero mouse spotlight */}
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
                        background: `radial-gradient(600px circle at ${heroSpot.x} ${heroSpot.y}, rgba(193,68,14,0.07) 0%, transparent 60%)`,
                        transition: 'background 0.1s ease',
                    }} />

                    {/* particles */}
                    {PARTICLES.map(p => (
                        <div key={p.id} className={p.anim} style={{
                            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
                            width: p.size, height: p.size, borderRadius: '50%',
                            backgroundColor: p.color, animationDelay: p.delay, pointerEvents: 'none', zIndex: 1,
                        }} />
                    ))}

                    {/* rings — hidden on mobile */}
                    <div className="animate-spin-slow hide-mobile" style={{ position: 'absolute', top: '7%', right: '5%', width: 190, height: 190, borderRadius: '50%', border: '1.5px dashed rgba(193,68,14,0.2)', pointerEvents: 'none', zIndex: 1 }} />
                    <div className="animate-spin-slow-r hide-mobile" style={{ position: 'absolute', top: '7%', right: '5%', width: 148, height: 148, margin: '21px', borderRadius: '50%', border: '1.5px solid rgba(232,160,32,0.12)', pointerEvents: 'none', zIndex: 1 }} />
                    <div className="hide-mobile" style={{ position: 'absolute', top: '7%', right: '5%', width: 190, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 2 }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: '#E8A020', fontWeight: 800, fontSize: 23, lineHeight: 1 }}>4.7</p>
                            <p style={{ color: 'rgba(245,240,232,0.4)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>Google</p>
                        </div>
                    </div>

                    {/* NAV */}
                    <motion.nav
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="hero-nav"
                        style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(193,68,14,0.28)', border: '1px solid rgba(193,68,14,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontWeight: 700, fontSize: 19 }}>C</span>
                            </div>
                            <span style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontWeight: 700, fontSize: 17 }}>Choksi Classes</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <motion.button
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={() => navigate('/admissions')}
                                className="hide-mobile"
                                style={{ padding: '9px 18px', borderRadius: 12, backgroundColor: 'transparent', color: 'rgba(245,240,232,0.75)', fontSize: 13, fontWeight: 600, border: '1px solid rgba(245,240,232,0.18)', cursor: 'pointer' }}
                            >
                                Enquire
                            </motion.button>
                            <RippleButton onClick={() => navigate('/login')} style={{ padding: '9px 20px', borderRadius: 12, backgroundColor: '#C1440E', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                Login <ArrowRight size={13} />
                            </RippleButton>
                        </div>
                    </motion.nav>

                    {/* HERO CONTENT */}
                    <motion.div style={{ y: heroY, opacity: heroOpacity }}>
                        <div className="hero-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 120px', textAlign: 'center', position: 'relative', zIndex: 5 }}>

                            {/* badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 24 }}
                                style={{ marginBottom: 36 }}
                            >
                                <AnimatedBadge color="#E8A020">
                                    CBSE · GSEB · Std 1–12 · 20+ Years Experience
                                </AnimatedBadge>
                            </motion.div>

                            <HeroTitle />

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.75, duration: 0.8 }}
                                style={{ color: 'rgba(245,240,232,0.55)', fontSize: 'clamp(15px,2.5vw,19px)', fontWeight: 300, maxWidth: 540, lineHeight: 1.7, marginBottom: 36 }}
                            >
                                The best classes in Town — daily tests, quality education for{' '}
                                <span style={{ color: 'rgba(245,240,232,0.85)', fontWeight: 600 }}>
                                    <WordRotate words={['CBSE', 'GSEB', 'Commerce']} style={{ color: '#E8A020' }} />
                                </span>
                                , with <strong style={{ color: 'rgba(245,240,232,0.85)', fontWeight: 700 }}>20+ years</strong> of proven excellence.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9, duration: 0.6 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44 }}
                            >
                                <div style={{ display: 'flex', gap: 3 }}>
                                    {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="#E8A020" color="#E8A020" />)}
                                </div>
                                <span style={{ color: 'rgba(245,240,232,0.85)', fontSize: 14, fontWeight: 700 }}>4.7</span>
                                <span style={{ color: 'rgba(245,240,232,0.35)', fontSize: 12 }}>37 Google Reviews</span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.05, type: 'spring', stiffness: 220, damping: 24 }}
                                className="cta-row"
                                style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? 320 : 'none' }}
                            >
                                <MagneticButton
                                    onClick={() => navigate('/login')}
                                    style={{ padding: '15px 38px', borderRadius: 16, backgroundColor: '#C1440E', color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(193,68,14,0.5)' }}
                                >
                                    Student Login <ArrowRight size={16} />
                                </MagneticButton>
                                <MagneticButton
                                    onClick={() => navigate('/admissions')}
                                    style={{ padding: '15px 38px', borderRadius: 16, backgroundColor: 'transparent', color: 'rgba(245,240,232,0.8)', fontSize: 15, fontWeight: 600, border: '1.5px solid rgba(245,240,232,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}
                                >
                                    Enroll Now
                                </MagneticButton>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* scroll indicator */}
                    <div className="animate-bounce-down" style={{ position: 'absolute', bottom: 90, left: 0, right: 0, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'rgba(245,240,232,0.28)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>scroll</span>
                        <ChevronDown size={16} color="rgba(245,240,232,0.28)" />
                    </div>

                    {/* retro grid at bottom */}
                    <RetroGrid opacity={0.32} bgColor="#0D0603" />

                    {/* angled cut */}
                    <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 80, backgroundColor: '#C1440E', clipPath: 'polygon(0 100%,100% 100%,100% 100%,0 30%)', zIndex: 6 }} />
                </section>

                {/* ══════════════════════════════════════════════
                    §2  MARQUEE TICKER
                ══════════════════════════════════════════════ */}
                <section style={{ backgroundColor: '#C1440E', overflow: 'hidden', padding: '18px 0', position: 'relative', zIndex: 5 }}>
                    <div style={{ display: 'flex', marginBottom: 10 }}>
                        <div className="marquee-l" style={{ display: 'flex', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {TICKER_LONG.map((item, i) => (
                                <span key={i} style={{ padding: '0 28px', color: '#FFFFFF', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', borderRight: '1px solid rgba(255,255,255,0.2)', opacity: i % 2 === 0 ? 1 : 0.65 }}>{item}</span>
                            ))}
                        </div>
                        <div className="marquee-l" aria-hidden="true" style={{ display: 'flex', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {TICKER_LONG.map((item, i) => (
                                <span key={i} style={{ padding: '0 28px', color: '#FFFFFF', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', borderRight: '1px solid rgba(255,255,255,0.2)', opacity: i % 2 === 0 ? 1 : 0.65 }}>{item}</span>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <div className="marquee-r" style={{ display: 'flex', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {[...TICKER_LONG].reverse().map((item, i) => (
                                <span key={i} style={{ padding: '0 28px', color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', borderRight: '1px solid rgba(255,255,255,0.1)' }}>{item}</span>
                            ))}
                        </div>
                        <div className="marquee-r" aria-hidden="true" style={{ display: 'flex', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {[...TICKER_LONG].reverse().map((item, i) => (
                                <span key={i} style={{ padding: '0 28px', color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', borderRight: '1px solid rgba(255,255,255,0.1)' }}>{item}</span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    §3  STATS
                ══════════════════════════════════════════════ */}
                <section style={{ backgroundColor: '#150906', padding: '60px 0' }}>
                    <div className="stat-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
                        <StatCard value={37}  suffix="+"  label="Google Reviews"   note="37 happy students"   color="#C1440E" delay={0}    />
                        <StatCard value={4.7} suffix="★" label="Avg Rating"        note="Google & Justdial"   color="#E8A020" delay={0.08} isFixed />
                        <StatCard value={100} suffix="+"  label="Students Taught"  note="and counting"        color="#16a34a" delay={0.16} />
                        <StatCard value={20}  suffix="+"  label="Years Experience" note="Expert faculty"      color="#2563eb" delay={0.24} />
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    §4  NAVSARI'S FIRST PORTAL  ← NEW
                ══════════════════════════════════════════════ */}
                <section className="section-pad" style={{ backgroundColor: '#0A0502', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
                    <AuroraBackground colors={['#1a0a04', '#C1440E', '#0A0502']} opacity={0.12} />
                    <DotGrid color="rgba(193,68,14,0.04)" size={40} />

                    <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>

                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: 72 }}>
                            <FadeUp>
                                <AnimatedBadge color="#E8A020" style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
                                    🏆 Navsari's First &amp; Only
                                </AnimatedBadge>
                                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(30px,5vw,56px)', fontWeight: 900, color: '#F5F0E8', lineHeight: 1.1, marginBottom: 20 }}>
                                    Every Other Class Uses WhatsApp.<br />
                                    <GradientText colors={['#C1440E','#E8A020','#F5D080','#E8A020','#C1440E']}>
                                        We Built a Portal.
                                    </GradientText>
                                </h2>
                            </FadeUp>
                            <FadeUp delay={0.1}>
                                <ScrollText
                                    baseColor="rgba(245,240,232,0.18)"
                                    activeColor="rgba(245,240,232,0.88)"
                                    style={{ color: 'rgba(245,240,232,0.88)', fontSize: 16, lineHeight: 1.9, maxWidth: 620, margin: '0 auto', justifyContent: 'center' }}
                                >
                                    Verified by research — no other coaching class in Navsari has anything close to this. Students, parents and Sir all get their own private dashboard. Not a third-party app. Built exclusively for Choksi Classes.
                                </ScrollText>
                            </FadeUp>
                        </div>

                        {/* Bento Grid */}
                        <StaggerContainer className="bento-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 14,
                        }}>
                            {/* Large card — Student Portal */}
                            <StaggerItem className="bento-large" style={{ gridColumn: '1 / 3', height: isMobile ? 'auto' : 300, minHeight: isMobile ? 260 : 300 }}>
                                <BentoCard feature={PORTAL_FEATURES[0]} index={0} />
                            </StaggerItem>

                            {/* Parent Dashboard */}
                            <StaggerItem style={{ height: isMobile ? 'auto' : 300, minHeight: isMobile ? 240 : 300 }}>
                                <BentoCard feature={PORTAL_FEATURES[1]} index={1} />
                            </StaggerItem>

                            {/* Row 2 — 3 equal cards */}
                            {PORTAL_FEATURES.slice(2).map((f, i) => (
                                <StaggerItem key={f.title} style={{ height: isMobile ? 'auto' : 240, minHeight: isMobile ? 210 : 240 }}>
                                    <BentoCard feature={f} index={i + 2} />
                                </StaggerItem>
                            ))}
                        </StaggerContainer>

                        {/* CTA strip below bento */}
                        <FadeUp delay={0.2} style={{ textAlign: 'center', marginTop: 52 }}>
                            <RippleButton
                                onClick={() => navigate('/admissions')}
                                style={{ padding: '16px 44px', borderRadius: 16, backgroundColor: '#C1440E', color: '#fff', fontSize: 15, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(193,68,14,0.4)', cursor: 'pointer' }}
                            >
                                <Zap size={16} /> Join Navsari's Only Digital Coaching Class
                            </RippleButton>
                        </FadeUp>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    §5  ABOUT
                ══════════════════════════════════════════════ */}
                <section id="about" className="section-pad" style={{ backgroundColor: '#F7F4EF', padding: '80px 24px' }}>
                    <div className="about-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: isMobile ? 40 : 64, alignItems: 'center' }}>

                        <FadeUp>
                            <p style={{ color: '#C1440E', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>◆ About Us</p>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#2C1810', lineHeight: 1.1, marginBottom: 24 }}>
                                Where Knowledge<br/>
                                <LetterReveal delay={0.3} style={{ color: '#C1440E', fontStyle: 'italic' }}>Meets Dedication</LetterReveal>
                            </h2>
                            <p style={{ color: 'rgba(44,24,16,0.65)', fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
                                Choksi Classes is Navsari's most trusted coaching institute — with <strong style={{ color: '#2C1810' }}>20+ years of academic excellence</strong>, we coach students from Std 1 through 12 in CBSE and GSEB, with specialized Commerce coaching for Std 11–12.
                            </p>
                            <p style={{ color: 'rgba(44,24,16,0.65)', fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
                                Led by <strong style={{ color: '#2C1810' }}>Dip Choksi</strong> and <strong style={{ color: '#2C1810' }}>CA Kairavi Choksi</strong> — daily tests, small batches, and a 24-hour helpline ensure every student gets the attention they deserve.
                            </p>
                            <StaggerContainer style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {['📅 Daily Tests','📊 Regular Evaluation','👥 Small Batches','📞 24hr Helpline','📍 Union Heights, Navsari'].map((chip, i) => (
                                    <StaggerItem key={i}>
                                        <motion.div
                                            whileHover={{ scale: 1.06, y: -2 }}
                                            style={{ padding: '8px 16px', borderRadius: 50, cursor: 'default', backgroundColor: 'rgba(193,68,14,0.08)', border: '1px solid rgba(193,68,14,0.18)', color: '#C1440E', fontSize: 12, fontWeight: 600 }}
                                        >{chip}</motion.div>
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>
                        </FadeUp>

                        <StaggerContainer style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {[
                                { icon: '📚', title: 'CBSE Board',       sub: 'Std 1 – 10',  color: '#C1440E' },
                                { icon: '📖', title: 'GSEB Board',       sub: 'Std 1 – 12',  color: '#E8A020' },
                                { icon: '📊', title: 'Commerce Stream',  sub: 'Std 11 – 12', color: '#2563eb' },
                                { icon: '📅', title: 'Daily Evaluation', sub: 'All Batches', color: '#16a34a' },
                            ].map((f, i) => (
                                <StaggerItem key={i}>
                                    <TiltCard maxTilt={8}>
                                        <SpotlightCard
                                            spotColor={`${f.color}18`}
                                            style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 4px 20px rgba(44,24,16,0.05)', height: '100%' }}
                                        >
                                            <span style={{ fontSize: 28, display: 'block', marginBottom: 12 }}>{f.icon}</span>
                                            <p style={{ fontWeight: 700, color: '#2C1810', fontSize: 15, marginBottom: 4 }}>{f.title}</p>
                                            <p style={{ color: f.color, fontSize: 12, fontWeight: 600 }}>{f.sub}</p>
                                        </SpotlightCard>
                                    </TiltCard>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    §6  COURSES
                ══════════════════════════════════════════════ */}
                <section className="section-pad" style={{ backgroundColor: '#FFFFFF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <FadeUp style={{ textAlign: 'center', marginBottom: 64 }}>
                            <p style={{ color: '#C1440E', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>Our Courses</p>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#2C1810' }}>
                                A Course For{' '}
                                <LetterReveal style={{ color: '#C1440E', fontStyle: 'italic' }}>Every Student</LetterReveal>
                            </h2>
                        </FadeUp>

                        <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24 }}>
                            {COURSES.map((c, i) => (
                                <StaggerItem key={i}>
                                    <SpotlightCard
                                        spotColor={`${c.color}15`}
                                        style={{ position: 'relative', borderRadius: 24, padding: 36, border: '1px solid rgba(44,24,16,0.07)', backgroundColor: '#FAFAF8', boxShadow: '0 4px 20px rgba(44,24,16,0.06)', overflow: 'hidden', height: '100%' }}
                                    >
                                        <BorderBeam colorA={c.color} colorB={c.color === '#C1440E' ? '#E8A020' : c.color} duration={5 + i} />
                                        <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                            <c.icon size={24} color={c.color} />
                                        </div>
                                        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: '#2C1810', marginBottom: 6 }}>{c.title}</p>
                                        <p style={{ color: c.color, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>{c.sub}</p>
                                        <p style={{ color: 'rgba(44,24,16,0.6)', fontSize: 14, lineHeight: 1.7 }}>{c.desc}</p>
                                        <CourseBar color={c.color} bg={c.bg} />
                                    </SpotlightCard>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    §7  HOW IT WORKS  ← NEW
                ══════════════════════════════════════════════ */}
                <section className="section-pad" style={{ backgroundColor: '#F7F4EF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                        <FadeUp style={{ textAlign: 'center', marginBottom: 64 }}>
                            <p style={{ color: '#C1440E', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>Simple Process</p>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900, color: '#2C1810' }}>
                                Join in{' '}
                                <LetterReveal style={{ color: '#C1440E', fontStyle: 'italic' }}>3 Easy Steps</LetterReveal>
                            </h2>
                        </FadeUp>

                        {/* Steps row */}
                        <div className="how-row" style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 0 }}>
                            {HOW_STEPS.map((step, i) => (
                                <>
                                    <FadeUp key={step.num} delay={i * 0.15} style={{ flex: '1 1 200px' }}>
                                        <GlowCard glowColor={`${step.color}30`}>
                                            <SpotlightCard
                                                spotColor={`${step.color}14`}
                                                style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: isMobile ? 24 : 32, border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 4px 20px rgba(44,24,16,0.06)', textAlign: isMobile ? 'left' : 'center', position: 'relative', overflow: 'hidden', display: isMobile ? 'flex' : 'block', alignItems: 'center', gap: isMobile ? 20 : 0 }}
                                            >
                                                <BorderBeam colorA={step.color} colorB="#E8A020" duration={4 + i} />
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -20 }}
                                                    whileInView={{ scale: 1, rotate: 0 }}
                                                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: i * 0.12 }}
                                                    viewport={{ once: true }}
                                                    style={{ width: isMobile ? 52 : 64, height: isMobile ? 52 : 64, borderRadius: '50%', backgroundColor: `${step.color}15`, border: `2px solid ${step.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: isMobile ? '0' : '0 auto 20px', flexShrink: 0 }}
                                                >
                                                    <step.icon size={isMobile ? 22 : 28} color={step.color} />
                                                </motion.div>
                                                <div>
                                                    <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 11, fontWeight: 700, color: step.color, letterSpacing: '0.15em', marginBottom: 4 }}>{step.num}</p>
                                                    <p style={{ fontFamily: 'Playfair Display, serif', fontSize: isMobile ? 18 : 22, fontWeight: 700, color: '#2C1810', marginBottom: 8 }}>{step.title}</p>
                                                    <p style={{ color: 'rgba(44,24,16,0.6)', fontSize: 13, lineHeight: 1.7 }}>{step.desc}</p>
                                                </div>
                                            </SpotlightCard>
                                        </GlowCard>
                                    </FadeUp>
                                    {i < HOW_STEPS.length - 1 && !isMobile && (
                                        <div key={`beam-${i}`} style={{ flex: '0 0 48px', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
                                            <BeamLine color="#C1440E" style={{ minWidth: 40 }} />
                                        </div>
                                    )}
                                </>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    §8  COMPARISON TABLE  ← NEW
                ══════════════════════════════════════════════ */}
                <section className="section-pad" style={{ backgroundColor: '#0D0603', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
                    <AuroraBackground colors={['#1a0a04','#C1440E','#0D0603']} opacity={0.1} />
                    <DotGrid color="rgba(193,68,14,0.04)" size={38} />
                    <RetroGrid opacity={0.28} bgColor="#0D0603" />

                    <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                        <FadeUp style={{ textAlign: 'center', marginBottom: 56 }}>
                            <AnimatedBadge color="#C1440E" style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
                                Confirmed by Web Research
                            </AnimatedBadge>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px,4.5vw,50px)', fontWeight: 900, color: '#F5F0E8', lineHeight: 1.1, marginBottom: 16 }}>
                                No One Else in Navsari<br/>
                                <GradientText>Has Any of This.</GradientText>
                            </h2>
                            <p style={{ color: 'rgba(245,240,232,0.45)', fontSize: 14, lineHeight: 1.8 }}>
                                We searched every coaching class in Navsari — Synergy, Ahura, and all others listed on Sulekha &amp; UrbanPro. None have a student portal.
                            </p>
                        </FadeUp>

                        {/* Table header */}
                        <FadeUp delay={0.1}>
                            <div className="cmp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, padding: '10px 20px 16px', marginBottom: 4 }}>
                                <span style={{ color: 'rgba(245,240,232,0.3)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Feature</span>
                                <span style={{ color: '#E8A020', fontSize: isMobile ? 9 : 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center', minWidth: isMobile ? 36 : 90 }}>{isMobile ? 'Us' : 'Choksi Classes'}</span>
                                <span style={{ color: 'rgba(245,240,232,0.3)', fontSize: isMobile ? 9 : 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center', minWidth: isMobile ? 36 : 90 }}>{isMobile ? 'Others' : 'Others in Navsari'}</span>
                            </div>

                            <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.02)', padding: '8px 0' }}>
                                {COMPARISON.map((row, i) => (
                                    <CompareRow key={i} {...row} index={i} />
                                ))}
                            </div>
                        </FadeUp>

                        <FadeUp delay={0.2} style={{ textAlign: 'center', marginTop: 48 }}>
                            <RippleButton
                                onClick={() => navigate('/admissions')}
                                style={{ padding: '15px 40px', borderRadius: 16, backgroundColor: '#C1440E', color: '#fff', fontSize: 15, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(193,68,14,0.4)', cursor: 'pointer' }}
                            >
                                Be Part of the First <ArrowRight size={16} />
                            </RippleButton>
                        </FadeUp>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    §9  TESTIMONIALS
                ══════════════════════════════════════════════ */}
                <section style={{ backgroundColor: '#150906', padding: '80px 0', overflow: 'hidden' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
                        <FadeUp style={{ textAlign: 'center', marginBottom: 64 }}>
                            <p style={{ color: '#C1440E', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>Reviews</p>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#F5F0E8' }}>
                                What Students<br/>
                                <GradientText>Are Saying</GradientText>
                            </h2>
                        </FadeUp>
                    </div>

                    <div style={{ display: 'flex', gap: 24, paddingLeft: 24, paddingRight: 24, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 12 }}>
                        {REVIEWS.map((r, i) => (
                            <TiltCard key={i} maxTilt={6} style={{ flexShrink: 0, width: 320 }}>
                                <GlowCard glowColor="rgba(193,68,14,0.3)" style={{ borderRadius: 24, padding: 32, cursor: 'default', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <Quote size={28} color="rgba(193,68,14,0.35)" style={{ marginBottom: 20 }} />
                                    <p style={{ color: 'rgba(245,240,232,0.8)', fontSize: 15, lineHeight: 1.75, marginBottom: 28, fontStyle: 'italic' }}>"{r.text}"</p>
                                    <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                                        {[...Array(r.stars)].map((_, s) => <Star key={s} size={13} fill="#E8A020" color="#E8A020" />)}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#C1440E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 16, flexShrink: 0 }}>
                                            {r.initial}
                                        </div>
                                        <div>
                                            <p style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 14 }}>{r.name}</p>
                                            <p style={{ color: 'rgba(245,240,232,0.4)', fontSize: 11 }}>{r.role}</p>
                                        </div>
                                    </div>
                                </GlowCard>
                            </TiltCard>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    §10  BIG CTA
                ══════════════════════════════════════════════ */}
                <section className="section-pad" style={{ backgroundColor: '#C1440E', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
                    <AuroraBackground colors={['#a0360b','#E8A020','#7a2a08']} opacity={0.2} />
                    <DotGrid color="rgba(255,255,255,0.08)" size={30} />
                    <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 500, height: 500, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                    <FadeUp style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                        <Award size={48} color="rgba(255,255,255,0.25)" style={{ margin: '0 auto 24px', display: 'block' }} />
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', marginBottom: 20 }}
                        >
                            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>🎓 Admissions Open</span>
                        </motion.div>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px,6vw,60px)', fontWeight: 900, color: '#FFFFFF', marginBottom: 20, lineHeight: 1.1 }}>
                            Enroll Your Child<br/>in the Best Class
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 17, lineHeight: 1.7, marginBottom: 44 }}>
                            Std 1–10 (CBSE &amp; GSEB) · Std 11–12 Commerce — with daily tests, small batches, and a 24-hour helpline. 20+ years of proven results. Navsari's only digital coaching portal.
                        </p>
                        <div className="cta-row" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <RippleButton
                                onClick={() => navigate('/admissions')}
                                style={{ padding: '16px 40px', borderRadius: 16, backgroundColor: '#FFFFFF', color: '#C1440E', fontSize: 15, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 40px rgba(44,24,16,0.3)', cursor: 'pointer' }}
                            >
                                Enquire Now <ArrowRight size={17} />
                            </RippleButton>
                            <MagneticButton
                                onClick={() => navigate('/login')}
                                style={{ padding: '16px 40px', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 15, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 10, border: '1.5px solid rgba(255,255,255,0.3)' }}
                            >
                                Student Portal
                            </MagneticButton>
                        </div>
                    </FadeUp>
                </section>

                {/* ══════════════════════════════════════════════
                    §11  CONTACT CARDS
                ══════════════════════════════════════════════ */}
                <section className="section-pad" style={{ backgroundColor: '#F7F4EF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <FadeUp style={{ textAlign: 'center', marginBottom: 48 }}>
                            <p style={{ color: '#C1440E', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Get In Touch</p>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#2C1810' }}>
                                We're Right Here in <span style={{ color: '#C1440E' }}>Navsari</span>
                            </h2>
                        </FadeUp>
                        <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24 }}>
                            {[
                                { icon: MapPin, title:'Our Location',      lines:['304/5/6/7, Union Heights','Ashanagar, Navsari','Gujarat – 396445'], action:'https://maps.google.com/?q=Union+Heights+Ashanagar+Navsari', cta:'Get Directions →', color:'#C1440E' },
                                { icon: Phone,  title:'Dip Choksi',        lines:['Director & Head Faculty','+91 82382 16622','24hr query helpline'],   action:'tel:+918238216622', cta:'Call Now →', color:'#16a34a' },
                                { icon: Phone,  title:'CA Kairavi Choksi', lines:['Commerce Faculty (CA)','+91 97260 19001','kairavichoksi@yahoo.com'], action:'tel:+919726019001', cta:'Call Now →', color:'#2563eb' },
                                { icon: Award,  title:'Rating & Reviews',  lines:['4.7★ Google (37 reviews)','4.6★ Justdial (38 votes)','5★ Facebook'], action:'https://g.page/r/review', cta:'Read Reviews →', color:'#E8A020' },
                            ].map((c, i) => (
                                <StaggerItem key={i}>
                                    <SpotlightCard
                                        spotColor={`${c.color}14`}
                                        style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 36, border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 4px 20px rgba(44,24,16,0.05)', height: '100%' }}
                                    >
                                        <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                            <c.icon size={22} color={c.color} />
                                        </div>
                                        <p style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#2C1810', fontSize: 18, marginBottom: 14 }}>{c.title}</p>
                                        {c.lines.map((l, li) => <p key={li} style={{ color: 'rgba(44,24,16,0.6)', fontSize: 14, lineHeight: 1.9 }}>{l}</p>)}
                                        <a href={c.action} target="_blank" rel="noopener noreferrer"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 20, color: c.color, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                                            {c.cta}
                                        </a>
                                    </SpotlightCard>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    §12  GOOGLE MAPS
                ══════════════════════════════════════════════ */}
                <section className="section-pad" style={{ backgroundColor: '#F7F4EF', padding: '0 24px 80px' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <FadeUp>
                            <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(44,24,16,0.08)', boxShadow: '0 8px 40px rgba(44,24,16,0.08)', position: 'relative' }}>
                                <iframe
                                    title="Choksi Classes Location"
                                    src="https://maps.google.com/maps?q=20.9503,72.9267&hl=en&z=16&output=embed"
                                    width="100%" height="340" style={{ border: 0, display: 'block' }}
                                    allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <MapPin size={13} color="#C1440E" />
                                <span style={{ color: 'rgba(44,24,16,0.6)', fontSize: 13 }}>304/5/6/7, Union Heights, Ashanagar, Navsari, Gujarat 396445</span>
                                <a href="https://maps.google.com/?q=20.9503,72.9267" target="_blank" rel="noopener noreferrer" style={{ color: '#C1440E', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    Open in Maps <ExternalLink size={11} />
                                </a>
                            </div>
                        </FadeUp>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                    §13  FOOTER
                ══════════════════════════════════════════════ */}
                <footer style={{ backgroundColor: '#0D0603', padding: '48px 24px 32px', borderTop: '1px solid rgba(193,68,14,0.12)', position: 'relative', overflow: 'hidden' }}>
                    <DotGrid color="rgba(193,68,14,0.05)" size={30} />
                    <div className="footer-row" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(193,68,14,0.28)', border: '1px solid rgba(193,68,14,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontWeight: 700, fontSize: 17 }}>C</span>
                            </div>
                            <div>
                                <p style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontWeight: 700, fontSize: 15 }}>Choksi Classes</p>
                                <p style={{ color: 'rgba(245,240,232,0.3)', fontSize: 11 }}>Navsari's First Digital Coaching Portal</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {[...Array(5)].map((_, s) => <Star key={s} size={14} fill="#E8A020" color="#E8A020" />)}
                            <span style={{ color: 'rgba(245,240,232,0.5)', fontSize: 13, marginLeft: 6 }}>4.7 · 37 Reviews</span>
                        </div>
                        <p style={{ color: 'rgba(245,240,232,0.28)', fontSize: 12 }}>CBSE · GSEB · Std 1–10 · Commerce 11–12</p>
                    </div>
                    <div style={{ maxWidth: 1100, margin: '24px auto 0', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 22px', borderRadius: 50, backgroundColor: 'rgba(193,68,14,0.12)', border: '1px solid rgba(193,68,14,0.2)', cursor: 'default' }}
                        >
                            <span style={{ fontSize: 15 }}>🎓</span>
                            <p style={{ color: 'rgba(245,240,232,0.6)', fontSize: 13, fontWeight: 500 }}>
                                Designed &amp; built with <span style={{ color: '#C1440E', fontWeight: 700 }}>❤️</span> by a <span style={{ color: 'rgba(245,240,232,0.9)', fontWeight: 600 }}>proud student of Choksi Classes</span>
                            </p>
                        </motion.div>
                        <p style={{ color: 'rgba(245,240,232,0.15)', fontSize: 11 }}>© {new Date().getFullYear()} Choksi Classes, Navsari · All rights reserved</p>
                    </div>
                </footer>
            </div>

            {/* ══ FLOATING WHATSAPP ══ */}
            <motion.a
                href="https://wa.me/918238216622?text=Hi%2C%20I%20want%20to%20enquire%20about%20admissions%20at%20Choksi%20Classes."
                target="_blank" rel="noopener noreferrer"
                whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }}
                style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 999, width: 56, height: 56, borderRadius: '50%', backgroundColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,0.5)', textDecoration: 'none', animation: 'livePulse 2.5s ease infinite' }}
            >
                <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
                    <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.678 4.61 1.854 6.5L4 29l7.75-1.832A11.94 11.94 0 0016 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm6.08 16.5c-.253.713-1.497 1.36-2.048 1.428-.523.065-1.188.092-1.916-.12a17.56 17.56 0 01-1.734-.643C14.035 19.085 12.17 17.2 11.4 15.8c-.398-.706-.414-1.32-.257-1.758.157-.437.525-.636.787-.664l.56-.013c.19-.004.44.071.686.54l.82 1.73c.08.17.04.37-.09.52l-.37.43c-.12.14-.13.32-.03.46.32.48.89 1.16 1.48 1.7.64.59 1.38 1.07 1.9 1.29.16.07.34.04.46-.08l.38-.42c.13-.14.31-.2.49-.16l1.8.43c.42.1.67.35.67.67v.5z"/>
                </svg>
            </motion.a>

            {/* ══ ENQUIRE NOW FLOAT ══ */}
            <motion.a
                href="/admissions"
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                style={{ position: 'fixed', bottom: 90, right: 20, zIndex: 998, padding: '10px 18px', borderRadius: 50, backgroundColor: '#C1440E', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 4px 18px rgba(193,68,14,0.45)', textDecoration: 'none' }}
            >
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>🎓 Enquire Now</span>
            </motion.a>
        </PageTransition>
    );
}

/* ── Animated progress bar in course cards ── */
function CourseBar({ color, bg }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    return (
        <div ref={ref} style={{ marginTop: 28, height: 3, borderRadius: 2, backgroundColor: bg, overflow: 'hidden' }}>
            <motion.div
                initial={{ width: '0%' }}
                animate={inView ? { width: '100%' } : { width: '0%' }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                style={{ height: '100%', backgroundColor: color, borderRadius: 2 }}
            />
        </div>
    );
}
