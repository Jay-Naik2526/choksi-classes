/**
 * MagicUI.jsx  ──  21st.dev-inspired reusable components
 * Framer-Motion powered. Drop any of these into any page.
 */
import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useSpring, useMotionValue, useTransform, useScroll, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────
   SPOTLIGHT CARD
   A card that shows a radial gradient "spotlight" following the cursor.
   Usage:  <SpotlightCard style={…}>…</SpotlightCard>
───────────────────────────────────────────────────────────────────────── */
export function SpotlightCard({ children, style = {}, spotColor = 'rgba(193,68,14,0.13)', className = '' }) {
    const cardRef = useRef(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            className={className}
            style={{ position: 'relative', overflow: 'hidden', ...style }}
        >
            {/* spotlight layer */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
                background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, ${spotColor} 0%, transparent 70%)`,
                opacity,
                transition: 'opacity 0.3s ease',
                borderRadius: 'inherit',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   BORDER BEAM
   An animated gradient conic sweep around the border.
   Place it as an absolute child inside a relative container.
───────────────────────────────────────────────────────────────────────── */
export function BorderBeam({ colorA = '#C1440E', colorB = '#E8A020', size = 200, duration = 4 }) {
    return (
        <div style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit',
            overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
        }}>
            <style>{`
                @keyframes beamRotate { from { --beam-angle: 0deg; } to { --beam-angle: 360deg; } }
                @property --beam-angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
            `}</style>
            <motion.div
                style={{
                    position: 'absolute', inset: -1,
                    borderRadius: 'inherit',
                    padding: 1.5,
                    background: `conic-gradient(from var(--beam-angle,0deg), transparent 0%, ${colorA} 15%, ${colorB} 30%, transparent 50%)`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    animation: `beamRotate ${duration}s linear infinite`,
                }}
            />
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   SHIMMER BUTTON
   A button with a sweeping shimmer highlight animation.
───────────────────────────────────────────────────────────────────────── */
export function ShimmerButton({ children, onClick, style = {}, disabled = false }) {
    return (
        <>
            <style>{`
                @keyframes shimmerBtn {
                    0%   { transform: translateX(-120%) skewX(-10deg); }
                    100% { transform: translateX(220%)  skewX(-10deg); }
                }
            `}</style>
            <motion.button
                onClick={onClick}
                disabled={disabled}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                    position: 'relative', overflow: 'hidden', cursor: disabled ? 'not-allowed' : 'pointer',
                    border: 'none', ...style,
                }}
            >
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.18) 50%,transparent 100%)',
                    animation: 'shimmerBtn 2.4s ease infinite',
                    pointerEvents: 'none',
                }} />
                <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>
            </motion.button>
        </>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAGNETIC BUTTON
   A button that subtly moves toward the cursor (magnetic pull effect).
───────────────────────────────────────────────────────────────────────── */
export function MagneticButton({ children, onClick, style = {}, strength = 0.4 }) {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 200, damping: 20 });
    const sy = useSpring(y, { stiffness: 200, damping: 20 });

    const handleMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x.set((e.clientX - cx) * strength);
        y.set((e.clientY - cy) * strength);
    };
    const reset = () => { x.set(0); y.set(0); };

    return (
        <motion.button
            ref={ref}
            style={{ x: sx, y: sy, cursor: 'pointer', border: 'none', ...style }}
            onMouseMove={handleMove}
            onMouseLeave={reset}
            onClick={onClick}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </motion.button>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   NUMBER TICKER
   Animated count-up using framer-motion spring.
───────────────────────────────────────────────────────────────────────── */
export function NumberTicker({ value, decimals = 0, suffix = '', style = {} }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    const motionVal = useMotionValue(0);
    const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
    const [display, setDisplay] = useState('0');

    useEffect(() => {
        if (inView) motionVal.set(value);
    }, [inView, value]);

    useEffect(() => spring.on('change', (v) => {
        setDisplay(decimals > 0 ? v.toFixed(decimals) : Math.floor(v).toString());
    }), [spring]);

    return (
        <span ref={ref} style={style}>
            {display}{suffix}
        </span>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   WORD ROTATE
   Cycles through words with a slide-up / slide-down animation.
───────────────────────────────────────────────────────────────────────── */
export function WordRotate({ words = [], interval = 2500, style = {} }) {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setIdx(i => (i + 1) % words.length), interval);
        return () => clearInterval(t);
    }, [words, interval]);

    return (
        <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', ...style }}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={idx}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                    style={{ display: 'inline-block' }}
                >
                    {words[idx]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   TILT CARD
   Wraps children with a 3-D perspective tilt on mouse move.
───────────────────────────────────────────────────────────────────────── */
export function TiltCard({ children, style = {}, maxTilt = 12 }) {
    const ref = useRef(null);
    const rotX = useMotionValue(0);
    const rotY = useMotionValue(0);
    const sRotX = useSpring(rotX, { stiffness: 180, damping: 25 });
    const sRotY = useSpring(rotY, { stiffness: 180, damping: 25 });

    const handleMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 → 0.5
        const ny = (e.clientY - rect.top)  / rect.height - 0.5;
        rotX.set(-ny * maxTilt);
        rotY.set(nx * maxTilt);
    };
    const reset = () => { rotX.set(0); rotY.set(0); };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={reset}
            style={{ rotateX: sRotX, rotateY: sRotY, transformStyle: 'preserve-3d', perspective: 800, ...style }}
        >
            {children}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   GLOW CARD
   Card with a coloured drop-shadow that pulses on hover.
───────────────────────────────────────────────────────────────────────── */
export function GlowCard({ children, glowColor = 'rgba(193,68,14,0.35)', style = {} }) {
    return (
        <motion.div
            whileHover={{ boxShadow: `0 0 40px 0 ${glowColor}, 0 16px 40px rgba(0,0,0,0.2)`, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            style={{ ...style }}
        >
            {children}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   STAGGER CONTAINER + ITEM  (framer-motion variants)
   Usage:
     <StaggerContainer>
       <StaggerItem>…</StaggerItem>
     </StaggerContainer>
───────────────────────────────────────────────────────────────────────── */
export const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
export const staggerItem = {
    hidden: { opacity: 0, y: 28 },
    show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

export function StaggerContainer({ children, style = {}, className = '' }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div
            ref={ref}
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            style={style}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, style = {}, className = '' }) {
    return (
        <motion.div variants={staggerItem} style={style} className={className}>
            {children}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   FADE UP  (single element fade+slide on scroll into view)
───────────────────────────────────────────────────────────────────────── */
export function FadeUp({ children, delay = 0, style = {} }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26, delay }}
            style={style}
        >
            {children}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   AURORA BACKGROUND  (animated multi-color gradient)
   Place as absolute fill behind hero content.
───────────────────────────────────────────────────────────────────────── */
export function AuroraBackground({ colors = ['#C1440E','#E8A020','#2C1810'], opacity = 0.18 }) {
    return (
        <>
            <style>{`
                @keyframes aurora1 { 0%,100%{ transform:translate(0,0) scale(1);   } 33%{ transform:translate(4%,3%)  scale(1.06); } 66%{ transform:translate(-3%,5%) scale(.95); } }
                @keyframes aurora2 { 0%,100%{ transform:translate(0,0) scale(1);   } 40%{ transform:translate(-5%,-3%) scale(1.08); } 70%{ transform:translate(4%,-4%) scale(.97); } }
                @keyframes aurora3 { 0%,100%{ transform:translate(0,0) scale(1);   } 50%{ transform:translate(3%,-5%) scale(1.04); } }
            `}</style>
            {/* blob 1 */}
            <div style={{
                position:'absolute', top:'-20%', left:'-15%', width:'70vw', height:'70vw',
                borderRadius:'50%', background:`radial-gradient(circle, ${colors[0]} 0%, transparent 65%)`,
                opacity, pointerEvents:'none', animation:'aurora1 14s ease-in-out infinite',
            }}/>
            {/* blob 2 */}
            <div style={{
                position:'absolute', bottom:'-25%', right:'-20%', width:'65vw', height:'65vw',
                borderRadius:'50%', background:`radial-gradient(circle, ${colors[1]} 0%, transparent 65%)`,
                opacity: opacity*0.7, pointerEvents:'none', animation:'aurora2 18s ease-in-out infinite',
            }}/>
            {/* blob 3 */}
            <div style={{
                position:'absolute', top:'40%', left:'30%', width:'40vw', height:'40vw',
                borderRadius:'50%', background:`radial-gradient(circle, ${colors[2]} 0%, transparent 65%)`,
                opacity: opacity*0.5, pointerEvents:'none', animation:'aurora3 22s ease-in-out infinite',
            }}/>
        </>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   DOT GRID BACKGROUND
   Subtle polka-dot pattern overlay.
───────────────────────────────────────────────────────────────────────── */
export function DotGrid({ color = 'rgba(193,68,14,0.12)', size = 28 }) {
    return (
        <div style={{
            position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
            backgroundImage:`radial-gradient(circle, ${color} 1px, transparent 1px)`,
            backgroundSize:`${size}px ${size}px`,
        }}/>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   NOISE TEXTURE OVERLAY  (grain effect on cards/sections)
───────────────────────────────────────────────────────────────────────── */
export function NoiseOverlay({ opacity = 0.03 }) {
    return (
        <div style={{
            position:'absolute', inset:0, pointerEvents:'none', zIndex:10,
            opacity,
            backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize:'128px 128px',
        }}/>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   ANIMATED GRADIENT TEXT
───────────────────────────────────────────────────────────────────────── */
export function GradientText({ children, style = {}, colors = ['#C1440E','#E8A020','#F5D080','#E8A020','#C1440E'] }) {
    return (
        <>
            <style>{`
                @keyframes gradientShift {
                    0%  { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100%{ background-position: 0% 50%; }
                }
            `}</style>
            <span style={{
                background: `linear-gradient(90deg, ${colors.join(',')})`,
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradientShift 4s ease infinite',
                display: 'inline',
                ...style,
            }}>
                {children}
            </span>
        </>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE TRANSITION WRAPPER
   Wrap any page with this for a smooth fade+slide entrance.
───────────────────────────────────────────────────────────────────────── */
export function PageTransition({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   RETRO GRID
   Perspective vanishing-point grid — signature 21st.dev hero decoration.
   Place as absolute fill at the bottom of any dark section.
───────────────────────────────────────────────────────────────────────── */
export function RetroGrid({ opacity = 0.38, bgColor = '#0D0603', lineColor = 'rgba(193,68,14,' }) {
    return (
        <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '52%', overflow: 'hidden', pointerEvents: 'none', zIndex: 1,
            perspective: '280px',
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                transform: 'rotateX(68deg)',
                transformOrigin: 'top center',
                backgroundImage: `
                    linear-gradient(to right, ${lineColor}${opacity}) 1px, transparent 1px),
                    linear-gradient(to bottom, ${lineColor}${opacity * 0.55}) 1px, transparent 1px)
                `,
                backgroundSize: '56px 36px',
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(to top, transparent 20%, ${bgColor} 82%)`,
                }} />
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   METEORS
   Shooting-star streaks that fly diagonally across dark backgrounds.
