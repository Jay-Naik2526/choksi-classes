import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import api from '../../utils/api';
import PageHeader from '../../components/layout/PageHeader';

export default function CreateHomework() {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [form, setForm]   = useState({ title:'', description:'', subject:'', dueDate:'', batchId:'' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/users/batches').then(r => setBatches(r.data.batches || [])).catch(()=>{});
    }, []);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.dueDate) return setError('Title and due date are required.');
        setLoading(true); setError('');
        try {
            await api.post('/homework', form);
            navigate('/homework');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create homework');
        } finally { setLoading(false); }
    };

    // Tomorrow as min date
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <div style={{ minHeight:'100vh', backgroundColor:'#F7F4EF', paddingBottom:80 }}>
            <PageHeader title="Assign Homework" subtitle="Create a new assignment"/>

            <div style={{ maxWidth:560, margin:'0 auto', padding:'20px' }}>
                <div style={{ backgroundColor:'#FFFFFF', borderRadius:20, padding:28, border:'1px solid rgba(44,24,16,0.07)', boxShadow:'0 4px 20px rgba(44,24,16,0.05)' }}>
                    <form onSubmit={handleSubmit}>
                        {[
                            { key:'title',   label:'Title *',   placeholder:'e.g. Chapter 5 Exercise Questions',     type:'text' },
                            { key:'subject', label:'Subject',   placeholder:'e.g. Mathematics, English…',            type:'text' },
                        ].map(f => (
                            <div key={f.key} style={{ marginBottom:18 }}>
                                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(44,24,16,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:7 }}>{f.label}</label>
                                <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                                    style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid rgba(44,24,16,0.12)', backgroundColor:'#F7F4EF', fontSize:14, color:'#2C1810', outline:'none', boxSizing:'border-box' }}
                                    onFocus={e => e.target.style.borderColor='#C1440E'}
                                    onBlur={e => e.target.style.borderColor='rgba(44,24,16,0.12)'}/>
                            </div>
                        ))}

                        <div style={{ marginBottom:18 }}>
                            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(44,24,16,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:7 }}>Description</label>
                            <textarea rows={3} placeholder="Instructions or details for students…" value={form.description} onChange={e => set('description', e.target.value)}
                                style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid rgba(44,24,16,0.12)', backgroundColor:'#F7F4EF', fontSize:14, color:'#2C1810', outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'Inter, sans-serif' }}
                                onFocus={e => e.target.style.borderColor='#C1440E'}
                                onBlur={e => e.target.style.borderColor='rgba(44,24,16,0.12)'}/>
                        </div>

                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
                            <div>
                                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(44,24,16,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:7 }}>Due Date *</label>
                                <input type="date" min={minDate} value={form.dueDate} onChange={e => set('dueDate', e.target.value)}
                                    style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid rgba(44,24,16,0.12)', backgroundColor:'#F7F4EF', fontSize:14, color:'#2C1810', outline:'none', boxSizing:'border-box' }}
                                    onFocus={e => e.target.style.borderColor='#C1440E'}
                                    onBlur={e => e.target.style.borderColor='rgba(44,24,16,0.12)'}/>
                            </div>
                            <div>
                                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(44,24,16,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:7 }}>Batch</label>
                                <select value={form.batchId} onChange={e => set('batchId', e.target.value)}
                                    style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid rgba(44,24,16,0.12)', backgroundColor:'#F7F4EF', fontSize:14, color:'#2C1810', outline:'none', boxSizing:'border-box' }}
                                    onFocus={e => e.target.style.borderColor='#C1440E'}
                                    onBlur={e => e.target.style.borderColor='rgba(44,24,16,0.12)'}>
                                    <option value="">All students</option>
                                    {batches.map(b => <option key={b._id} value={b._id}>{b.name} — {b.subject}</option>)}
                                </select>
                            </div>
                        </div>

                        {error && <div style={{ padding:'10px 14px', borderRadius:10, backgroundColor:'rgba(193,68,14,0.07)', color:'#C1440E', fontSize:13, marginBottom:16, border:'1px solid rgba(193,68,14,0.15)' }}>{error}</div>}

                        <div style={{ display:'flex', gap:12 }}>
                            <button type="button" onClick={() => navigate('/homework')}
                                style={{ flex:1, padding:'12px', borderRadius:12, border:'1.5px solid rgba(44,24,16,0.15)', backgroundColor:'transparent', color:'rgba(44,24,16,0.6)', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={loading}
                                style={{ flex:2, padding:'12px', borderRadius:12, backgroundColor:'#C1440E', color:'#fff', fontSize:14, fontWeight:700, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 12px rgba(193,68,14,0.3)', opacity: loading ? 0.8 : 1 }}>
                                <BookOpen size={15}/>
                                {loading ? 'Assigning…' : 'Assign Homework'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
