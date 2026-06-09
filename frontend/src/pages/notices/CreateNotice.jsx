import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Video, Link } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import api from '../../utils/api';

export default function CreateNotice() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '', body: '', priority: 'normal', targetRole: 'all', link: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handle = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.body.trim()) return setError('Title and body required');
        setLoading(true); setError('');
        try {
            await api.post('/notices', form);
            navigate('/notices');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post notice');
        } finally { setLoading(false); }
    };

    const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all";
    const inputStyle = { backgroundColor: '#F7F4EF', border: '1.5px solid transparent', color: '#2C1810' };
    const focusStyle = { borderColor: '#C1440E' };

    return (
        <div className="min-h-screen pb-10" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader title="Post Notice" backTo="/notices" />

            <div className="px-6">
                <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>
                                Title *
                            </label>
                            <input value={form.title} onChange={e => handle('title', e.target.value)}
                                placeholder="Notice title…" className={inputCls} style={inputStyle}
                                onFocus={e => Object.assign(e.target.style, focusStyle)}
                                onBlur={e => (e.target.style.borderColor = 'transparent')} />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>
                                Message *
                            </label>
                            <textarea value={form.body} onChange={e => handle('body', e.target.value)}
                                rows={4} placeholder="Write your notice here…"
                                className={inputCls + ' resize-none'} style={inputStyle}
                                onFocus={e => Object.assign(e.target.style, focusStyle)}
                                onBlur={e => (e.target.style.borderColor = 'transparent')} />
                        </div>

                        {/* Live Class Link */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>
                                Live Class Link (optional)
                            </label>
                            <div className="relative">
                                <Video size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" color="#C1440E" opacity={0.6} />
                                <input value={form.link} onChange={e => handle('link', e.target.value)}
                                    placeholder="https://meet.google.com/…"
                                    className={inputCls} style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                                    onFocus={e => Object.assign(e.target.style, focusStyle)}
                                    onBlur={e => (e.target.style.borderColor = 'transparent')} />
                            </div>
                            <p className="text-xs mt-1" style={{ color: '#2C1810', opacity: 0.4 }}>
                                Students will see a "Join Class" button if link is provided.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>
                                    Priority
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'normal', label: 'Normal', color: '#4338CA' },
                                        { value: 'urgent', label: 'Urgent', color: '#C1440E' },
                                        { value: 'holiday', label: 'Holiday', color: '#854D0E' },
                                    ].map(({ value, label, color }) => (
                                        <button key={value} type="button" onClick={() => handle('priority', value)}
                                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                                            style={{
                                                backgroundColor: form.priority === value ? color : '#F5F0E8',
                                                color: form.priority === value ? '#FFFFFF' : '#2C1810',
                                            }}>
                                            <div className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: form.priority === value ? '#FFFFFF' : color }} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>
                                    Audience
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'all', label: 'Everyone' },
                                        { value: 'student', label: 'Students' },
                                        { value: 'parent', label: 'Parents' },
                                    ].map(({ value, label }) => (
                                        <button key={value} type="button" onClick={() => handle('targetRole', value)}
                                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                                            style={{
                                                backgroundColor: form.targetRole === value ? '#2C1810' : '#F5F0E8',
                                                color: form.targetRole === value ? '#F5F0E8' : '#2C1810',
                                            }}>
                                            <Bell size={13} color={form.targetRole === value ? '#F5F0E8' : '#2C1810'} opacity={0.6} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <p className="text-xs text-center py-2 rounded-lg"
                                style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>{error}</p>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                            style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                            {loading ? 'Posting…' : 'Post Notice →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
