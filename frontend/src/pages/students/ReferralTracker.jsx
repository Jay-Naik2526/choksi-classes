import { useState, useEffect } from 'react';
import { Trophy, Users, Star } from 'lucide-react';
import api from '../../utils/api';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoader } from '../../components/ui/Spinner';

const MEDAL = ['🥇','🥈','🥉'];
const MEDAL_COLORS = ['#E8A020','#9CA3AF','#C1440E'];

export default function ReferralTracker() {
    const [data, setData]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        api.get('/users/referrals')
            .then(r => setData(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <PageLoader/>;

    const { leaderboard = [], totalReferred = 0 } = data || {};

    return (
        <div style={{ minHeight:'100vh', backgroundColor:'#F7F4EF', paddingBottom:80 }}>
            <PageHeader title="Referral Tracker" subtitle={`${totalReferred} students referred`}/>

            <div style={{ padding:'16px 20px', maxWidth:700, margin:'0 auto' }}>
                {/* Summary cards */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                    {[
                        { label:'Total Referred', value:totalReferred, color:'#C1440E', icon: Users },
                        { label:'Referrers',       value:leaderboard.length, color:'#E8A020', icon: Trophy },
                    ].map((c, i) => (
                        <div key={i} style={{ backgroundColor:'#FFFFFF', borderRadius:16, padding:20, border:'1px solid rgba(44,24,16,0.07)' }}>
                            <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
                                <div style={{ width:36, height:36, borderRadius:10, backgroundColor:`${c.color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                    <c.icon size={18} color={c.color}/>
                                </div>
                                <p style={{ color:'rgba(44,24,16,0.5)', fontSize:12, fontWeight:600 }}>{c.label}</p>
                            </div>
                            <p style={{ fontFamily:'Playfair Display, serif', fontSize:32, fontWeight:900, color:c.color, lineHeight:1 }}>{c.value}</p>
                        </div>
                    ))}
                </div>

                {leaderboard.length === 0 && (
                    <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(44,24,16,0.4)' }}>
                        <Trophy size={40} style={{ margin:'0 auto 12px', display:'block', opacity:.3 }}/>
                        <p style={{ fontSize:15, fontWeight:500 }}>No referrals recorded yet.</p>
                        <p style={{ fontSize:13, marginTop:8 }}>When you add a student, set the "Referred by" field to start tracking.</p>
                    </div>
                )}

                {leaderboard.map((entry, idx) => {
                    const medal = MEDAL[idx] || `#${idx+1}`;
                    const mcolor = MEDAL_COLORS[idx] || 'rgba(44,24,16,0.5)';
                    const isOpen = expanded === idx;
                    return (
                        <div key={idx} style={{ backgroundColor:'#FFFFFF', borderRadius:16, marginBottom:10, border:`1px solid ${idx < 3 ? mcolor+'30' : 'rgba(44,24,16,0.07)'}`, overflow:'hidden', boxShadow: idx < 3 ? `0 2px 16px ${mcolor}18` : 'none' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', cursor:'pointer' }}
                                onClick={() => setExpanded(isOpen ? null : idx)}>
                                <span style={{ fontSize:24, width:36, textAlign:'center' }}>{medal}</span>
                                <div style={{ flex:1 }}>
                                    <p style={{ fontWeight:700, color:'#2C1810', fontSize:15 }}>{entry.referrer.name}</p>
                                    {entry.referrer.rollNumber && <p style={{ fontSize:12, color:'rgba(44,24,16,0.4)' }}>Roll #{entry.referrer.rollNumber}</p>}
                                </div>
                                <div style={{ textAlign:'right' }}>
                                    <p style={{ fontFamily:'Playfair Display, serif', fontSize:26, fontWeight:900, color:mcolor, lineHeight:1 }}>{entry.count}</p>
                                    <p style={{ fontSize:11, color:'rgba(44,24,16,0.4)' }}>referrals</p>
                                </div>
                            </div>

                            {isOpen && (
                                <div style={{ borderTop:'1px solid rgba(44,24,16,0.06)', padding:'12px 18px' }}>
                                    <p style={{ fontSize:11, fontWeight:700, color:'rgba(44,24,16,0.4)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Referred students</p>
                                    {entry.students.map((s, si) => (
                                        <div key={si} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom: si < entry.students.length-1 ? '1px solid rgba(44,24,16,0.04)' : 'none' }}>
                                            <div style={{ width:28, height:28, borderRadius:'50%', backgroundColor:'rgba(193,68,14,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#C1440E' }}>
                                                {s.name[0]}
                                            </div>
                                            <span style={{ flex:1, fontSize:13, color:'#2C1810', fontWeight:500 }}>{s.name}</span>
                                            {s.rollNumber && <span style={{ fontSize:11, color:'rgba(44,24,16,0.4)' }}>#{s.rollNumber}</span>}
                                            <span style={{ fontSize:11, color:'rgba(44,24,16,0.4)' }}>{new Date(s.joinedAt).toLocaleDateString('en-IN', { month:'short', year:'2-digit' })}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
