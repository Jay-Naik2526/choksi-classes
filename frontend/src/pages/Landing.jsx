import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Star, MapPin, Phone, ArrowRight, BookOpen,
    Award, ChevronDown, Sparkles, GraduationCap,
    TrendingUp, Quote
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════
   KEYFRAME STYLES  (injected once)
════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap');

@keyframes floatA {
  0%,100%{ transform:translateY(0px) rotate(0deg); }
  33%    { transform:translateY(-22px) rotate(4deg); }
  66%    { transform:translateY(-10px) rotate(-3deg); }
}
@keyframes floatB {
  0%,100%{ transform:translateY(0px) rotate(0deg); }
  50%    { transform:translateY(-30px) rotate(-5deg); }
}
@keyframes floatC {
  0%,100%{ transform:translateY(0px); }
  40%    { transform:translateY(-15px); }
}
@keyframes glowPulse {
  0%,100%{ opacity:.18; transform:scale(1); }
  50%    { opacity:.35; transform:scale(1.08); }
}
@keyframes spinSlow {
  from{ transform:rotate(0deg); }
  to  { transform:rotate(360deg); }
}
@keyframes spinSlowR {
  from{ transform:rotate(0deg); }
  to  { transform:rotate(-360deg); }
}
@keyframes marqueeL {
  0%  { transform:translateX(0); }
  100%{ transform:translateX(-50%); }
}
@keyframes marqueeR {
  0%  { transform:translateX(-50%); }
  100%{ transform:translateX(0); }
}
@keyframes fadeUp {
  from{ opacity:0; transform:translateY(40px); }
  to  { opacity:1; transform:translateY(0); }
}
@keyframes fadeIn {
  from{ opacity:0; }
  to  { opacity:1; }
}
@keyframes titleReveal {
  from{ clip-path:inset(0 100% 0 0); opacity:0; }
  to  { clip-path:inset(0 0% 0 0);   opacity:1; }
}
@keyframes slideInLeft {
  from{ opacity:0; transform:translateX(-50px); }
  to  { opacity:1; transform:translateX(0); }
}
@keyframes slideInRight {
  from{ opacity:0; transform:translateX(50px); }
  to  { opacity:1; transform:translateX(0); }
}
@keyframes bounceDown {
  0%,100%{ transform:translateY(0); opacity:1; }
  50%    { transform:translateY(8px); opacity:.6; }
}
@keyframes shimmerText {
  0%   { background-position:0% 50%; }
  50%  { background-position:100% 50%; }
  100% { background-position:0% 50%; }
}
@keyframes dotPop {
  0%  { transform:scale(0); opacity:0; }
  60% { transform:scale(1.3); }
  100%{ transform:scale(1); opacity:1; }
}
@keyframes cardHover {
  from{ transform:translateY(0) scale(1); }
  to  { transform:translateY(-8px) scale(1.02); }
}
.animate-float-a{ animation:floatA 7s ease-in-out infinite; }
.animate-float-b{ animation:floatB 9s ease-in-out infinite; }
.animate-float-c{ animation:floatC 5s ease-in-out infinite; }
.animate-glow   { animation:glowPulse 4s ease-in-out infinite; }
.animate-spin-slow { animation:spinSlow 18s linear infinite; }
.animate-spin-slow-r { animation:spinSlowR 24s linear infinite; }
.animate-bounce-down{ animation:bounceDown 1.8s ease-in-out infinite; }
.marquee-l { animation:marqueeL 22s linear infinite; }
.marquee-r { animation:marqueeR 28s linear infinite; }

/* reveal-on-scroll */
.reveal { opacity:0; transform:translateY(36px); transition:opacity .7s ease, transform .7s ease; }
.reveal.visible { opacity:1; transform:translateY(0); }
.reveal-l { opacity:0; transform:translateX(-40px); transition:opacity .7s ease, transform .7s ease; }
.reveal-l.visible { opacity:1; transform:translateX(0); }
.reveal-r { opacity:0; transform:translateX(40px); transition:opacity .7s ease, transform .7s ease; }
.reveal-r.visible { opacity:1; transform:translateX(0); }
.delay-1 { transition-delay:.1s !important; }
.delay-2 { transition-delay:.2s !important; }
.delay-3 { transition-delay:.3s !important; }
.delay-4 { transition-delay:.4s !important; }
.delay-5 { transition-delay:.5s !important; }

