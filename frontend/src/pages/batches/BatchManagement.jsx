import { useState, useEffect } from 'react';
import { Plus, Trash2, Users, BookOpen, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoader } from '../../components/ui/Spinner';

export default function BatchManagement() {
    const [batches, setBatches]     = useState([]);
    const [students, setStudents]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [expanded, setExpanded]   = useState(null);
    const [showForm, setShowForm]   = useState(false);
    const [form, setForm]           = useState({ name:'', subject:'', schedule:'', capacity:'' });
    const [saving, setSaving]       = useState(false);
    const [err, setErr]             = useState('');
    const [msg, setMsg]             = useState('');

    const load = () => {
        Promise.all([api.get('/users/batches'), api.get('/users/students')])
            .then(([b, s]) => { setBatches(b.data.batches || []); setStudents(s.data.students || []); })
            .catch(() => {})
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.name || !form.subject) return setErr('Name and subject are required.');
        setSaving(true); setErr('');
        try {
            await api.post('/users/batches', form);
            setForm({ name:'', subject:'', schedule:'', capacity:'' });
            setShowForm(false); setMsg('✅ Batch created!');
            load();
        } catch (err) {
            setErr(err.response?.data?.message || 'Failed to create batch');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this batch? Students will be unassigned.')) return;
        try {
            await api.delete(`/users/batches/${id}`);
            setMsg('Batch deleted'); load();
        } catch { setMsg('Delete failed'); }
    };

    const handleAssign = async (studentId, batchId, assign) => {
        const student = students.find(s => s._id === studentId);
        if (!student) return;
        const cur = student.batchIds?.map(b => b._id || b) || [];
        const updated = assign ? [...cur, batchId] : cur.filter(b => b.toString() !== batchId.toString());
        try {
            await api.patch(`/users/students/${studentId}`, { batchIds: updated });
            setMsg(assign ? 'Student added to batch' : 'Student removed');
            load();
        } catch { setMsg('Update failed'); }
    };

    if (loading) return <PageLoader/>;

    const COLORS = ['#C1440E','#E8A020','#2563eb','#16a34a','#7c3aed','#0891b2'];

    return (
        <div style={{ minHeight:'100vh', backgroundColor:'#F7F4EF', paddingBottom:80 }}>
            <PageHeader title="Batch Management" subtitle={`${batches.length} batches`}
                action={{ label:'New Batch', icon: Plus, onClick:() => setShowForm(p => !p) }}/>

            <div style={{ padding:'16px 20px', maxWidth:800, margin:'0 auto' }}>
                {msg && <div style={{ padding:'10px 14px', borderRadius:10, backgroundColor:'rgba(22,163,74,0.08)', color:'#16a34a', fontSize:13, fontWeight:600, marginBottom:12, border:'1px solid rgba(22,163,74,0.2)' }}>{msg}</div>}

                {/* Create form */}
                {showForm && (
                    <div style={{ backgroundColor:'#FFFFFF', borderRadius:16, padding:22, marginBottom:16, border:'1px solid rgba(44,24,16,0.07)', boxShadow:'0 4px 20px rgba(44,24,16,0.07)' }}>
                        <h3 style={{ fontFamily:'Playfair Display, serif', fontWeight:700, color:'#2C1810', fontSize:18, marginBottom:16 }}>New Batch</h3>
                        <form onSubmit={handleCreate}>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                                {[
                                    { key:'name',    label:'Batch Name *',  placeholder:'e.g. Morning CBSE 10' },
                                    { key:'subject', label:'Subject *',     placeholder:'e.g. All Subjects, Maths…' },
                                    { key:'schedule',label:'Schedule',      placeholder:'e.g. Mon-Fri 7:00–8:00 AM' },
                                    { key:'capacity',label:'Max Students',  placeholder:'e.g. 20', type:'number' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(44,24,16,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>{f.label}</label>
                                        <input type={f.type||'text'} placeholder={f.placeholder} value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                                            style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'1.5px solid rgba(44,24,16,0.12)', backgroundColor:'#F7F4EF', fontSize:13, color:'#2C1810', outline:'none', boxSizing:'border-box' }}
                                            onFocus={e => e.target.style.borderColor='#C1440E'}
                                            onBlur={e => e.target.style.borderColor='rgba(44,24,16,0.12)'}/>
                                    </div>
                                ))}
                            </div>
                            {err && <p style={{ color:'#C1440E', fontSize:12, marginBottom:10 }}>{err}</p>}
                            <div style={{ display:'flex', gap:10 }}>
                                <button type="button" onClick={() => setShowForm(false)}
                                    style={{ flex:1, padding:'10px', borderRadius:10, border:'1.5px solid rgba(44,24,16,0.15)', backgroundColor:'transparent', color:'rgba(44,24,16,0.6)', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
                                <button type="submit" disabled={saving}
                                    style={{ flex:2, padding:'10px', borderRadius:10, backgroundColor:'#C1440E', color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer', opacity: saving ? 0.8 : 1 }}>
                                    {saving ? 'Creating…' : 'Create Batch'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Batch list */}
                {batches.length === 0 && !showForm && (
                    <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(44,24,16,0.4)' }}>
                        <Users size={40} style={{ margin:'0 auto 12px', display:'block', opacity:.3 }}/>
                        <p style={{ fontSize:15 }}>No batches yet. Create your first batch!</p>
                    </div>
                )}

                {batches.map((batch, idx) => {
                    const color = COLORS[idx % COLORS.length];
                    const isOpen = expanded === batch._id;
                    const batchStudents = students.filter(s => s.batchIds?.some(b => (b._id||b).toString() === batch._id.toString()));
                    const unassigned    = students.filter(s => !s.batchIds?.some(b => (b._id||b).toString() === batch._id.toString()));

                    return (
                        <div key={batch._id} style={{ backgroundColor:'#FFFFFF', borderRadius:16, marginBottom:12, border:'1px solid rgba(44,24,16,0.07)', boxShadow:'0 2px 12px rgba(44,24,16,0.04)', overflow:'hidden' }}>
                            {/* Header row */}
                            <div style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', cursor:'pointer' }}
                                onClick={() => setExpanded(isOpen ? null : batch._id)}>
                                <div style={{ width:44, height:44, borderRadius:12, backgroundColor:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                    <BookOpen size={20} color={color}/>
                                </div>
                                <div style={{ flex:1 }}>
                                    <p style={{ fontWeight:700, color:'#2C1810', fontSize:15, marginBottom:2 }}>{batch.name}</p>
                                    <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                                        <span style={{ fontSize:12, color, fontWeight:600 }}>{batch.subject}</span>
                                        {batch.schedule && <span style={{ fontSize:12, color:'rgba(44,24,16,0.4)', display:'flex', alignItems:'center', gap:3 }}><Clock size={10}/>{batch.schedule}</span>}
                                        <span style={{ fontSize:12, color:'rgba(44,24,16,0.4)', display:'flex', alignItems:'center', gap:3 }}><Users size={10}/>{batchStudents.length}{batch.capacity ? `/${batch.capacity}` : ''} students</span>
                                    </div>
                                </div>
                                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                                    <button onClick={e => { e.stopPropagation(); handleDelete(batch._id); }}
                                        style={{ width:32, height:32, borderRadius:8, border:'1px solid rgba(193,68,14,0.2)', backgroundColor:'rgba(193,68,14,0.06)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                        <Trash2 size={13} color="#C1440E"/>
                                    </button>
                                    {isOpen ? <ChevronUp size={16} color="rgba(44,24,16,0.4)"/> : <ChevronDown size={16} color="rgba(44,24,16,0.4)"/>}
                                </div>
                            </div>

                            {/* Expanded: students */}
                            {isOpen && (
                                <div style={{ borderTop:'1px solid rgba(44,24,16,0.06)', padding:'16px 18px' }}>
                                    <p style={{ fontSize:12, fontWeight:700, color:'rgba(44,24,16,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Students in batch</p>
                                    {batchStudents.length === 0 && <p style={{ color:'rgba(44,24,16,0.35)', fontSize:13, marginBottom:12 }}>No students yet.</p>}
                                    {batchStudents.map(s => (
                                        <div key={s._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:'1px solid rgba(44,24,16,0.04)' }}>
                                            <div style={{ width:28, height:28, borderRadius:'50%', backgroundColor:color+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color, flexShrink:0 }}>{s.name[0]}</div>
                                            <span style={{ flex:1, fontSize:13, fontWeight:500, color:'#2C1810' }}>{s.name}</span>
                                            {s.rollNumber && <span style={{ fontSize:11, color:'rgba(44,24,16,0.4)' }}>#{s.rollNumber}</span>}
                                            <button onClick={() => handleAssign(s._id, batch._id, false)}
                                                style={{ fontSize:11, color:'#C1440E', border:'1px solid rgba(193,68,14,0.2)', borderRadius:6, padding:'3px 8px', backgroundColor:'rgba(193,68,14,0.05)', cursor:'pointer', fontWeight:600 }}>Remove</button>
                                        </div>
                                    ))}

                                    {unassigned.length > 0 && (
                                        <>
                                            <p style={{ fontSize:12, fontWeight:700, color:'rgba(44,24,16,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginTop:16, marginBottom:10 }}>Add students</p>
                                            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                                                {unassigned.slice(0, 20).map(s => (
                                                    <button key={s._id} onClick={() => handleAssign(s._id, batch._id, true)}
                                                        style={{ padding:'5px 12px', borderRadius:8, border:'1px solid rgba(44,24,16,0.15)', backgroundColor:'#F7F4EF', fontSize:12, color:'rgba(44,24,16,0.7)', cursor:'pointer', fontWeight:500 }}>
                                                        + {s.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