───────────────────────────────────────────────────────────────────────── */
const METEOR_DATA = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    top:      `${(i * 11 + 5) % 88}%`,
    left:     `${(i * 17 + 3) % 115}%`,
    delay:    `${(i * 0.45) % 6}s`,
    duration: `${2.8 + (i % 4) * 0.6}s`,
    width:    90 + (i % 3) * 55,
}));

export function Meteors({ count = 20, color = 'rgba(255,255,255,0.55)' }) {
    const meteors = METEOR_DATA.slice(0, count);
    return (
        <>
            <style>{`
                @keyframes meteorFall {
                    0%   { transform: rotate(215deg) translateX(0);      opacity: 0; }
                    6%   { opacity: 1; }
                    78%  { opacity: 1; }
                    100% { transform: rotate(215deg) translateX(-600px); opacity: 0; }
                }
            `}</style>
            {meteors.map(m => (
                <span key={m.id} style={{
                    position: 'absolute', top: m.top, left: m.left,
                    width: m.width, height: 1.5, borderRadius: 9999,
                    background: `linear-gradient(to right, transparent, ${color})`,
                    animation: `meteorFall ${m.duration} linear ${m.delay} infinite`,
                    pointerEvents: 'none', zIndex: 1,
                }} />
            ))}
        </>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   LETTER REVEAL
   Animates each character individually into view on scroll.
───────────────────────────────────────────────────────────────────────── */
export function LetterReveal({ children, delay = 0, style = {} }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });
    const letters = String(children).split('');
    return (
        <span ref={ref} style={{ display: 'inline', ...style }}>
            {letters.map((ch, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 18 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: delay + i * 0.028, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: 'inline-block' }}
                >
                    {ch === ' ' ? ' ' : ch}
                </motion.span>
            ))}
        </span>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   FLIP CARD
   3-D card that flips on hover to reveal a back face.
