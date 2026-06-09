import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Spinner from '../../components/ui/Spinner';
import api from '../../utils/api';

export default function SubmitDoubt() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ subject: '', chapter: '', question: '' });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handle = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subject || !form.question) return setError('Subject and question required');
        setLoading(true);
        setError('');
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            if (image) formData.append('image', image);
            await api.post('/doubts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            navigate('/doubts');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit doubt');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none";
    const inputStyle = { backgroundColor: '#F7F4EF', border: '1.5px solid transparent', color: '#2C1810' };

    return (
        <div className="min-h-screen pb-24 page-fade" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader title="Ask a Doubt" backTo="/doubts" />
            <div className="px-6">
                <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Subject *</label>
                                <input value={form.subject} onChange={(e) => handle('subject', e.target.value)}
                                    placeholder="e.g. Mathematics"
                                    className={inputCls} style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#C1440E'}
                                    onBlur={(e) => e.target.style.borderColor = 'transparent'} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Chapter</label>
                                <input value={form.chapter} onChange={(e) => handle('chapter', e.target.value)}
                                    placeholder="e.g. Chapter 5"
                                    className={inputCls} style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#C1440E'}
                                    onBlur={(e) => e.target.style.borderColor = 'transparent'} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Your Question *</label>
                            <textarea value={form.question} onChange={(e) => handle('question', e.target.value)}
                                rows={5} placeholder="Describe your doubt clearly..."
                                className={inputCls + " resize-none"} style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#C1440E'}
                                onBlur={(e) => e.target.style.borderColor = 'transparent'} />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#2C1810', opacity: 0.6 }}>
                                Attach Image (optional)
                            </label>
                            {image ? (
                                <div className="flex items-center gap-3 p-3 rounded-xl"
                                    style={{ backgroundColor: '#F7F4EF', border: '1.5px dashed rgba(193,68,14,0.3)' }}>
                                    <img src={URL.createObjectURL(image)} alt="preview"
                                        className="w-12 h-12 object-cover rounded-lg" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate" style={{ color: '#2C1810' }}>{image.name}</p>
                                        <p className="text-xs" style={{ color: '#2C1810', opacity: 0.5 }}>
                                            {(image.size / 1024).toFixed(0)} KB
                                        </p>
                                    </div>
                                    <button type="button" onClick={() => setImage(null)}>
                                        <X size={15} color="#C1440E" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:opacity-80"
                                    style={{ border: '2px dashed rgba(193,68,14,0.25)', backgroundColor: '#F7F4EF' }}>
                                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(193,68,14,0.1)' }}>
                                        <Upload size={16} color="#C1440E" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: '#2C1810' }}>Upload image</p>
                                        <p className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>JPG, PNG up to 10MB</p>
                                    </div>
                                    <input type="file" accept="image/*" className="hidden"
                                        onChange={(e) => setImage(e.target.files[0])} />
                                </label>
                            )}
                        </div>

                        {error && (
                            <p className="text-xs text-center py-2 rounded-lg" style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>{error}</p>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                            {loading ? <><Spinner size="sm" color="#F5F0E8" /> Submitting...</> : 'Submit Doubt →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
