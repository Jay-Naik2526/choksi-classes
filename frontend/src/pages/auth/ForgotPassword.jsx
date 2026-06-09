import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
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
                    <Link to="/login" className="flex items-center gap-1.5 text-xs mb-6 w-fit" style={{ color: '#2C1810', opacity: 0.5 }}>
                        <ArrowLeft size={13} /> Back to login
                    </Link>

                    {!sent ? (
                        <>
                            <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                                Forgot Password
                            </h2>
                            <p className="text-xs mb-6" style={{ color: '#2C1810', opacity: 0.5 }}>
                                Enter your email to receive a one-time password
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1" style={{ color: '#2C1810', opacity: 0.7 }}>
                                        EMAIL ADDRESS
                                    </label>
                                    <div className="relative">
                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color="#2C1810" opacity={0.4} />
                                        <input
                                            type="email" required value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                                            style={{ backgroundColor: '#F7F4EF', border: '1.5px solid transparent', color: '#2C1810' }}
                                            onFocus={(e) => e.target.style.borderColor = '#C1440E'}
                                            onBlur={(e) => e.target.style.borderColor = 'transparent'}
                                        />
                                    </div>
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
                                    {loading ? 'Sending...' : 'Send OTP →'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                style={{ backgroundColor: 'rgba(193,68,14,0.1)' }}>
                                <Mail size={24} color="#C1440E" />
                            </div>
                            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                                OTP Sent!
                            </h2>
                            <p className="text-sm mb-6" style={{ color: '#2C1810', opacity: 0.6 }}>
                                Check your email <strong>{email}</strong> for the 6-digit OTP. Valid for 10 minutes.
                            </p>
                            <button
                                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                                className="w-full py-3 rounded-xl font-medium text-sm"
                                style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                                Enter OTP →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