───────────────────────────────────────────────────────────────────────── */
export function FlipCard({ front, back, height = 220, style = {} }) {
    const [flipped, setFlipped] = useState(false);
    return (
        <div
            onMouseEnter={() => setFlipped(true)}
            onMouseLeave={() => setFlipped(false)}
            style={{ perspective: 1200, cursor: 'pointer', ...style, height }}
        >
            <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
            >
                {/* front */}
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                    {front}
                </div>
                {/* back */}
                <div style={{ position: 'absolute', inset: 0, transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                    {back}
                </div>
            </motion.div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   RIPPLE BUTTON
   Click anywhere → expanding ripple wave from that point.
───────────────────────────────────────────────────────────────────────── */
export function RippleButton({ children, onClick, style = {}, disabled = false }) {
    const [ripples, setRipples] = useState([]);
    const handleClick = (e) => {
        if (disabled) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const id = Date.now() + Math.random();
        setRipples(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800);
        onClick?.(e);
    };
    return (
        <button onClick={handleClick} disabled={disabled}
            style={{ position: 'relative', overflow: 'hidden', cursor: disabled ? 'not-allowed' : 'pointer', border: 'none', ...style }}>
            {children}
            {ripples.map(r => (
                <motion.span key={r.id}
                    initial={{ scale: 0, opacity: 0.45 }}
                    animate={{ scale: 5, opacity: 0 }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}
                    style={{
                        position: 'absolute', left: r.x, top: r.y,
                        width: 60, height: 60, marginLeft: -30, marginTop: -30,
                        borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.35)',
                        pointerEvents: 'none',
                    }}
                />
            ))}
        </button>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   ANIMATED BADGE
   Pulsing badge with a sweeping shimmer — great for "NEW" / "FIRST" claims.
───────────────────────────────────────────────────────────────────────── */
export function AnimatedBadge({ children, color = '#E8A020', style = {} }) {
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
            <div style={{
                position: 'relative', overflow: 'hidden',
                padding: '7px 18px', borderRadius: 50,
                backgroundColor: `${color}18`, border: `1.5px solid ${color}45`,
                display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
                <motion.div
                    animate={{ x: ['-100%', '220%'] }}
                    transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut', repeatDelay: 1.8 }}
                    style={{
                        position: 'absolute', top: 0, bottom: 0, width: '55%',
                        background: `linear-gradient(90deg, transparent, ${color}38, transparent)`,
                        pointerEvents: 'none',
                    }}
                />
                <motion.div
                    animate={{ scale: [1, 1.7, 1], opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.9 }}
                    style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }}
                />
                <span style={{ color, fontWeight: 700, fontSize: 11, letterSpacing: '0.13em', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
                    {children}
                </span>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   SCROLL TEXT
   Each word lights up from dim → bright as you scroll past it.
───────────────────────────────────────────────────────────────────────── */
function ScrollWord({ word, progress, start, end }) {
    const opacity = useTransform(progress, [start, Math.min(end, 1)], [0.16, 1]);
    return <motion.span style={{ opacity, display: 'inline-block' }}>{word}&nbsp;</motion.span>;
}

export function ScrollText({ children, style = {} }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.88', 'end 0.22'] });
    const words = String(children).split(' ');
    return (
        <p ref={ref} style={{ display: 'flex', flexWrap: 'wrap', gap: 0, ...style }}>
            {words.map((word, i) => (
                <ScrollWord
                    key={i} word={word} progress={scrollYProgress}
                    start={i / words.length}
                    end={(i + 2.2) / words.length}
                />
            ))}
        </p>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   ANIMATED BEAM LINE
   Glowing laser line that sweeps left → right — connects steps / icons.
───────────────────────────────────────────────────────────────────────── */
export function BeamLine({ color = '#C1440E', style = {} }) {
    return (
        <div style={{ flex: 1, height: 2, position: 'relative', overflow: 'hidden',
            backgroundColor: `${color}18`, borderRadius: 2, ...style }}>
            <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'linear', repeatDelay: 0.6 }}
                style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                }}
            />
        </div>
    );
}
