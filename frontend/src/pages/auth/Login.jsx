import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';

const roles = ['Sir', 'Student', 'Parent'];

// ── Decorative left panel — pure CSS, no image needed ──────────────────────
function ArtPanel() {
    return (
        <div className="relative w-full h-full overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #3D1F0D 0%, #6B3318 35%, #A0522D 65%, #C8763A 100%)' }}>

            {/* Ambient light blob (top-right warm glow) */}
            <div className="absolute"
                style={{
                    top: '-60px', right: '-60px',
                    width: 300, height: 300,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(232,160,32,0.35) 0%, transparent 70%)',
                }}/>

            {/* Ambient light blob (bottom-left) */}
            <div className="absolute"
                style={{
                    bottom: '-40px', left: '-40px',
                    width: 220, height: 220,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(193,68,14,0.3) 0%, transparent 70%)',
                }}/>

            {/* Window frame — vertical wooden slats */}
            <div className="absolute inset-0 flex items-center justify-center opacity-15">
                <div className="flex gap-5" style={{ transform: 'rotate(-3deg) scale(1.3)', marginTop: '-80px' }}>
                    {[...Array(7)].map((_, i) => (
                        <div key={i} style={{
                            width: 18, height: 320,
                            backgroundColor: '#C8763A',
                            borderRadius: 4,
                            opacity: 0.7 + (i % 3) * 0.1,
                        }}/>
                    ))}
                </div>
            </div>

            {/* Horizontal slats (window bars) */}
            <div className="absolute inset-0 flex flex-col justify-center gap-10 opacity-10"
                style={{ marginTop: '-60px' }}>
                {[...Array(5)].map((_, i) => (
                    <div key={i} style={{
                        height: 10, backgroundColor: '#C8763A',
                        borderRadius: 4, marginLeft: '10%', marginRight: '10%',
                    }}/>
                ))}
            </div>

            {/* Stack of books at bottom */}
            <div className="absolute" style={{ bottom: 80, left: '12%' }}>
                {[
                    { w: 100, h: 18, color: '#C1440E',  tilt:  2 },
                    { w: 88,  h: 16, color: '#E8A020',  tilt: -1 },
                    { w: 112, h: 18, color: '#F5F0E8',  tilt:  1 },
                    { w: 96,  h: 14, color: '#8B4513',  tilt:  0 },
                ].map((b, i) => (
                    <div key={i} style={{
                        width: b.w, height: b.h,
                        backgroundColor: b.color,
                        borderRadius: 3,
                        transform: `rotate(${b.tilt}deg)`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        marginBottom: 3,
                        opacity: 0.85,
                    }}/>
                ))}
                {/* Book spine lines */}
                {[0,1,2].map(i => (
                    <div key={`s${i}`} className="absolute"
                        style={{
                            width: 2, height: 18,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            left: 20 + i * 18, bottom: 14 + 17,
                        }}/>
                ))}
            </div>

            {/* Tea cup silhouette */}
            <div className="absolute" style={{ bottom: 68, right: '15%' }}>
                {/* Steam wisps */}
                {[0,1,2].map(i => (
                    <div key={i} className="absolute"
                        style={{
                            width: 3, height: 20,
                            backgroundColor: 'rgba(245,240,232,0.25)',
                            borderRadius: 2,
                            left: 12 + i * 9,
                            bottom: 42,
                            animation: `none`,
                            transform: `rotate(${(i - 1) * 8}deg)`,
                        }}/>
                ))}
                {/* Cup body */}
                <div style={{
                    width: 44, height: 32,
                    backgroundColor: '#E8A020',
                    borderRadius: '4px 4px 12px 12px',
                    opacity: 0.7,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}/>
                {/* Cup handle */}
                <div style={{
                    position: 'absolute',
                    right: -12, top: 6,
                    width: 14, height: 18,
                    border: '4px solid rgba(232,160,32,0.6)',
                    borderRadius: '0 8px 8px 0',
                }}/>
                {/* Saucer */}
                <div style={{
                    width: 56, height: 8,
                    backgroundColor: '#C8763A',
                    borderRadius: 6,
                    marginLeft: -6, marginTop: 2,
                    opacity: 0.65,
                }}/>
            </div>

            {/* Text content */}
            <div className="absolute inset-0 flex flex-col justify-between p-10">
                {/* Top: logo */}
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(193,68,14,0.5)', border: '1px solid rgba(193,68,14,0.4)' }}>
                            <span style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8', fontWeight: 700, fontSize: 16 }}>C</span>
                        </div>
                        <span style={{ fontFamily: 'Playfair Display, serif', color: 'rgba(245,240,232,0.9)', fontWeight: 700, fontSize: 18 }}>
                            Choksi Classes
                        </span>
                    </div>
                    <div style={{ width: 36, height: 2.5, backgroundColor: '#C1440E', borderRadius: 2, marginTop: 6, marginLeft: 40 }}/>
                </div>

                {/* Middle: headline */}
                <div>
                    <h2 className="text-4xl font-bold leading-tight mb-4"
                        style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8' }}>
                        Igniting Minds<br />through<br />Knowledge
                    </h2>
                    <div style={{ width: 40, height: 3, backgroundColor: '#C1440E', borderRadius: 2, marginBottom: 16 }}/>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,232,0.65)', maxWidth: 260 }}>
                        Embark on a journey of disciplined learning and growth, where traditions meet modern academic excellence.
                    </p>
                </div>

                {/* Bottom: stats */}
                <div className="flex gap-6">
                    {[['100+', 'Students'], ['10+', 'Subjects'], ['5+', 'Years']].map(([n, l]) => (
                        <div key={l}>
                            <p className="text-xl font-bold" style={{ color: '#E8A020' }}>{n}</p>
                            <p style={{ fontSize: '11px', color: 'rgba(245,240,232,0.5)', marginTop: 2 }}>{l}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Login() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const [role,    setRole]    = useState('Student');
    const [form,    setForm]    = useState({ email: '', password: '' });
    const [showPw,  setShowPw]  = useState(false);
    const [error,   setError]   = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await api.post('/auth/login', { ...form, role: role.toLowerCase() });
            setAuth(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: '#F7F4EF' }}>

            {/* ── Left art panel (hidden on small screens) ─────────── */}
            <div className="hidden lg:block lg:w-[45%] flex-shrink-0" style={{ minHeight: '100vh' }}>
                <ArtPanel />
            </div>

            {/* ── Right: login form ─────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12"
                style={{ backgroundColor: '#F7F4EF' }}>
                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-2xl font-bold"
                            style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                            Choksi Classes
                        </h1>
                        <div style={{ width: 36, height: 2.5, backgroundColor: '#C1440E', borderRadius: 2, margin: '6px auto 0' }}/>
                    </div>

                    {/* Card */}
                    <div className="rounded-3xl p-8"
                        style={{ backgroundColor: '#FFFFFF', boxShadow: '0 8px 48px rgba(44,24,16,0.1)', border: '1px solid rgba(44,24,16,0.06)' }}>

                        {/* Desktop logo inside card */}
                        <div className="hidden lg:flex items-center gap-2 mb-6">
                            <span className="text-xl font-bold"
                                style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                                Choksi Classes
                            </span>
                            <div style={{ width: 28, height: 2.5, backgroundColor: '#C1440E', borderRadius: 2, alignSelf: 'flex-end', marginBottom: 4 }}/>
                        </div>

                        <h2 className="text-2xl font-bold mb-1"
                            style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                            Welcome Back
                        </h2>
                        <p className="text-sm mb-6" style={{ color: 'rgba(44,24,16,0.5)' }}>
                            Continue your sacred journey of learning.
                        </p>

                        {/* Role selector */}
                        <div className="flex gap-1.5 mb-6 p-1 rounded-xl" style={{ backgroundColor: '#F7F4EF' }}>
                            {roles.map((r) => (
                                <button key={r} onClick={() => setRole(r)}
                                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                                    style={{
                                        backgroundColor: role === r ? '#C1440E' : 'transparent',
                                        color: role === r ? '#FFFFFF' : 'rgba(44,24,16,0.5)',
                                        boxShadow: role === r ? '0 2px 8px rgba(193,68,14,0.3)' : 'none',
                                    }}>
                                    {r}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block mb-1.5"
                                    style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(44,24,16,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                    Email or Phone
                                </label>
                                <input
                                    type="text"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                    style={{
                                        backgroundColor: '#F7F4EF',
                                        border: '1.5px solid rgba(44,24,16,0.1)',
                                        color: '#2C1810',
                                        transition: 'border-color 150ms',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#C1440E'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(44,24,16,0.1)'}
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block mb-1.5"
                                    style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(44,24,16,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none"
                                        style={{
                                            backgroundColor: '#F7F4EF',
                                            border: '1.5px solid rgba(44,24,16,0.1)',
                                            color: '#2C1810',
                                            transition: 'border-color 150ms',
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#C1440E'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(44,24,16,0.1)'}
                                    />
                                    <button type="button"
                                        onClick={() => setShowPw(p => !p)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1">
                                        {showPw
                                            ? <EyeOff size={15} color="rgba(44,24,16,0.4)" />
                                            : <Eye    size={15} color="rgba(44,24,16,0.4)" />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot */}
                            <div className="text-right">
                                <a href="/forgot-password" className="text-xs font-semibold"
                                    style={{ color: '#C1440E' }}>
                                    Forgot Password?
                                </a>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="px-4 py-3 rounded-xl text-sm"
                                    style={{ backgroundColor: 'rgba(193,68,14,0.07)', color: '#C1440E', border: '1px solid rgba(193,68,14,0.15)' }}>
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button type="submit" disabled={loading}
                                className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
                                style={{
                                    backgroundColor: '#C1440E',
                                    color: '#FFFFFF',
                                    boxShadow: '0 4px 16px rgba(193,68,14,0.35)',
                                    opacity: loading ? 0.8 : 1,
                                }}>
                                {loading ? 'Entering…' : <>Enter the Classroom <ArrowRight size={15} /></>}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 my-1">
                                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(44,24,16,0.08)' }} />
                                <span className="text-xs" style={{ color: 'rgba(44,24,16,0.35)' }}>or</span>
                                <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(44,24,16,0.08)' }} />
                            </div>

                            {/* Request Access */}
                            <div className="text-center">
                                <p className="text-xs mb-2" style={{ color: 'rgba(44,24,16,0.45)' }}>New student?</p>
                                <button type="button"
                                    onClick={() => navigate('/request-access')}
                                    className="flex items-center gap-1.5 mx-auto px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                    style={{
                                        border: '1.5px solid rgba(193,68,14,0.25)',
                                        color: '#C1440E',
                                        backgroundColor: 'transparent',
                                    }}>
                                    Request Access <ArrowRight size={13} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
