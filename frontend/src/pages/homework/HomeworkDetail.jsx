import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle, Clock, Star, MessageSquare, Download } from 'lucide-react';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import { PageLoader } from '../../components/ui/Spinner';
import PageHeader from '../../components/layout/PageHeader';

export default function HomeworkDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [hw, setHw]           = useState(null);
    const [loading, setLoading] = useState(true);
    const [note, setNote]       = useState('');
    const [file, setFile]       = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [gradeData, setGradeData]   = useState({});
    const [msg, setMsg]         = useState('');

    const fetch = () => {
        const queryParams = window.location.search;
        api.get(`/homework/${id}${queryParams}`)
            .then(r => setHw(r.data.homework))
            .catch(() => {})
            .finally(() => setLoading(false));
    };
    useEffect(() => { fetch(); }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true); setMsg('');
        try {
            const fd = new FormData();
            fd.append('note', note);
            if (file) fd.append('file', file);
            await api.post(`/homework/${id}/submit`, fd, { headers: { 'Content-Type':'multipart/form-data' } });
            setMsg('✅ Submitted successfully!');
            fetch();
        } catch (err) {
            setMsg(err.response?.data?.message || 'Submission failed');
        } finally { setSubmitting(false); }
    };

    const handleGrade = async (studentId) => {
        const { grade, feedback } = gradeData[studentId] || {};
        // FIX #16: Trim to prevent whitespace-only grades from being accepted
        if (!grade?.trim()) return;
        try {
            await api.patch(`/homework/${id}/grade/${studentId}`, { grade: grade.trim(), feedback: feedback?.trim() });
            setMsg('✅ Graded!');
            fetch();
        } catch (err) {
            setMsg('Grading failed');
        }
    };

    if (loading) return <PageLoader/>;
    if (!hw)     return <div style={{ padding:40, textAlign:'center', color:'rgba(44,24,16,0.5)' }}>Homework not found.</div>;

    const queryParams = new URLSearchParams(window.location.search);
    const targetStudentId = user?.role === 'parent' ? queryParams.get('studentId') : user?._id;

    const mySubmission = (user?.role === 'student' || user?.role === 'parent')
        ? hw.submissions?.find(s => s.studentId?._id?.toString() === targetStudentId?.toString() || s.studentId?.toString() === targetStudentId?.toString())
        : null;

    const due = new Date(hw.dueDate);
    const overdue = new Date() > due;

    return (
        <div style={{ minHeight:'100vh', backgroundColor:'#F7F4EF', paddingBottom:80 }}>
            <PageHeader title={hw.title} subtitle={hw.subject || hw.batchId?.name || ''}/>

            <div style={{ maxWidth:680, margin:'0 auto', padding:'16px 20px' }}>
                {/* Info card */}
                <div style={{ backgroundColor:'#FFFFFF', borderRadius:16, padding:20, marginBottom:16, border:'1px solid rgba(44,24,16,0.07)' }}>
                    <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom: hw.description ? 14 : 0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <Clock size={14} color={overdue ? '#C1440E' : '#16a34a'}/>
                            <span style={{ fontSize:13, fontWeight:600, color: overdue ? '#C1440E' : '#16a34a' }}>
                                Due: {due.toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })}
                            </span>
                        </div>
                        {hw.batchId && <span style={{ fontSize:13, color:'rgba(44,24,16,0.5)' }}>Batch: {hw.batchId.name}</span>}
                        {user?.role === 'sir' && <span style={{ fontSize:13, color:'#2563eb', fontWeight:600 }}>{hw.submissions?.length || 0} submissions</span>}
                    </div>
                    {hw.description && <p style={{ color:'rgba(44,24,16,0.65)', fontSize:14, lineHeight:1.7, margin:0 }}>{hw.description}</p>}
                </div>

                {msg && (
                    <div style={{ padding:'12px 16px', borderRadius:12, backgroundColor: msg.startsWith('✅') ? 'rgba(22,163,74,0.08)' : 'rgba(193,68,14,0.08)', color: msg.startsWith('✅') ? '#16a34a' : '#C1440E', fontSize:13, fontWeight:600, marginBottom:16, border:`1px solid ${msg.startsWith('✅') ? 'rgba(22,163,74,0.2)' : 'rgba(193,68,14,0.2)'}` }}>
                        {msg}
                    </div>
                )}

                {/* STUDENT: submit form */}
                {user?.role === 'student' && !mySubmission && (
                    <div style={{ backgroundColor:'#FFFFFF', borderRadius:16, padding:20, marginBottom:16, border:'1px solid rgba(44,24,16,0.07)' }}>
                        <h3 style={{ fontFamily:'Playfair Display, serif', color:'#2C1810', fontWeight:700, fontSize:18, marginBottom:16 }}>Submit Homework</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom:14 }}>
                                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(44,24,16,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:7 }}>Your answer / note</label>
                                <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Write your answer or notes here…"
                                    style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid rgba(44,24,16,0.12)', backgroundColor:'#F7F4EF', fontSize:14, color:'#2C1810', outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'Inter, sans-serif' }}
                                    onFocus={e => e.target.style.borderColor='#C1440E'}
                                    onBlur={e => e.target.style.borderColor='rgba(44,24,16,0.12)'}/>
                            </div>
                            <div style={{ marginBottom:18 }}>
                                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'rgba(44,24,16,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:7 }}>Attach file (optional)</label>
                                <label style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:12, border:'1.5px dashed rgba(44,24,16,0.2)', backgroundColor:'#F7F4EF', cursor:'pointer' }}>
                                    <Upload size={16} color="rgba(44,24,16,0.4)"/>
                                    <span style={{ fontSize:13, color: file ? '#C1440E' : 'rgba(44,24,16,0.5)', fontWeight: file ? 600 : 400 }}>
                                        {file ? file.name : 'Choose a file (PDF, image…)'}
                                    </span>
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => setFile(e.target.files[0])} style={{ display:'none' }}/>
                                </label>
                            </div>
                            <button type="submit" disabled={submitting}
                                style={{ width:'100%', padding:'13px', borderRadius:12, backgroundColor:'#C1440E', color:'#fff', fontSize:14, fontWeight:700, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity: submitting ? 0.8 : 1 }}>
                                <Upload size={15}/> {submitting ? 'Submitting…' : 'Submit Homework'}
                            </button>
                        </form>
                    </div>
                )}

                {/* STUDENT/PARENT: submitted view */}
                {(user?.role === 'student' || user?.role === 'parent') && mySubmission && (
                    <div style={{ backgroundColor:'rgba(22,163,74,0.06)', borderRadius:16, padding:20, marginBottom:16, border:'1px solid rgba(22,163,74,0.2)' }}>
                        <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:14 }}>
                            <CheckCircle size={20} color="#16a34a"/>
                            <span style={{ fontWeight:700, color:'#16a34a', fontSize:16 }}>Submitted</span>
                            <span style={{ color:'rgba(44,24,16,0.4)', fontSize:12 }}>{new Date(mySubmission.submittedAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        {mySubmission.note && <p style={{ color:'rgba(44,24,16,0.7)', fontSize:14, lineHeight:1.7, marginBottom:12 }}>{mySubmission.note}</p>}
                        {mySubmission.fileUrl && (
                            <a href={mySubmission.fileUrl} target="_blank" rel="noopener noreferrer"
                                style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#2563eb', fontSize:13, fontWeight:600, textDecoration:'none' }}>
                                <Download size={14}/> View Attachment
                            </a>
                        )}
                        {mySubmission.grade && (
                            <div style={{ marginTop:14, padding:'12px 16px', borderRadius:10, backgroundColor:'rgba(22,163,74,0.08)', border:'1px solid rgba(22,163,74,0.2)' }}>
                                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                                    <Star size={14} color="#E8A020" fill="#E8A020"/>
                                    <span style={{ fontWeight:700, color:'#2C1810', fontSize:15 }}>Grade: {mySubmission.grade}</span>
                                </div>
                                {mySubmission.feedback && <p style={{ color:'rgba(44,24,16,0.65)', fontSize:13, margin:0 }}>{mySubmission.feedback}</p>}
                            </div>
                        )}
                    </div>
                )}

                {/* SIR: submissions list */}
                {user?.role === 'sir' && (
                    <div style={{ backgroundColor:'#FFFFFF', borderRadius:16, padding:20, border:'1px solid rgba(44,24,16,0.07)' }}>
                        <h3 style={{ fontFamily:'Playfair Display, serif', color:'#2C1810', fontWeight:700, fontSize:18, marginBottom:16 }}>
                            Submissions ({hw.submissions?.length || 0})
                        </h3>
                        {(!hw.submissions || hw.submissions.length === 0) && (
                            <p style={{ color:'rgba(44,24,16,0.4)', fontSize:14, textAlign:'center', padding:'20px 0' }}>No submissions yet.</p>
                        )}
                        {hw.submissions?.map((sub, i) => {
                            const sid = sub.studentId?._id || sub.studentId;
                            const sidStr = sid?.toString();
                            const gd = gradeData[sidStr] || {};
                            return (
                                <div key={i} style={{ padding:'14px 0', borderBottom: i < hw.submissions.length-1 ? '1px solid rgba(44,24,16,0.06)' : 'none' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                                        <div style={{ width:32, height:32, borderRadius:'50%', backgroundColor:'rgba(193,68,14,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#C1440E' }}>
                                            {(sub.studentId?.name || 'S')[0]}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight:600, color:'#2C1810', fontSize:14, marginBottom:1 }}>{sub.studentId?.name || 'Student'}</p>
                                            <p style={{ color:'rgba(44,24,16,0.4)', fontSize:11 }}>{new Date(sub.submittedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                                        </div>
                                        {sub.grade && <span style={{ marginLeft:'auto', backgroundColor:'rgba(22,163,74,0.1)', color:'#16a34a', fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:50 }}>Grade: {sub.grade}</span>}
                                    </div>
                                    {sub.note && <p style={{ color:'rgba(44,24,16,0.6)', fontSize:13, lineHeight:1.6, marginBottom:10 }}>{sub.note}</p>}
                                    {sub.fileUrl && <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color:'#2563eb', fontSize:12, fontWeight:600, display:'inline-flex', alignItems:'center', gap:4, marginBottom:10, textDecoration:'none' }}><Download size={12}/> Attachment</a>}
                                    {!sub.grade && (
                                        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                            <input placeholder="Grade (e.g. A+, 8/10)" value={gd.grade||''} onChange={e => setGradeData(prev => ({ ...prev, [sidStr]: { ...gd, grade:e.target.value } }))}
                                                style={{ flex:1, minWidth:100, padding:'7px 12px', borderRadius:10, border:'1.5px solid rgba(44,24,16,0.12)', backgroundColor:'#F7F4EF', fontSize:13, color:'#2C1810', outline:'none' }}/>
                                            <input placeholder="Feedback (optional)" value={gd.feedback||''} onChange={e => setGradeData(prev => ({ ...prev, [sidStr]: { ...gd, feedback:e.target.value } }))}
                                                style={{ flex:2, minWidth:120, padding:'7px 12px', borderRadius:10, border:'1.5px solid rgba(44,24,16,0.12)', backgroundColor:'#F7F4EF', fontSize:13, color:'#2C1810', outline:'none' }}/>
                                            <button onClick={() => handleGrade(sidStr)}
                                                style={{ padding:'7px 16px', borderRadius:10, backgroundColor:'#C1440E', color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>
                                                Grade
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
