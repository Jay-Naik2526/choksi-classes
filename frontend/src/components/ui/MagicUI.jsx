/**
 * MagicUI.jsx  ──  21st.dev-inspired reusable components
 * Framer-Motion powered. Drop any of these into any page.
 */
import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

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
