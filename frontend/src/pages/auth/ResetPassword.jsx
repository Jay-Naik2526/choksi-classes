import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const email = params.get('email') || '';

    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) return setError('Passwords do not match');
        if (password.length < 6) return setError('Password must be at least 6 characters');
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/reset-password', { email, otp, password });
            navigate('/login', { state: { message: 'Password reset successful. Please login.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#F7F4EF' }}>
            <div className="w-full max-w-sm">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#C1440E' }}>
                        Choksi Classes
                    </h1>
                </div>

                <div className="rounded-2xl p-8 shadow-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(193,68,14,0.1)' }}>
                    <Link to="/forgot-password" className="flex items-center gap-1.5 text-xs mb-6 w-fit" style={{ color: '#2C1810', opacity: 0.5 }}>
                        <ArrowLeft size={13} /> Back
                    </Link>

                    <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                        Reset Password
                    </h2>
                    <p className="text-xs mb-6" style={{ color: '#2C1810', opacity: 0.5 }}>
                        Enter the OTP sent to <strong>{email}</strong>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: '#2C1810', opacity: 0.7 }}>
                                OTP CODE
                            </label>
                            <input
                                type="text" required value={otp} maxLength={6}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="6-digit code"
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none text-center tracking-widest font-bold"
                                style={{ backgroundColor: '#F7F4EF', border: '1.5px solid transparent', color: '#2C1810', fontSize: '18px' }}
                                onFocus={(e) => e.target.style.borderColor = '#C1440E'}
                                onBlur={(e) => e.target.style.borderColor = 'transparent'}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: '#2C1810', opacity: 0.7 }}>
                                NEW PASSWORD
                            </label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'} required value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    className="w-full px-4 pr-10 py-3 rounded-xl text-sm outline-none"
                                    style={{ backgroundColor: '#F7F4EF', border: '1.5px solid transparent', color: '#2C1810' }}
                                    onFocus={(e) => e.target.style.borderColor = '#C1440E'}
                                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {showPw ? <EyeOff size={14} color="#2C1810" opacity={0.4} /> : <Eye size={14} color="#2C1810" opacity={0.4} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: '#2C1810', opacity: 0.7 }}>
                                CONFIRM PASSWORD
                            </label>
                            <input
                                type="password" required value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="Re-enter password"
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                style={{ backgroundColor: '#F7F4EF', border: '1.5px solid transparent', color: '#2C1810' }}
                                onFocus={(e) => e.target.style.borderColor = '#C1440E'}
                                onBlur={(e) => e.target.style.borderColor = 'transparent'}
                            />
                        </div>

                        {error && (
                            <p className="text-xs text-center py-2 rounded-lg"
                                style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>
                                {error}
                            </p>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:opacity-90"
                            style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                            {loading ? 'Resetting...' : 'Reset Password →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
