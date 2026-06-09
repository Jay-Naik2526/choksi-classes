import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Clock, CheckCircle, AlertCircle, ChevronRight, Calendar } from 'lucide-react';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoader } from '../../components/ui/Spinner';
import BottomNav from '../../components/layout/BottomNav';

function statusInfo(hw, mySubmission, role) {
    const now = new Date();
    const due = new Date(hw.dueDate);
    const overdue = now > due;
    if (role === 'sir') {
        const count = hw.submissions?.length || 0;
        return { label: `${count} submitted`, color:'#2563eb', bg:'rgba(37,99,235,0.08)', icon: BookOpen };
    }
    if (mySubmission) {
        if (mySubmission.grade) return { label:`Graded: ${mySubmission.grade}`, color:'#16a34a', bg:'rgba(22,163,74,0.08)', icon: CheckCircle };
        return { label:'Submitted', color:'#2563eb', bg:'rgba(37,99,235,0.08)', icon: CheckCircle };
    }
    if (overdue) return { label:'Overdue', color:'#C1440E', bg:'rgba(193,68,14,0.08)', icon: AlertCircle };
    const days = Math.ceil((due - now) / 86400000);
    return { label: days === 0 ? 'Due today!' : `${days}d left`, color: days <= 2 ? '#E8A020' : '#16a34a', bg: days <= 2 ? 'rgba(232,160,32,0.08)' : 'rgba(22,163,74,0.08)', icon: Clock };
}

export default function HomeworkList() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [homeworks, setHomeworks] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [filter, setFilter]       = useState('all'); // all | pending | submitted

    useEffect(() => {
        api.get('/homework')
            .then(r => setHomeworks(r.data.homeworks || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = homeworks.filter(hw => {
        if (filter === 'pending')   return user?.role === 'student' && !hw.mySubmission;
        if (filter === 'submitted') return user?.role === 'student' && hw.mySubmission;
        return true;
    });

    if (loading) return <PageLoader/>;

    return (
        <div style={{ minHeight:'100vh', backgroundColor:'#F7F4EF', paddingBottom:80 }}>
            <PageHeader title="Homework" subtitle={`${homeworks.length} assignments`}
                action={user?.role === 'sir' ? { label:'Assign', icon: Plus, onClick:() => navigate('/homework/create') } : null}/>

            {/* Filter tabs */}
            {user?.role === 'student' && (
                <div style={{ padding:'12px 20px 0', display:'flex', gap:8 }}>
                    {['all','pending','submitted'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            style={{ padding:'6px 16px', borderRadius:50, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, textTransform:'capitalize',
                                backgroundColor: filter === f ? '#C1440E' : 'rgba(44,24,16,0.07)',
                                color: filter === f ? '#fff' : 'rgba(44,24,16,0.6)' }}>
                            {f}
                        </button>
                    ))}
                </div>
            )}

            <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
                {filtered.length === 0 && (
                    <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(44,24,16,0.4)' }}>
                        <BookOpen size={40} style={{ margin:'0 auto 12px', display:'block', opacity:.3 }}/>
                        <p style={{ fontSize:15, fontWeight:500 }}>No homework {filter !== 'all' ? filter : 'assigned'} yet</p>
                    </div>
                )}

                {filtered.map(hw => {
                    const s = statusInfo(hw, hw.mySubmission, user?.role);
                    const due = new Date(hw.dueDate);
                    return (
                        <div key={hw._id} onClick={() => navigate(`/homework/${hw._id}`)}
                            style={{ backgroundColor:'#FFFFFF', borderRadius:16, padding:18, border:'1px solid rgba(44,24,16,0.07)', boxShadow:'0 2px 12px rgba(44,24,16,0.04)', cursor:'pointer', display:'flex', alignItems:'center', gap:14, transition:'transform .15s ease, box-shadow .15s ease' }}
                            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(44,24,16,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 12px rgba(44,24,16,0.04)'; }}>
                            <div style={{ width:44, height:44, borderRadius:12, backgroundColor:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <s.icon size={20} color={s.color}/>
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                                <p style={{ fontWeight:700, color:'#2C1810', fontSize:15, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{hw.title}</p>
                                <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                                    {hw.subject && <span style={{ fontSize:11, color:'rgba(44,24,16,0.5)', fontWeight:500 }}>{hw.subject}</span>}
                                    {hw.batchId && <span style={{ fontSize:11, color:'rgba(44,24,16,0.4)' }}>{hw.batchId.name}</span>}
                                    <span style={{ fontSize:11, color:'rgba(44,24,16,0.4)', display:'flex', alignItems:'center', gap:3 }}>
                                        <Calendar size={10}/> Due {due.toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
                                <span style={{ fontSize:11, fontWeight:600, color:s.color, backgroundColor:s.bg, padding:'3px 10px', borderRadius:50 }}>{s.label}</span>
                                <ChevronRight size={14} color="rgba(44,24,16,0.3)"/>
                            </div>
                        </div>
                    );
                })}
            </div>
            <BottomNav />
        </div>
    );
}
