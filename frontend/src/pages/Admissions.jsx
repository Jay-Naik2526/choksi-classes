import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Phone, MapPin, Clock } from 'lucide-react';
import api from '../utils/api';

const CLASSES = ['Std 1','Std 2','Std 3','Std 4','Std 5','Std 6','Std 7','Std 8','Std 9','Std 10','Std 11 Commerce','Std 12 Commerce'];
const BOARDS  = ['CBSE','GSEB'];

export default function Admissions() {
    const navigate = useNavigate();
    const [form, setForm]       = useState({ parentName:'', childName:'', className:'', board:'', phone:'', message:'' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError]     = useState('');

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await api.post('/enquiry', form);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send. Please call us directly.');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight:'100vh', backgroundColor:'#F7F4EF', fontFamily:'Inter, sans-serif' }}>

            {/* Header */}
            <div style={{ backgroundColor:'#140A05', padding:'20px 24px', display:'flex', alignItems:'center', gap:16 }}>
                <button onClick={() => navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:'rgba(245,240,232,0.6)', fontSize:13 }}>
                    <ArrowLeft size={16}/> Back
                </button>
                <div style={{ flex:1 }}/>
                <span style={{ fontFamily:'Playfair Display, serif', color:'#F5F0E8', fontWeight:700, fontSize:16 }}>Choksi Classes</span>
            </div>

            <div style={{ maxWidth:1000, margin:'0 auto', padding:'40px 20px', display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:48, alignItems:'start' }}>

                {/* Left info */}
                <div>
                    <p style={{ color:'#C1440E', fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:12 }}>Admissions Open</p>
                    <h1 style={{ fontFamily:'Playfair Display, serif', fontSize:'clamp(28px, 4vw, 42px)', fontWeight:900, color:'#2C1810', lineHeight:1.1, marginBottom:20 }}>
                        Join the Best<br/><span style={{ color:'#C1440E' }}>Class in Town</span>
                    </h1>
                    <p style={{ color:'rgba(44,24,16,0.65)', fontSize:15, lineHeight:1.8, marginBottom:32 }}>
                        Fill out this form and our team will contact you within 24 hours. Admissions are open for all standards.
                    </p>

                    {[
                        { icon: Phone,  title:'Dip Choksi',        sub:'+91 82382 16622' },
                        { icon: Phone,  title:'CA Kairavi Choksi', sub:'+91 97260 19001' },
                        { icon: MapPin, title:'Location',          sub:'304/5/6/7, Union Heights, Ashanagar, Navsari' },
                        { icon: Clock,  title:'Helpline',          sub:'24 hours · 7 days a week' },
                    ].map((c, i) => (
                        <div key={i} style={{ display:'flex', gap:14, marginBottom:16, alignItems:'flex-start' }}>
                            <div style={{ width:36, height:36, borderRadius:10, backgroundColor:'rgba(193,68,14,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <c.icon size={16} color="#C1440E"/>
                            </div>
                            <div>
                                <p style={{ fontWeight:600, color:'#2C1810', fontSize:14, marginBottom:2 }}>{c.title}</p>
                                <p style={{ color:'rgba(44,24,16,0.6)', fontSize:13 }}>{c.sub}</p>
                            </div>
                        </div>
                    ))}

                    {/* Courses offered */}
                    <div style={{ marginTop:28, padding:20, borderRadius:16, backgroundColor:'#FFFFFF', border:'1px solid rgba(44,24,16,0.07)' }}>
                        <p style={{ fontWeight:700, color:'#2C1810', marginBottom:12, fontSize:14 }}>Courses Offered</p>
                        {[
                            { label:'CBSE Board',       sub:'Std 1 – 10' },
                            { label:'GSEB Board',       sub:'Std 1 – 12' },
                            { label:'Commerce Stream',  sub:'Std 11 – 12 · CBSE & GSEB' },
                        ].map((c, i) => (
                            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom: i < 2 ? '1px solid rgba(44,24,16,0.06)' : 'none' }}>
                                <span style={{ fontWeight:500, color:'#2C1810', fontSize:13 }}>{c.label}</span>
                                <span style={{ color:'#C1440E', fontSize:12, fontWeight:600 }}>{c.sub}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div style={{ backgroundColor:'#FFFFFF', borderRadius:24, padding:36, border:'1px solid rgba(44,24,16,0.07)', boxShadow:'0 8px 40px rgba(44,24,16,0.08)' }}>
                    {success ? (
                        <div style={{ textAlign:'center', padding:'40px 0' }}>
                            <div style={{ width:72, height:72, borderRadius:'50%', backgroundColor:'rgba(22,163,74,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
                                <CheckCircle size={36} color="#16a34a"/>
                            </div>
                            <h2 style={{ fontFamily:'Playfair Display, serif', fontSize:24, fontWeight:700, color:'#2C1810', marginBottom:12 }}>Enquiry Sent!</h2>
                            <p style={{ color:'rgba(44,24,16,0.6)', fontSize:15, lineHeight:1.7, marginBottom:28 }}>
                                We've received your enquiry and will contact you within 24 hours. You can also call us directly.
                            </p>
                            <a href="tel:+918238216622" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 28px', borderRadius:14, backgroundColor:'#C1440E', color:'#fff', fontSize:14, fontWeight:700, textDecoration:'none' }}>
                                <Phone size={15}/> Call Now
                            </a>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <h2 style={{ fontFamily:'Playfair Display, serif', fontWeight:700, color:'#2C1810', fontSize:22, marginBottom:6 }}>Admission Enquiry</h2>
                            <p style={{ color:'rgba(44,24,16,0.5)', fontSize:13, marginBottom:28 }}>We'll get back to you within 24 hours.</p>

                            {[
                                { key:'parentName', label:"Parent's Name *",   placeholder:'Your full name',     type:'text' },
                                { key:'childName',  label:"Child's Name",       placeholder:"Child's full name",  type:'text' },
                                { key:'phone',      label:'Phone Number *',     placeholder:'+91 98765 43210',    type:'tel'  },
                            ].map(f => (
                                <div key={f.key} style={{ marginBottom:16 }}>
                                    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(44,24,16,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>{f.label}</label>
                                    <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                                        style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid rgba(44,24,16,0.12)', backgroundColor:'#F7F4EF', fontSize:14, color:'#2C1810', outline:'none', boxSizing:'border-box' }}
                                        onFocus={e => e.target.style.borderColor='#C1440E'}
                                        onBlur={e => e.target.style.borderColor='rgba(44,24,16,0.12)'}/>
                                </div>
                            ))}

                            {/* Class + Board row */}
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                                <div>
                                    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(44,24,16,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Class</label>
                                    <select value={form.className} onChange={e => set('className', e.target.value)}
                                        style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid rgba(44,24,16,0.12)', backgroundColor:'#F7F4EF', fontSize:14, color:'#2C1810', outline:'none' }}
                                        onFocus={e => e.target.style.borderColor='#C1440E'}
                                        onBlur={e => e.target.style.borderColor='rgba(44,24,16,0.12)'}>
                                        <option value="">Select class</option>
                                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(44,24,16,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Board</label>
                                    <select value={form.board} onChange={e => set('board', e.target.value)}
                                        style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid rgba(44,24,16,0.12)', backgroundColor:'#F7F4EF', fontSize:14, color:'#2C1810', outline:'none' }}
                                        onFocus={e => e.target.style.borderColor='#C1440E'}
                                        onBlur={e => e.target.style.borderColor='rgba(44,24,16,0.12)'}>
                                        <option value="">Select board</option>
                                        {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom:20 }}>
                                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(44,24,16,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Message (optional)</label>
                                <textarea rows={3} placeholder="Any specific questions or requirements..." value={form.message} onChange={e => set('message', e.target.value)}
                                    style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid rgba(44,24,16,0.12)', backgroundColor:'#F7F4EF', fontSize:14, color:'#2C1810', outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'Inter, sans-serif' }}
                                    onFocus={e => e.target.style.borderColor='#C1440E'}
                                    onBlur={e => e.target.style.borderColor='rgba(44,24,16,0.12)'}/>
                            </div>

                            {error && <div style={{ padding:'10px 14px', borderRadius:10, backgroundColor:'rgba(193,68,14,0.07)', color:'#C1440E', fontSize:13, marginBottom:16, border:'1px solid rgba(193,68,14,0.2)' }}>{error}</div>}

                            <button type="submit" disabled={loading}
                                style={{ width:'100%', padding:'14px', borderRadius:14, backgroundColor:'#C1440E', color:'#fff', fontSize:15, fontWeight:700, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(193,68,14,0.3)', opacity: loading ? 0.8 : 1 }}>
                                {loading ? 'Sending…' : <><span>Send Enquiry</span><ArrowRight size={16}/></>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
