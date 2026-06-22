import { useEffect, useState } from 'react';
import { IndianRupee, Download, Plus, AlertCircle, Mail, Users, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function StatCard({ label, value, color, bg }) {
    return (
        <div className="rounded-2xl p-4 shadow-sm flex flex-col gap-1"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
            <p className="text-lg font-bold" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: '#2C1810', opacity: 0.5 }}>{label}</p>
        </div>
    );
}

export default function FeeList() {
    const { user } = useAuthStore();
    const isSir = user?.role === 'sir';
    const isParent = user?.role === 'parent';
    const [fees, setFees] = useState([]);
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [showBulk, setShowBulk] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [children, setChildren] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [adding, setAdding] = useState(false);
    const [bulking, setBulking] = useState(false);
    const [reminding, setReminding] = useState(false);
    const [error, setError] = useState('');
    const [bulkMsg, setBulkMsg] = useState('');

    const [form, setForm] = useState({
        studentId: '', amount: '', month: new Date().getMonth() + 1,
        year: new Date().getFullYear(), notes: ''
    });
    const [bulk, setBulk] = useState({
        amount: '', month: new Date().getMonth() + 1,
        year: new Date().getFullYear(), batchId: ''
    });

    const fetchFees = (overrideStudentId) => {
        const sid = overrideStudentId || selectedStudentId;
        let params = '';
        if (isParent && sid) {
            params = `?studentId=${sid}`;
        }
        return api.get(`/fees${params}`).then(r => setFees(r.data.fees || []));
    };

    useEffect(() => {
        if (isParent) {
            api.get('/users/my-children')
                .then(r => {
                    const kids = r.data.children || [];
                    setChildren(kids);
                    if (kids.length > 0) {
                        setSelectedStudentId(kids[0]._id);
                        fetchFees(kids[0]._id).finally(() => setLoading(false));
                    } else {
                        setLoading(false);
                    }
                })
                .catch(() => setLoading(false));
        } else {
            const p = [fetchFees()];
            if (isSir) {
                p.push(
                    api.get('/users/students').then(r => setStudents(r.data.students || [])),
                    api.get('/users/batches').then(r => setBatches(r.data.batches || [])),
                    api.get('/fees/analytics').then(r => setAnalytics(r.data)),
                );
            }
            Promise.all(p).finally(() => setLoading(false));
        }
    }, [user]);

    const handleMarkPaid = async (id) => {
        await api.patch(`/fees/${id}/pay`);
        fetchFees();
    };

    const handleDownloadInvoice = async (id) => {
        const res = await api.get(`/fees/${id}/invoice`, { responseType: 'blob' });
        const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        const a = document.createElement('a'); a.href = url;
        a.download = `invoice-${id}.pdf`; a.click();
        URL.revokeObjectURL(url);
    };

    const handleAddFee = async (e) => {
        e.preventDefault(); setAdding(true); setError('');
        try {
            await api.post('/fees', form);
            setShowAdd(false); fetchFees();
            setForm({ studentId: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), notes: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create fee');
        } finally { setAdding(false); }
    };

    const handleBulkCreate = async (e) => {
        e.preventDefault(); setBulking(true); setBulkMsg(''); setError('');
        try {
            const res = await api.post('/fees/bulk', bulk);
            setBulkMsg(res.data.message);
            fetchFees();
        } catch (err) {
            setError(err.response?.data?.message || 'Bulk create failed');
        } finally { setBulking(false); }
    };

    const handleSendReminders = async () => {
        if (!confirm('Send email reminders to all students with pending/overdue fees?')) return;
        setReminding(true);
        try {
            const res = await api.post('/fees/send-reminders');
            alert(res.data.message);
        } catch { alert('Failed to send reminders'); }
        finally { setReminding(false); }
    };

    if (loading) return <PageLoader />;

    const handleChildChange = (kidId) => {
        setSelectedStudentId(kidId);
        setLoading(true);
        fetchFees(kidId).finally(() => setLoading(false));
    };

    const uniqueYears = Array.from(new Set(fees.map(f => f.year))).sort((a, b) => b - a);

    const filtered = fees.filter(f => {
        if (filterStatus !== 'all' && f.status !== filterStatus) return false;
        if (!isSir) {
            if (selectedYear !== 'all' && f.year !== parseInt(selectedYear)) return false;
            if (selectedMonth !== 'all' && f.month !== parseInt(selectedMonth)) return false;
        }
        return true;
    });
    const totalPaid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
    const totalPending = fees.filter(f => f.status !== 'paid').reduce((s, f) => s + f.amount, 0);

    const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none";
    const inputStyle = { backgroundColor: '#F7F4EF', border: '1.5px solid transparent', color: '#2C1810' };

    return (
        <div className="min-h-screen pb-28 page-fade" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader
                title="Fee Management"
                subtitle={isSir ? `${fees.length} records` : undefined}
                action={isSir && (
                    <div className="flex gap-2">
                        <button onClick={handleSendReminders} disabled={reminding}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                            style={{ backgroundColor: '#F7F4EF', color: '#2C1810', border: '1px solid rgba(44,24,16,0.15)' }}>
                            <Mail size={13} /> {reminding ? 'Sending…' : 'Remind'}
                        </button>
                        <button onClick={() => setShowBulk(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                            style={{ backgroundColor: '#E8A020', color: '#2C1810' }}>
                            <Users size={13} /> Bulk
                        </button>
                        <button onClick={() => setShowAdd(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                            style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                            <Plus size={13} /> Add
                        </button>
                    </div>
                )}
            />

            {/* Child selector if parent */}
            {isParent && children.length > 0 && (
                <div className="px-6 mb-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {children.map((kid) => (
                        <button key={kid._id}
                            onClick={() => {
                                if (selectedStudentId !== kid._id) {
                                    handleChildChange(kid._id);
                                }
                            }}
                            className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                            style={{
                                backgroundColor: selectedStudentId === kid._id ? '#2C1810' : '#FFFFFF',
                                color: selectedStudentId === kid._id ? '#F5F0E8' : 'rgba(44,24,16,0.6)',
                                border: `1px solid ${selectedStudentId === kid._id ? '#2C1810' : 'rgba(44,24,16,0.12)'}`,
                            }}>
                            {kid.name.split(' ')[0]}
                        </button>
                    ))}
                </div>
            )}

            <div className="px-6 space-y-4">
                {/* Analytics */}
                {isSir && analytics && (
                    <div className="grid grid-cols-3 gap-3">
                        <StatCard label="Collected" value={`₹${((analytics.paid?.total||0)/1000).toFixed(1)}k`} color="#16a34a" />
                        <StatCard label="Pending" value={`₹${((analytics.pending?.total||0)/1000).toFixed(1)}k`} color="#E8A020" />
                        <StatCard label="Overdue" value={`₹${((analytics.overdue?.total||0)/1000).toFixed(1)}k`} color="#C1440E" />
                    </div>
                )}

                {!isSir && (
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard label="Total Paid" value={`₹${totalPaid.toLocaleString('en-IN')}`} color="#16a34a" />
                        <StatCard label="Outstanding" value={`₹${totalPending.toLocaleString('en-IN')}`} color="#C1440E" />
                    </div>
                )}

                {/* Filter pills & dropdowns */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {['all', 'paid', 'pending', 'overdue'].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                                style={{
                                    backgroundColor: filterStatus === s ? '#C1440E' : '#FFFFFF',
                                    color: filterStatus === s ? '#F5F0E8' : '#2C1810',
                                    border: `1px solid ${filterStatus === s ? '#C1440E' : 'rgba(193,68,14,0.12)'}`,
                                }}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>

                    {!isSir && (
                        <div className="flex gap-2">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-[#2C1810] outline-none shadow-sm cursor-pointer"
                                style={{ border: '1px solid rgba(44,24,16,0.12)' }}
                            >
                                <option value="all">All Years</option>
                                {uniqueYears.map(yr => (
                                    <option key={yr} value={yr}>{yr}</option>
                                ))}
                            </select>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-[#2C1810] outline-none shadow-sm cursor-pointer"
                                style={{ border: '1px solid rgba(44,24,16,0.12)' }}
                            >
                                <option value="all">All Months</option>
                                {MONTHS.map((m, idx) => (
                                    <option key={m} value={idx + 1}>{m}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Fee cards */}
                <div className="rounded-2xl overflow-hidden shadow-sm"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center py-14">
                            <IndianRupee size={40} color="#C1440E" opacity={0.15} />
                            <p className="text-sm mt-3 font-medium" style={{ color: '#2C1810', opacity: 0.5 }}>No fee records</p>
                        </div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: 'rgba(193,68,14,0.06)' }}>
                            {filtered.map((f) => (
                                <div key={f._id} className="px-5 py-4">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div>
                                            {isSir && f.studentId && (
                                                <p className="text-xs font-bold mb-0.5" style={{ color: '#C1440E' }}>
                                                    {f.studentId.name}
                                                </p>
                                            )}
                                            <p className="text-base font-bold" style={{ color: '#2C1810', fontFamily: 'Playfair Display, serif' }}>
                                                {MONTHS[f.month - 1]} {f.year}
                                            </p>
                                            {f.dueDate && f.status !== 'paid' && (
                                                <p className="text-xs mt-0.5" style={{ color: '#2C1810', opacity: 0.4 }}>
                                                    Due {new Date(f.dueDate).toLocaleDateString('en-IN')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <p className="text-xl font-bold" style={{ color: '#2C1810' }}>
                                                ₹{f.amount.toLocaleString('en-IN')}
                                            </p>
                                            <Badge label={f.status} variant={f.status} />
                                        </div>
                                    </div>

                                    {f.status === 'overdue' && (
                                        <div className="flex items-center gap-1.5 mb-3 px-3 py-2 rounded-lg"
                                            style={{ backgroundColor: 'rgba(193,68,14,0.06)' }}>
                                            <AlertCircle size={12} color="#C1440E" />
                                            <p className="text-xs" style={{ color: '#C1440E' }}>Payment is overdue!</p>
                                        </div>
                                    )}

                                    {f.status === 'paid' && f.paidAt && (
                                        <div className="flex items-center gap-1.5 mb-3">
                                            <CheckCircle2 size={12} color="#16a34a" />
                                            <p className="text-xs" style={{ color: '#16a34a' }}>
                                                Paid on {new Date(f.paidAt).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        {isSir && f.status !== 'paid' && (
                                            <button onClick={() => handleMarkPaid(f._id)}
                                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                                                style={{ backgroundColor: '#16a34a', color: '#FFFFFF' }}>
                                                ✓ Mark Paid
                                            </button>
                                        )}
                                        <button onClick={() => handleDownloadInvoice(f._id)}
                                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                                            style={{ backgroundColor: '#F7F4EF', color: '#2C1810' }}>
                                            <Download size={13} /> Invoice
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Fee Modal */}
            <Modal open={showAdd} onClose={() => { setShowAdd(false); setError(''); }} title="Add Fee Entry">
                <form onSubmit={handleAddFee} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Student *</label>
                        <select value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))}
                            className={inputCls} style={inputStyle} required>
                            <option value="">Select student</option>
                            {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Amount *</label>
                            <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                                placeholder="₹" required className={inputCls} style={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Month *</label>
                            <select value={form.month} onChange={e => setForm(p => ({ ...p, month: +e.target.value }))}
                                className={inputCls} style={inputStyle}>
                                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m.slice(0, 3)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Year *</label>
                            <input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: +e.target.value }))}
                                className={inputCls} style={inputStyle} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Notes</label>
                        <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                            placeholder="Optional note..." className={inputCls} style={inputStyle} />
                    </div>
                    {error && <p className="text-xs py-2 text-center rounded-lg" style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>{error}</p>}
                    <button type="submit" disabled={adding}
                        className="w-full py-3.5 rounded-xl font-semibold text-sm"
                        style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                        {adding ? 'Creating…' : 'Create Fee Record'}
                    </button>
                </form>
            </Modal>

            {/* Bulk Create Modal */}
            <Modal open={showBulk} onClose={() => { setShowBulk(false); setError(''); setBulkMsg(''); }} title="Bulk Fee Creation">
                <form onSubmit={handleBulkCreate} className="space-y-4">
                    <p className="text-xs leading-relaxed px-1" style={{ color: '#2C1810', opacity: 0.6 }}>
                        Create fee entries for all active students at once. Existing entries for the same month/year are skipped.
                    </p>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Batch (optional)</label>
                        <select value={bulk.batchId} onChange={e => setBulk(p => ({ ...p, batchId: e.target.value }))}
                            className={inputCls} style={inputStyle}>
                            <option value="">All active students</option>
                            {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Amount *</label>
                            <input type="number" value={bulk.amount} onChange={e => setBulk(p => ({ ...p, amount: e.target.value }))}
                                placeholder="₹" required className={inputCls} style={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Month *</label>
                            <select value={bulk.month} onChange={e => setBulk(p => ({ ...p, month: +e.target.value }))}
                                className={inputCls} style={inputStyle}>
                                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m.slice(0, 3)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Year *</label>
                            <input type="number" value={bulk.year} onChange={e => setBulk(p => ({ ...p, year: +e.target.value }))}
                                className={inputCls} style={inputStyle} />
                        </div>
                    </div>
                    {error && <p className="text-xs py-2 text-center rounded-lg" style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>{error}</p>}
                    {bulkMsg && (
                        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: 'rgba(22,163,74,0.08)' }}>
                            <CheckCircle2 size={14} color="#16a34a" />
                            <p className="text-xs" style={{ color: '#16a34a' }}>{bulkMsg}</p>
                        </div>
                    )}
                    <button type="submit" disabled={bulking}
                        className="w-full py-3.5 rounded-xl font-semibold text-sm"
                        style={{ backgroundColor: '#E8A020', color: '#2C1810' }}>
                        {bulking ? 'Creating…' : 'Create Fees for All Students'}
                    </button>
                </form>
            </Modal>

            <BottomNav />
        </div>
    );
}