.shiny-text {
  background: linear-gradient(90deg, #C1440E 0%, #E8A020 30%, #F5D080 50%, #E8A020 70%, #C1440E 100%);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmerText 4s ease infinite;
}
.glass-card {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
}
.card-lift {
  transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease;
}
.card-lift:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 28px 60px rgba(0,0,0,0.4);
}
`;

/* ════════════════════════════════════════════════════════════
   COUNT-UP HOOK
════════════════════════════════════════════════════════════ */
function useCountUp(target, suffix = '', duration = 1800) {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: .4 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    useEffect(() => {
        if (!started) return;
        const steps = 60, inc = target / steps, interval = duration / steps;
        let cur = 0;
        const t = setInterval(() => {
            cur += inc;
            if (cur >= target) { setCount(target); clearInterval(t); }
            else setCount(Math.floor(cur));
        }, interval);
        return () => clearInterval(t);
    }, [started, target, duration]);
    return [count, ref];
}

/* ════════════════════════════════════════════════════════════
   REVEAL ON SCROLL HOOK
════════════════════════════════════════════════════════════ */
function useReveal() {
    const ref = useRef(null);
    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: .12 }
        );
        if (!ref.current) return;
        const els = ref.current.querySelectorAll('.reveal,.reveal-l,.reveal-r');
        els.forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);
    return ref;
}

/* ════════════════════════════════════════════════════════════
   FLOATING PARTICLES
════════════════════════════════════════════════════════════ */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    size: 2 + (i % 4),
    x: (i * 37 + 11) % 100,
    y: (i * 53 + 7)  % 100,
    anim: ['animate-float-a','animate-float-b','animate-float-c'][i % 3],
    delay: `${(i * 0.4) % 5}s`,
    color: i % 3 === 0 ? 'rgba(193,68,14,0.5)' : i % 3 === 1 ? 'rgba(232,160,32,0.4)' : 'rgba(245,240,232,0.2)',
}));

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function Landing() {
    const navigate = useNavigate();
    const revealRef = useReveal();
    const [r1, ref1] = useCountUp(37);
    const [r2, ref2] = useCountUp(4.7, '', 1200);
    const [r3, ref3] = useCountUp(100);
    const [r4, ref4] = useCountUp(20);
    const [heroVisible, setHeroVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setHeroVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    const TICKER_ITEMS = ['CBSE','GSEB','Commerce','Std 1–10','Navsari','20+ Years','CBSE','GSEB','Commerce','Std 1–10','Navsari','20+ Years','CBSE','GSEB','Commerce','Std 1–10','Navsari','20+ Years','CBSE','GSEB','Commerce','Std 1–10','Navsari','20+ Years'];
    const REVIEWS = [
        { name: 'Vardhaman Patel', initial: 'V', text: 'Had a great experience while studying there till 10th Grade. The teachers are amazing and always ready to help.', stars: 5, role: 'Class 10 Student' },
        { name: 'Isha Panchal',    initial: 'I', text: 'Best place for learning 👍🙌 Absolutely loved every class. Highly recommend to every student in Navsari!', stars: 5, role: 'Science Student' },
        { name: 'Nimit Shah',      initial: 'N', text: 'Awesome Teaching And Best Teachers 👍👍👍 My grades improved significantly after joining Choksi Classes.', stars: 5, role: 'Commerce Student' },
        { name: 'Justdial',        initial: 'J', text: 'Rated 4.6/5 by 38 students on Justdial. One of the top-rated coaching centres in Navsari, Gujarat.', stars: 5, role: 'Justdial · 38 Votes' },
        { name: 'Facebook',        initial: 'F', text: 'Rated 5/5 on Facebook. Students and parents speak highly of the dedicated teaching staff and results.', stars: 5, role: 'Facebook · 5★' },
    ];
    const COURSES = [
        { icon: BookOpen,     title: 'CBSE Board',         sub: 'Std 1 – 10',  desc: 'Complete CBSE curriculum — all subjects taught with concept-first approach and focused board exam preparation.',  color: '#C1440E', bg: 'rgba(193,68,14,0.12)' },
        { icon: GraduationCap,title: 'GSEB Board',         sub: 'Std 1 – 12',  desc: 'Comprehensive Gujarat State Board coaching in Gujarati and English medium for all subjects.', color: '#E8A020', bg: 'rgba(232,160,32,0.12)' },
        { icon: TrendingUp,   title: 'Commerce Stream',    sub: 'Std 11 – 12', desc: 'Accounts, Economics, Business Studies & Stats — taught by CA Kairavi Choksi with real-world expertise.', color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
        { icon: Award,        title: 'Daily Evaluation',   sub: 'All Batches',  desc: 'Daily tests, regular assessments, and doubt-clearing sessions ensure continuous progress and exam readiness.', color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
    ];

    return (
        <>
            <style>{STYLES}</style>
            <div ref={revealRef} style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F7F4EF', overflowX: 'hidden' }}>

                {/* ══════════════════════════════════════════════════════
                    § 1  HERO  — full screen, dark, dramatic
                ══════════════════════════════════════════════════════ */}
                <section style={{ minHeight: '100vh', backgroundColor: '#140A05', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                    {/* ambient glow blobs */}
                    <div className="animate-glow" style={{ position:'absolute', top:'-15%', left:'-10%', width:'55vw', height:'55vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(193,68,14,0.25) 0%, transparent 65%)', pointerEvents:'none' }}/>
                    <div className="animate-glow" style={{ position:'absolute', bottom:'-20%', right:'-15%', width:'60vw', height:'60vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(232,160,32,0.15) 0%, transparent 65%)', pointerEvents:'none', animationDelay:'2s' }}/>

                    {/* floating particles */}
                    {PARTICLES.map(p => (
                        <div key={p.id} className={p.anim}
                            style={{
                                position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
                                width: p.size, height: p.size,
                                borderRadius:'50%', backgroundColor: p.color,
                                animationDelay: p.delay, pointerEvents:'none',
                            }}/>
                    ))}

                    {/* rotating ring decoration */}
                    <div className="animate-spin-slow" style={{ position:'absolute', top:'8%', right:'6%', width:180, height:180, borderRadius:'50%', border:'1.5px dashed rgba(193,68,14,0.25)', pointerEvents:'none' }}/>
                    <div className="animate-spin-slow-r" style={{ position:'absolute', top:'8%', right:'6%', width:140, height:140, margin:'20px', borderRadius:'50%', border:'1.5px solid rgba(232,160,32,0.15)', pointerEvents:'none' }}/>
                    {/* star badge inside ring */}
                    <div style={{ position:'absolute', top:'8%', right:'6%', width:180, height:180, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                        <div style={{ textAlign:'center' }}>
                            <p style={{ color:'#E8A020', fontWeight:700, fontSize:22 }}>4.7</p>
                            <p style={{ color:'rgba(245,240,232,0.5)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase' }}>Google</p>
                        </div>
                    </div>

                    {/* nav bar */}
                    <nav style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 32px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:36, height:36, borderRadius:10, backgroundColor:'rgba(193,68,14,0.3)', border:'1px solid rgba(193,68,14,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <span style={{ fontFamily:'Playfair Display, serif', color:'#F5F0E8', fontWeight:700, fontSize:18 }}>C</span>
                            </div>
                            <span style={{ fontFamily:'Playfair Display, serif', color:'#F5F0E8', fontWeight:700, fontSize:17 }}>Choksi Classes</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <button onClick={() => navigate('/admissions')}
                                style={{ padding:'9px 18px', borderRadius:12, backgroundColor:'transparent', color:'rgba(245,240,232,0.7)', fontSize:13, fontWeight:600, border:'1px solid rgba(245,240,232,0.2)', cursor:'pointer' }}>
                                Enquire
                            </button>
                            <button onClick={() => navigate('/login')}
                                style={{ padding:'9px 20px', borderRadius:12, backgroundColor:'#C1440E', color:'#fff', fontSize:13, fontWeight:600, border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                                Login <ArrowRight size={13}/>
                            </button>
                        </div>
                    </nav>

                    {/* hero content */}
                    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px', textAlign:'center', position:'relative', zIndex:5 }}>

                        {/* top badge */}
                        <div style={{
                            display:'inline-flex', alignItems:'center', gap:8,
                            padding:'7px 18px', borderRadius:50,
                            backgroundColor:'rgba(193,68,14,0.15)', border:'1px solid rgba(193,68,14,0.3)',
                            marginBottom:32,
                            opacity: heroVisible ? 1 : 0,
                            transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'opacity .6s ease, transform .6s ease',
                        }}>
                            <Sparkles size={13} color="#E8A020" />
                            <span style={{ color:'rgba(245,240,232,0.8)', fontSize:12, fontWeight:500, letterSpacing:'0.05em' }}>
                                CBSE · GSEB · Std 1–12 · 20+ Years Experience
                            </span>
                        </div>

                        {/* Giant headline */}
                        <div style={{ overflow:'hidden', marginBottom:4 }}>
                            <h1 style={{
                                fontFamily:'Playfair Display, serif',
                                fontSize:'clamp(60px, 14vw, 160px)',
                                fontWeight:900,
                                lineHeight:.9,
                                letterSpacing:'-0.02em',
                                color:'#F5F0E8',
                                display:'block',
                                opacity: heroVisible ? 1 : 0,
                                transform: heroVisible ? 'translateY(0)' : 'translateY(60px)',
                                transition:'opacity .8s ease .1s, transform .8s cubic-bezier(.22,1,.36,1) .1s',
                            }}>
                                CHOKSI
                            </h1>
                        </div>
                        <div style={{ overflow:'hidden', marginBottom:28 }}>
                            <h1 className="shiny-text" style={{
                                fontFamily:'Playfair Display, serif',
                                fontSize:'clamp(60px, 14vw, 160px)',
                                fontWeight:900,
                                lineHeight:.9,
                                letterSpacing:'-0.02em',
                                display:'block',
                                opacity: heroVisible ? 1 : 0,
                                transform: heroVisible ? 'translateY(0)' : 'translateY(60px)',
                                transition:'opacity .8s ease .25s, transform .8s cubic-bezier(.22,1,.36,1) .25s',
                            }}>
                                CLASSES
                            </h1>
                        </div>

                        <p style={{
                            color:'rgba(245,240,232,0.55)',
                            fontSize:'clamp(15px, 2.5vw, 19px)',
                            fontWeight:300,
                            maxWidth:520,
                            lineHeight:1.7,
                            marginBottom:44,
                            opacity: heroVisible ? 1 : 0,
                            transition:'opacity .8s ease .45s',
                        }}>
                            The best classes in Town — daily tests, quality education for all subjects, with <strong style={{color:'rgba(245,240,232,0.8)', fontWeight:600}}>20+ years</strong> of proven academic excellence.
                        </p>

                        {/* Star rating row */}
                        <div style={{
                            display:'flex', alignItems:'center', gap:12, marginBottom:40,
                            opacity: heroVisible ? 1 : 0,
                            transition:'opacity .8s ease .55s',
                        }}>
                            <div style={{ display:'flex', gap:3 }}>
                                {[1,2,3,4,5].map(s => (
                                    <Star key={s} size={16} fill="#E8A020" color="#E8A020"/>
                                ))}
                            </div>
                            <span style={{ color:'rgba(245,240,232,0.8)', fontSize:14, fontWeight:600 }}>4.7</span>
                            <span style={{ color:'rgba(245,240,232,0.35)', fontSize:12 }}>37 Google Reviews</span>
                        </div>

                        {/* CTA buttons */}
                        <div style={{
                            display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center',
                            opacity: heroVisible ? 1 : 0,
                            transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                            transition:'opacity .8s ease .65s, transform .8s ease .65s',
                        }}>
                            <button onClick={() => navigate('/login')}
                                style={{ padding:'15px 36px', borderRadius:16, backgroundColor:'#C1440E', color:'#fff', fontSize:15, fontWeight:700, border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(193,68,14,0.5)', transition:'transform .2s ease, box-shadow .2s ease' }}
                                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 14px 40px rgba(193,68,14,0.6)'; }}
                                onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(193,68,14,0.5)'; }}>
                                Student Login <ArrowRight size={16}/>
                            </button>
                            <a href="#about"
                                style={{ padding:'15px 36px', borderRadius:16, backgroundColor:'transparent', color:'rgba(245,240,232,0.8)', fontSize:15, fontWeight:600, border:'1.5px solid rgba(245,240,232,0.2)', cursor:'pointer', display:'flex', alignItems:'center', gap:8, textDecoration:'none', transition:'background .2s, border-color .2s' }}
                                onMouseEnter={e=>{ e.currentTarget.style.backgroundColor='rgba(245,240,232,0.08)'; e.currentTarget.style.borderColor='rgba(245,240,232,0.4)'; }}
                                onMouseLeave={e=>{ e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.borderColor='rgba(245,240,232,0.2)'; }}>
                                Explore
                            </a>
                        </div>
                    </div>

                    {/* scroll indicator */}
                    <div className="animate-bounce-down" style={{ position:'relative', zIndex:5, display:'flex', flexDirection:'column', alignItems:'center', paddingBottom:32, gap:6 }}>
                        <span style={{ color:'rgba(245,240,232,0.3)', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase' }}>scroll</span>
                        <ChevronDown size={18} color="rgba(245,240,232,0.3)"/>
                    </div>

                    {/* diagonal bottom cut */}
                    <div style={{ position:'absolute', bottom:-1, left:0, right:0, height:80, backgroundColor:'#C1440E', clipPath:'polygon(0 100%, 100% 100%, 100% 100%, 0 30%)', zIndex:6 }}/>
                </section>

                {/* ══════════════════════════════════════════════════════
                    § 2  TICKER MARQUEE
                ══════════════════════════════════════════════════════ */}
                <section style={{ backgroundColor:'#C1440E', overflow:'hidden', padding:'18px 0', position:'relative', zIndex:5 }}>
                    {/* Row 1: left */}
                    <div style={{ display:'flex', gap:0, marginBottom:10 }}>
                        <div className="marquee-l" style={{ display:'flex', gap:0, flexShrink:0, whiteSpace:'nowrap' }}>
                            {TICKER_ITEMS.map((item, i) => (
                                <span key={i} style={{ padding:'0 28px', color:'#FFFFFF', fontSize:14, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', borderRight:'1px solid rgba(255,255,255,0.2)', opacity: i%2===0 ? 1 : 0.7 }}>
                                    {item}
                                </span>
                            ))}
                        </div>
                        <div className="marquee-l" aria-hidden="true" style={{ display:'flex', gap:0, flexShrink:0, whiteSpace:'nowrap' }}>
                            {TICKER_ITEMS.map((item, i) => (
                                <span key={i} style={{ padding:'0 28px', color:'#FFFFFF', fontSize:14, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', borderRight:'1px solid rgba(255,255,255,0.2)', opacity: i%2===0 ? 1 : 0.7 }}>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* Row 2: right */}
                    <div style={{ display:'flex', gap:0 }}>
                        <div className="marquee-r" style={{ display:'flex', gap:0, flexShrink:0, whiteSpace:'nowrap' }}>
                            {[...TICKER_ITEMS].reverse().map((item, i) => (
                                <span key={i} style={{ padding:'0 28px', color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', borderRight:'1px solid rgba(255,255,255,0.1)' }}>
                                    {item}
                                </span>
                            ))}
                        </div>
                        <div className="marquee-r" aria-hidden="true" style={{ display:'flex', gap:0, flexShrink:0, whiteSpace:'nowrap' }}>
                            {[...TICKER_ITEMS].reverse().map((item, i) => (
                                <span key={i} style={{ padding:'0 28px', color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', borderRight:'1px solid rgba(255,255,255,0.1)' }}>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════
                    § 3  STATS
                ══════════════════════════════════════════════════════ */}
                <section style={{ backgroundColor:'#1C0E07', padding:'80px 24px' }}>
                    <div style={{ maxWidth:1000, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:2 }}>
                        {[
                            { ref:ref1, val:r1,  suffix:'+',  label:'Google Reviews',    note:'37 happy students',   color:'#C1440E' },
                            { ref:ref2, val:'4.7',suffix:'★',  label:'Avg Rating',       note:'Google & Justdial',   color:'#E8A020' },
                            { ref:ref3, val:r3,  suffix:'+',  label:'Students Taught',   note:'and counting',        color:'#16a34a' },
                            { ref:ref4, val:r4,  suffix:'+',  label:'Years Experience',  note:'Expert faculty',      color:'#2563eb' },
                        ].map((s, i) => (
                            <div key={i} ref={s.ref} className="reveal" style={{ textAlign:'center', padding:'40px 20px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                <p style={{ fontFamily:'Playfair Display, serif', fontSize:'clamp(48px, 7vw, 72px)', fontWeight:900, color:s.color, lineHeight:1, marginBottom:12 }}>
                                    {s.val}{s.suffix}
                                </p>
                                <p style={{ color:'rgba(245,240,232,0.85)', fontSize:16, fontWeight:600, marginBottom:6 }}>{s.label}</p>
                                <p style={{ color:'rgba(245,240,232,0.35)', fontSize:12, letterSpacing:'0.05em' }}>{s.note}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════
                    § 4  ABOUT
                ══════════════════════════════════════════════════════ */}
                <section id="about" style={{ backgroundColor:'#F7F4EF', padding:'100px 24px' }}>
                    <div style={{ maxWidth:1100, margin:'0 auto' }}>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }} className="reveal">

                            {/* Left text */}
                            <div className="reveal-l">
                                <p style={{ color:'#C1440E', fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:16 }}>
                                    ◆ About Us
                                </p>
                                <h2 style={{ fontFamily:'Playfair Display, serif', fontSize:'clamp(32px, 5vw, 52px)', fontWeight:900, color:'#2C1810', lineHeight:1.1, marginBottom:24 }}>
                                    Where Knowledge<br/>
                                    <span style={{ color:'#C1440E', fontStyle:'italic' }}>Meets Dedication</span>
                                </h2>
                                <p style={{ color:'rgba(44,24,16,0.65)', fontSize:16, lineHeight:1.8, marginBottom:24 }}>
                                    Choksi Classes is Navsari's most trusted coaching institute — with <strong style={{ color:'#2C1810' }}>20+ years of academic excellence</strong>, we coach students from Std 1 through 12 in CBSE and GSEB, with specialized Commerce coaching for Std 11–12.
                                </p>
                                <p style={{ color:'rgba(44,24,16,0.65)', fontSize:16, lineHeight:1.8, marginBottom:32 }}>
                                    Led by <strong style={{ color:'#2C1810' }}>Dip Choksi</strong> and <strong style={{ color:'#2C1810' }}>CA Kairavi Choksi</strong> — daily tests, regular evaluations, small batches, and a 24-hour helpline ensure every student gets the attention they deserve.
                                </p>
                                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                                    {['📅 Daily Tests','📊 Regular Evaluation','👥 Small Batches','📞 24hr Helpline','📍 Union Heights, Navsari'].map((chip, i) => (
                                        <div key={i} style={{ padding:'8px 16px', borderRadius:50, backgroundColor: i < 4 ? 'rgba(193,68,14,0.08)' : 'rgba(44,24,16,0.06)', border:`1px solid ${i < 4 ? 'rgba(193,68,14,0.2)' : 'rgba(44,24,16,0.12)'}`, color: i < 4 ? '#C1440E' : 'rgba(44,24,16,0.7)', fontSize:12, fontWeight:600 }}>
                                            {chip}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: feature blocks */}
                            <div className="reveal-r" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                                {[
                                    { icon:'📚', title:'CBSE Board',       sub:'Std 1 – 10',       color:'#C1440E' },
                                    { icon:'📖', title:'GSEB Board',       sub:'Std 1 – 12',       color:'#E8A020' },
                                    { icon:'📊', title:'Commerce Stream',  sub:'Std 11 – 12',      color:'#2563eb' },
                                    { icon:'📅', title:'Daily Evaluation', sub:'All Batches',      color:'#16a34a' },
                                ].map((f, i) => (
                                    <div key={i} className="card-lift" style={{ backgroundColor:'#FFFFFF', borderRadius:20, padding:24, border:'1px solid rgba(44,24,16,0.07)', boxShadow:'0 4px 20px rgba(44,24,16,0.05)' }}>
                                        <span style={{ fontSize:28, display:'block', marginBottom:12 }}>{f.icon}</span>
                                        <p style={{ fontWeight:700, color:'#2C1810', fontSize:15, marginBottom:4 }}>{f.title}</p>
                                        <p style={{ color:f.color, fontSize:12, fontWeight:600 }}>{f.sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════
                    § 5  COURSES
                ══════════════════════════════════════════════════════ */}
                <section style={{ backgroundColor:'#FFFFFF', padding:'100px 24px' }}>
                    <div style={{ maxWidth:1100, margin:'0 auto' }}>
                        <div style={{ textAlign:'center', marginBottom:64 }} className="reveal">
                            <p style={{ color:'#C1440E', fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:14 }}>Our Courses</p>
                            <h2 style={{ fontFamily:'Playfair Display, serif', fontSize:'clamp(32px, 5vw, 52px)', fontWeight:900, color:'#2C1810' }}>
                                A Course For <span style={{ color:'#C1440E', fontStyle:'italic' }}>Every Student</span>
                            </h2>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:24 }}>
                            {COURSES.map((c, i) => (
                                <div key={i} className={`card-lift reveal delay-${i+1}`}
                                    style={{ borderRadius:24, padding:36, border:`1px solid rgba(44,24,16,0.07)`, backgroundColor:'#FAFAF8', boxShadow:'0 4px 20px rgba(44,24,16,0.06)' }}>
                                    <div style={{ width:52, height:52, borderRadius:16, backgroundColor:c.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24 }}>
                                        <c.icon size={24} color={c.color}/>
                                    </div>
                                    <p style={{ fontFamily:'Playfair Display, serif', fontSize:22, fontWeight:700, color:'#2C1810', marginBottom:6 }}>{c.title}</p>
                                    <p style={{ color:c.color, fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:16 }}>{c.sub}</p>
                                    <p style={{ color:'rgba(44,24,16,0.6)', fontSize:14, lineHeight:1.7 }}>{c.desc}</p>
                                    <div style={{ marginTop:28, height:3, borderRadius:2, backgroundColor:c.bg, overflow:'hidden' }}>
                                        <div style={{ width:'100%', height:'100%', backgroundColor:c.color, transform:'translateX(-100%)', transition:'transform 1s ease .3s' }}
                                            ref={el => { if (el) { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.style.transform='translateX(0)'; }); obs.observe(el); }}} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════
                    § 6  TESTIMONIALS — dark, dramatic
                ══════════════════════════════════════════════════════ */}
                <section style={{ backgroundColor:'#1C0E07', padding:'100px 0', overflow:'hidden' }}>
                    <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>
                        <div style={{ textAlign:'center', marginBottom:64 }} className="reveal">
                            <p style={{ color:'#C1440E', fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:14 }}>Reviews</p>
                            <h2 style={{ fontFamily:'Playfair Display, serif', fontSize:'clamp(32px, 5vw, 52px)', fontWeight:900, color:'#F5F0E8' }}>
                                What Students<br/>
                                <span className="shiny-text">Are Saying</span>
                            </h2>
                        </div>
                    </div>
                    {/* horizontal scroll track */}
                    <div style={{ display:'flex', gap:24, paddingLeft:24, paddingRight:24, overflowX:'auto', scrollbarWidth:'none', paddingBottom:12 }}>
                        {REVIEWS.map((r, i) => (
                            <div key={i} className="card-lift glass-card"
                                style={{ flexShrink:0, width:320, borderRadius:24, padding:32, cursor:'default' }}>
                                <Quote size={28} color="rgba(193,68,14,0.4)" style={{ marginBottom:20 }}/>
                                <p style={{ color:'rgba(245,240,232,0.8)', fontSize:15, lineHeight:1.75, marginBottom:28, fontStyle:'italic' }}>
                                    "{r.text}"
                                </p>
                                <div style={{ display:'flex', gap:3, marginBottom:16 }}>
                                    {[...Array(r.stars)].map((_, s) => (
                                        <Star key={s} size={13} fill="#E8A020" color="#E8A020"/>
                                    ))}
                                </div>
                                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                                    <div style={{ width:40, height:40, borderRadius:'50%', backgroundColor:'#C1440E', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:16, flexShrink:0 }}>
                                        {r.initial}
                                    </div>
                                    <div>
                                        <p style={{ color:'#F5F0E8', fontWeight:700, fontSize:14 }}>{r.name}</p>
                                        <p style={{ color:'rgba(245,240,232,0.4)', fontSize:11 }}>{r.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════
                    § 7  BIG CTA SECTION
                ══════════════════════════════════════════════════════ */}
                <section style={{ backgroundColor:'#C1440E', padding:'100px 24px', position:'relative', overflow:'hidden' }}>
                    {/* decorative circles */}
                    <div style={{ position:'absolute', top:'-30%', right:'-10%', width:500, height:500, borderRadius:'50%', backgroundColor:'rgba(255,255,255,0.07)', pointerEvents:'none' }}/>
                    <div style={{ position:'absolute', bottom:'-40%', left:'-8%', width:400, height:400, borderRadius:'50%', backgroundColor:'rgba(44,24,16,0.2)', pointerEvents:'none' }}/>
                    <div style={{ maxWidth:700, margin:'0 auto', textAlign:'center', position:'relative', zIndex:2 }} className="reveal">
                        <Award size={48} color="rgba(255,255,255,0.3)" style={{ margin:'0 auto 24px' }}/>
                        <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:50, backgroundColor:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', marginBottom:20 }}>
                            <span style={{ color:'#fff', fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>🎓 Admissions Open</span>
                        </div>
                        <h2 style={{ fontFamily:'Playfair Display, serif', fontSize:'clamp(32px, 6vw, 60px)', fontWeight:900, color:'#FFFFFF', marginBottom:20, lineHeight:1.1 }}>
                            Enroll Your Child<br/>in the Best Class
                        </h2>
                        <p style={{ color:'rgba(255,255,255,0.75)', fontSize:17, lineHeight:1.7, marginBottom:44 }}>
                            Std 1–10 (CBSE & GSEB) · Std 11–12 Commerce (CBSE & GSEB) — with daily tests, small batches, and a 24-hour helpline for parents. 20+ years of proven results.
                        </p>
                        <button onClick={() => navigate('/login')}
                            style={{ padding:'18px 48px', borderRadius:18, backgroundColor:'#FFFFFF', color:'#C1440E', fontSize:16, fontWeight:800, border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:10, boxShadow:'0 8px 40px rgba(44,24,16,0.3)', transition:'transform .2s ease, box-shadow .2s ease' }}
                            onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 16px 50px rgba(44,24,16,0.4)'; }}
                            onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 40px rgba(44,24,16,0.3)'; }}>
                            Login to Portal <ArrowRight size={18}/>
                        </button>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════
                    § 8  CONTACT
                ══════════════════════════════════════════════════════ */}
                <section style={{ backgroundColor:'#F7F4EF', padding:'80px 24px' }}>
                    <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:24 }}>
                        {[
                            { icon: MapPin,  title:'Our Location',    lines:['304/5/6/7, Union Heights', 'Ashanagar, Navsari', 'Gujarat – 396445'], action: 'https://maps.google.com/?q=Union+Heights+Ashanagar+Navsari', actionText:'Get Directions →', color:'#C1440E' },
                            { icon: Phone,   title:'Dip Choksi',      lines:['Director & Head Faculty', '+91 82382 16622', '24hr query helpline'], action:'tel:+918238216622', actionText:'Call Now →', color:'#16a34a' },
                            { icon: Phone,   title:'CA Kairavi Choksi',lines:['Commerce Faculty (CA)', '+91 97260 19001', 'kairavichoksi@yahoo.com'], action:'tel:+919726019001', actionText:'Call Now →', color:'#2563eb' },
                            { icon: Award,   title:'Rating & Reviews', lines:['4.7★ Google (37 reviews)', '4.6★ Justdial (38 votes)', '5★ Facebook'], action:'https://maps.google.com/?q=Choksi+Classes+Navsari', actionText:'Read Reviews →', color:'#E8A020' },
                        ].map((c, i) => (
                            <div key={i} className={`reveal delay-${i+1}`}
                                style={{ backgroundColor:'#FFFFFF', borderRadius:24, padding:36, border:'1px solid rgba(44,24,16,0.07)', boxShadow:'0 4px 20px rgba(44,24,16,0.05)' }}>
                                <div style={{ width:48, height:48, borderRadius:14, backgroundColor:`${c.color}18`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                                    <c.icon size={22} color={c.color}/>
                                </div>
                                <p style={{ fontFamily:'Playfair Display, serif', fontWeight:700, color:'#2C1810', fontSize:18, marginBottom:14 }}>{c.title}</p>
                                {c.lines.map((l, li) => (
                                    <p key={li} style={{ color:'rgba(44,24,16,0.6)', fontSize:14, lineHeight:1.9 }}>{l}</p>
                                ))}
                                <a href={c.action} target="_blank" rel="noopener noreferrer"
                                    style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:20, color:c.color, fontSize:13, fontWeight:700, textDecoration:'none' }}>
                                    {c.actionText}
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════
                    § 9  GOOGLE MAPS
                ══════════════════════════════════════════════════════ */}
                <section style={{ backgroundColor:'#F7F4EF', padding:'0 24px 80px' }}>
                    <div style={{ maxWidth:1100, margin:'0 auto' }}>
                        <div style={{ borderRadius:24, overflow:'hidden', border:'1px solid rgba(44,24,16,0.08)', boxShadow:'0 8px 32px rgba(44,24,16,0.08)' }}>
                            <iframe
                                title="Choksi Classes Location"
                                src="https://maps.google.com/maps?q=20.9503,72.9267&hl=en&z=16&output=embed"
                                width="100%" height="320" style={{ border:0, display:'block' }}
                                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
                        </div>
                        <div style={{ marginTop:16, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                            <MapPin size={14} color="#C1440E"/>
                            <span style={{ color:'rgba(44,24,16,0.65)', fontSize:13 }}>304/5/6/7, Union Heights, Ashanagar, Navsari, Gujarat 396445</span>
                            <a href="https://maps.google.com/?q=Union+Heights+Ashanagar+Navsari+Gujarat" target="_blank" rel="noopener noreferrer"
                                style={{ color:'#C1440E', fontSize:12, fontWeight:700, textDecoration:'none', marginLeft:4 }}>Open in Maps →</a>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════
                    § 10  FOOTER
                ══════════════════════════════════════════════════════ */}
                <footer style={{ backgroundColor:'#140A05', padding:'48px 24px 32px', borderTop:'1px solid rgba(193,68,14,0.15)' }}>
                    <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:24 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:10, backgroundColor:'rgba(193,68,14,0.3)', border:'1px solid rgba(193,68,14,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <span style={{ fontFamily:'Playfair Display, serif', color:'#F5F0E8', fontWeight:700, fontSize:16 }}>C</span>
                            </div>
                            <div>
                                <p style={{ fontFamily:'Playfair Display, serif', color:'#F5F0E8', fontWeight:700, fontSize:15 }}>Choksi Classes</p>
                                <p style={{ color:'rgba(245,240,232,0.35)', fontSize:11 }}>Navsari, Gujarat · Est. 2018</p>
                            </div>
                        </div>
                        <div style={{ display:'flex', gap:8 }}>
                            {[...Array(5)].map((_,s) => (
                                <Star key={s} size={14} fill="#E8A020" color="#E8A020"/>
                            ))}
                            <span style={{ color:'rgba(245,240,232,0.5)', fontSize:13, marginLeft:8 }}>4.7 · 37 Reviews</span>
                        </div>
                        <p style={{ color:'rgba(245,240,232,0.3)', fontSize:12 }}>
                            CBSE · GSEB · Std 1–10 · Commerce 11–12
                        </p>
                    </div>
                    <div style={{ maxWidth:1100, margin:'24px auto 0', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:28, display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                        {/* Student credit — with pride */}
                        <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'10px 22px', borderRadius:50, backgroundColor:'rgba(193,68,14,0.12)', border:'1px solid rgba(193,68,14,0.2)' }}>
                            <span style={{ fontSize:15 }}>🎓</span>
                            <p style={{ color:'rgba(245,240,232,0.65)', fontSize:13, fontWeight:500 }}>
                                Designed &amp; built with{' '}
                                <span style={{ color:'#C1440E', fontWeight:700 }}>❤️</span>
                                {' '}by a{' '}
                                <span style={{ color:'rgba(245,240,232,0.9)', fontWeight:600 }}>proud student of Choksi Classes</span>
                            </p>
                        </div>
                        <p style={{ color:'rgba(245,240,232,0.18)', fontSize:11 }}>
                            © {new Date().getFullYear()} Choksi Classes, Navsari · All rights reserved
                        </p>
                    </div>
                </footer>

            </div>

            {/* ══ FLOATING WHATSAPP BUTTON ══════════════════════════════ */}
            <a href="https://wa.me/918238216622?text=Hi%2C%20I%20want%20to%20enquire%20about%20admissions%20at%20Choksi%20Classes."
                target="_blank" rel="noopener noreferrer"
                style={{
                    position:'fixed', bottom:24, right:20, zIndex:999,
                    width:56, height:56, borderRadius:'50%',
                    backgroundColor:'#25D366',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:'0 4px 20px rgba(37,211,102,0.5)',
                    textDecoration:'none', transition:'transform .2s ease, box-shadow .2s ease',
                }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.boxShadow='0 6px 28px rgba(37,211,102,0.65)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(37,211,102,0.5)'; }}>
                <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
                    <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.678 4.61 1.854 6.5L4 29l7.75-1.832A11.94 11.94 0 0016 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm6.08 16.5c-.253.713-1.497 1.36-2.048 1.428-.523.065-1.188.092-1.916-.12a17.56 17.56 0 01-1.734-.643C14.035 19.085 12.17 17.2 11.4 15.8c-.398-.706-.414-1.32-.257-1.758.157-.437.525-.636.787-.664l.56-.013c.19-.004.44.071.686.54l.82 1.73c.08.17.04.37-.09.52l-.37.43c-.12.14-.13.32-.03.46.32.48.89 1.16 1.48 1.7.64.59 1.38 1.07 1.9 1.29.16.07.34.04.46-.08l.38-.42c.13-.14.31-.2.49-.16l1.8.43c.42.1.67.35.67.67v.5z"/>
                </svg>
            </a>

            {/* ══ ADMISSIONS FLOATING CTA (mobile) ═════════════════════ */}
            <a href="/admissions"
                style={{
                    position:'fixed', bottom:90, right:20, zIndex:998,
                    padding:'10px 18px', borderRadius:50,
                    backgroundColor:'#C1440E',
                    display:'flex', alignItems:'center', gap:7,
                    boxShadow:'0 4px 16px rgba(193,68,14,0.45)',
                    textDecoration:'none', transition:'transform .2s ease',
                }}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                <span style={{ color:'#fff', fontSize:13, fontWeight:700, whiteSpace:'nowrap' }}>🎓 Enquire Now</span>
            </a>
        </>
    );
}
