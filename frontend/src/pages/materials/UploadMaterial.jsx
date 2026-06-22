import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Video, StickyNote, X } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Spinner from '../../components/ui/Spinner';
import api from '../../utils/api';

export default function UploadMaterial() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '', subject: '', chapter: '', type: 'pdf', videoUrl: '', description: '', batchId: '',
    });
    const [batches, setBatches] = useState([]);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState('');

    useEffect(() => {
        api.get('/users/batches').then(r => setBatches(r.data.batches || []));
    }, []);

    const handle = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.subject) return setError('Title and subject required');
        if (form.type !== 'video' && !file) return setError('Please select a file to upload');
        if (form.type === 'video' && !form.videoUrl) return setError('Please enter a video URL');

        setLoading(true);
        setError('');
        setProgress('Uploading...');

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('subject', form.subject);
            formData.append('chapter', form.chapter);
            formData.append('type', form.type);
            formData.append('videoUrl', form.videoUrl);
            formData.append('description', form.description);
            // Send batchId as a JSON array for batchIds field
            if (form.batchId) {
                formData.append('batchIds', JSON.stringify([form.batchId]));
            } else {
                formData.append('batchIds', JSON.stringify([]));
            }
            if (file) formData.append('file', file);

            await api.post('/materials', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            navigate('/materials');
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
            setProgress('');
        }
    };

    const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none";
    const inputStyle = { backgroundColor: '#F7F4EF', border: '1.5px solid transparent', color: '#2C1810' };
    const focusHandlers = {
        onFocus: (e) => e.target.style.borderColor = '#C1440E',
        onBlur: (e) => e.target.style.borderColor = 'transparent',
    };

    return (
        <div className="min-h-screen pb-24 page-fade" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader title="Upload Material" backTo="/materials" />

            <div className="px-6">
                <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Type selector */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#2C1810', opacity: 0.6 }}>
                                Material Type
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'pdf', label: 'PDF', Icon: FileText, color: '#dc2626' },
                                    { value: 'video', label: 'Video', Icon: Video, color: '#2563eb' },
                                    { value: 'note', label: 'Note', Icon: StickyNote, color: '#059669' },
                                ].map(({ value, label, Icon, color }) => (
                                    <button key={value} type="button" onClick={() => { handle('type', value); setFile(null); }}
                                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                                        style={{
                                            backgroundColor: form.type === value ? color : '#F5F0E8',
                                            color: form.type === value ? '#FFFFFF' : '#2C1810',
                                        }}>
                                        <Icon size={18} color={form.type === value ? '#FFFFFF' : color} />
                                        <span className="text-xs font-semibold">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Title *</label>
                            <input value={form.title} onChange={(e) => handle('title', e.target.value)}
                                placeholder="Material title" className={inputCls} style={inputStyle} {...focusHandlers} />
                        </div>

                        {/* Batch selector */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Batch</label>
                            <select value={form.batchId} onChange={(e) => handle('batchId', e.target.value)}
                                className={inputCls} style={inputStyle} {...focusHandlers}>
                                <option value="">General (All Batches)</option>
                                {batches.map(b => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Subject *</label>
                                <input value={form.subject} onChange={(e) => handle('subject', e.target.value)}
                                    placeholder="e.g. Mathematics" className={inputCls} style={inputStyle} {...focusHandlers} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Chapter</label>
                                <input value={form.chapter} onChange={(e) => handle('chapter', e.target.value)}
                                    placeholder="e.g. Chapter 3" className={inputCls} style={inputStyle} {...focusHandlers} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Description</label>
                            <textarea value={form.description} onChange={(e) => handle('description', e.target.value)}
                                rows={2} placeholder="Brief description..."
                                className={inputCls + " resize-none"} style={inputStyle} {...focusHandlers} />
                        </div>

                        {form.type === 'video' ? (
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Video URL *</label>
                                <input value={form.videoUrl} onChange={(e) => handle('videoUrl', e.target.value)}
                                    placeholder="YouTube or Drive video URL"
                                    className={inputCls} style={inputStyle} {...focusHandlers} />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#2C1810', opacity: 0.6 }}>
                                    File * {form.type === 'pdf' ? '(PDF)' : '(Any format)'}
                                </label>
                                {file ? (
                                    <div className="flex items-center gap-3 p-4 rounded-xl"
                                        style={{ backgroundColor: '#F7F4EF', border: '1.5px dashed rgba(193,68,14,0.3)' }}>
                                        <FileText size={18} color="#C1440E" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate" style={{ color: '#2C1810' }}>{file.name}</p>
                                            <p className="text-xs" style={{ color: '#2C1810', opacity: 0.5 }}>
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button type="button" onClick={() => setFile(null)}>
                                            <X size={16} color="#C1440E" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center gap-3 p-8 rounded-xl cursor-pointer transition-all hover:opacity-80"
                                        style={{ border: '2px dashed rgba(193,68,14,0.3)', backgroundColor: '#F7F4EF' }}>
                                        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(193,68,14,0.1)' }}>
                                            <Upload size={20} color="#C1440E" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-semibold" style={{ color: '#2C1810' }}>Click to upload</p>
                                            <p className="text-xs mt-1" style={{ color: '#2C1810', opacity: 0.5 }}>Max 50MB</p>
                                        </div>
                                        <input type="file" className="hidden"
                                            accept={form.type === 'pdf' ? '.pdf' : '*'}
                                            onChange={(e) => setFile(e.target.files[0])} />
                                    </label>
                                )}
                            </div>
                        )}

                        {error && (
                            <p className="text-xs text-center py-2 rounded-lg" style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>
                                {error}
                            </p>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                            {loading ? (
                                <><Spinner size="sm" color="#F5F0E8" /> {progress}</>
                            ) : (
                                <>Upload to Drive →</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
