import { useEffect, useState } from 'react';
import {
    Plus, Search, Users, BookOpen, UserCheck, ChevronDown, ChevronUp,
    Edit2, Trash2, UserX, UserPlus, X, Check, Mail, Phone, Hash, FileDown, Upload, AlertCircle
} from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoader } from '../../components/ui/Spinner';
import api from '../../utils/api';

// ─── CSV helpers (no external dependency) ────────────────────────────────────
// RFC-style parser: handles quoted fields, escaped quotes, commas & newlines.
function parseCSV(text) {
    const rows = [];
    let field = '', record = [], inQuotes = false;
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"') {
                if (text[i + 1] === '"') { field += '"'; i++; }
                else inQuotes = false;
            } else field += c;
        } else if (c === '"') inQuotes = true;
        else if (c === ',') { record.push(field); field = ''; }
        else if (c === '\n') { record.push(field); rows.push(record); record = []; field = ''; }
        else field += c;
    }
    if (field.length > 0 || record.length > 0) { record.push(field); rows.push(record); }
    return rows.filter(r => r.some(c => c.trim() !== ''));
}

// Map common header spellings → canonical keys the API expects
const HEADER_MAP = {
    'name': 'name', 'full name': 'name', 'student name': 'name',
    'email': 'email', 'email address': 'email',
    'password': 'password', 'temp password': 'password',
    'phone': 'phone', 'mobile': 'phone', 'phone number': 'phone', 'contact': 'phone',
    'roll': 'rollNumber', 'roll number': 'rollNumber', 'rollnumber': 'rollNumber', 'roll no': 'rollNumber',
    'address': 'address',
    'batch': 'batches', 'batches': 'batches', 'batch name': 'batches', 'batch names': 'batches',
};

function csvToStudents(text) {
    const rows = parseCSV(text);
    if (rows.length < 2) return [];
    const headers = rows[0].map(h => HEADER_MAP[h.trim().toLowerCase()] || null);
    return rows.slice(1).map(cols => {
        const obj = {};
        headers.forEach((key, i) => { if (key) obj[key] = (cols[i] || '').trim(); });
        return obj;
    });
}

const CSV_TEMPLATE =
    'name,email,password,phone,rollNumber,address,batches\n' +
    'Ravi Patel,ravi@example.com,changeme123,9876543210,42,Navsari,"Science Batch A;Maths"\n' +
    'Priya Shah,priya@example.com,changeme123,9876500000,43,Bilimora,Science Batch A\n';

// ─── Reusable field ──────────────────────────────────────────────────────────
const Field = ({ label, type = 'text', value, onChange, required, placeholder, children }) => (
    <div>
        <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>
            {label}{required && ' *'}
        </label>
        {children || (
            <input type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ backgroundColor: '#F7F4EF', border: '1.5px solid transparent', color: '#2C1810' }}
                onFocus={e => e.target.style.borderColor = '#C1440E'}
                onBlur={e => e.target.style.borderColor = 'transparent'} />
        )}
    </div>
);

// ─── Slide-up modal sheet ────────────────────────────────────────────────────
function Sheet({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
            {/* dim overlay */}
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(44,24,16,0.4)' }} />
            <div className="relative w-full rounded-t-3xl shadow-2xl flex flex-col"
                style={{ backgroundColor: '#FFFFFF', maxHeight: '88vh' }}
                onClick={e => e.stopPropagation()}>
                {/* sticky header */}
                <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
                    style={{ borderColor: 'rgba(193,68,14,0.08)' }}>
                    <h2 className="text-base font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl" style={{ backgroundColor: '#F7F4EF' }}>
                        <X size={16} color="#2C1810" />
                    </button>
                </div>
                {/* scrollable body — bottom padding clears the fixed bottom nav (≈65px) */}
                <div className="px-6 pt-5 overflow-y-auto flex-1" style={{ paddingBottom: '90px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

// ─── STUDENTS TAB ────────────────────────────────────────────────────────────
function StudentsTab({ students, batches, parents, onRefresh }) {
    const [search, setSearch] = useState('');
    const [batchFilter, setBatchFilter] = useState('all');
    const [expanded, setExpanded] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', rollNumber: '', batchIds: [], address: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Bulk import
    const [showImport, setShowImport] = useState(false);
    const [importRows, setImportRows] = useState([]);
    const [importFileName, setImportFileName] = useState('');
    const [importError, setImportError] = useState('');
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const resetImport = () => {
        setImportRows([]); setImportFileName(''); setImportError('');
        setImporting(false); setImportResult(null);
    };

    const handleImportFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImportError(''); setImportResult(null);
        setImportFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const rows = csvToStudents(String(reader.result));
                const valid = rows.filter(r => r.name || r.email);
                if (valid.length === 0) {
                    setImportError('No rows found. Check the header row matches the template.');
                    setImportRows([]);
                } else {
                    setImportRows(valid);
                }
            } catch (_) {
                setImportError('Could not read this CSV file.');
                setImportRows([]);
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // allow re-selecting the same file
    };

    const downloadTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'student-import-template.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = async () => {
        if (importRows.length === 0) return;
        setImporting(true); setImportError('');
        try {
            const res = await api.post('/users/students/bulk-import', { students: importRows });
            setImportResult(res.data);
            await onRefresh();
        } catch (err) {
            setImportError(err.response?.data?.message || 'Import failed');
        } finally {
            setImporting(false);
        }
    };

    const filtered = students.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            (s.rollNumber && String(s.rollNumber).includes(search)) ||
            (s.email && s.email.toLowerCase().includes(search.toLowerCase()));
        const matchBatch = batchFilter === 'all' || s.batchIds?.some(b => (b._id || b) === batchFilter);
        return matchSearch && matchBatch;
    });

    const openAdd = () => {
        setForm({ name: '', email: '', password: '', phone: '', rollNumber: '', batchIds: [], address: '' });
        setError(''); setShowAdd(true);
    };

    const openEdit = (s) => {
        setEditStudent(s);
        setForm({
            name: s.name || '', phone: s.phone || '', rollNumber: s.rollNumber || '',
            address: s.address || '', batchIds: s.batchIds?.map(b => b._id || b) || [],
        });
        setError('');
    };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true); setError('');
        try {
            if (editStudent) {
                await api.patch(`/users/students/${editStudent._id}`, form);
            } else {
                await api.post('/users/students', form);
            }
            await onRefresh();
            setShowAdd(false); setEditStudent(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save');
        } finally { setSaving(false); }
    };

    const toggleActive = async (s) => {
        await api.patch(`/users/students/${s._id}`, { isActive: !s.isActive });
        onRefresh();
    };

    const toggleBatch = (id) => setForm(p => ({
        ...p, batchIds: p.batchIds.includes(id) ? p.batchIds.filter(b => b !== id) : [...p.batchIds, id]
    }));

    const getStudentParent = (studentId) =>
        parents.find(p => p.childIds?.some(c => (c._id || c) === studentId));

    const downloadProgressReport = async (id, name) => {
        try {
            const res = await api.get(`/users/students/${id}/progress-report`, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const a = document.createElement('a'); a.href = url;
            a.download = `progress-${name.replace(/ /g,'_')}.pdf`; a.click();
            URL.revokeObjectURL(url);
        } catch { alert('Failed to generate report'); }
    };

    return (
        <div className="space-y-4">
            {/* Search + filter */}
            <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(193,68,14,0.12)' }}>
                    <Search size={14} color="#C1440E" opacity={0.6} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, roll, email..."
                        className="flex-1 text-sm outline-none bg-transparent"
                        style={{ color: '#2C1810' }} />
                </div>
                <button onClick={() => { resetImport(); setShowImport(true); }}
                    className="flex items-center justify-center px-3 py-2.5 rounded-xl flex-shrink-0"
                    style={{ backgroundColor: 'rgba(193,68,14,0.08)', color: '#C1440E' }}
                    title="Import students from CSV">
                    <Upload size={15} />
                </button>
                <button onClick={openAdd}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                    <Plus size={15} /> Add
                </button>
            </div>

            {/* Batch filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {[{ _id: 'all', name: 'All Batches' }, ...batches].map(b => (
                    <button key={b._id} onClick={() => setBatchFilter(b._id)}
                        className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                            backgroundColor: batchFilter === b._id ? '#2C1810' : '#FFFFFF',
                            color: batchFilter === b._id ? '#F5F0E8' : '#2C1810',
                            border: `1px solid ${batchFilter === b._id ? '#2C1810' : 'rgba(44,24,16,0.12)'}`,
                        }}>
                        {b.name}
                    </button>
                ))}
            </div>

            <p className="text-xs px-1" style={{ color: '#2C1810', opacity: 0.5 }}>
                {filtered.length} student{filtered.length !== 1 ? 's' : ''}
            </p>

            {/* Student cards */}
            {filtered.length === 0 ? (
                <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <Users size={36} color="#C1440E" opacity={0.2} className="mx-auto mb-2" />
                    <p className="text-sm" style={{ color: '#2C1810', opacity: 0.5 }}>No students found</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(s => {
                        const isOpen = expanded === s._id;
                        const linkedParent = getStudentParent(s._id);
                        return (
                            <div key={s._id} className="rounded-2xl overflow-hidden shadow-sm"
                                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                                <div className="px-4 py-3.5 flex items-center gap-3 cursor-pointer"
                                    onClick={() => setExpanded(isOpen ? null : s._id)}>
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: s.isActive ? 'rgba(193,68,14,0.1)' : 'rgba(44,24,16,0.06)' }}>
                                        <span className="text-sm font-bold" style={{ color: s.isActive ? '#C1440E' : '#94a3b8' }}>
                                            {s.name?.[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-bold truncate" style={{ color: '#2C1810' }}>{s.name}</p>
                                            {!s.isActive && (
                                                <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: 'rgba(148,163,184,0.15)', color: '#94a3b8' }}>
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {s.rollNumber && (
                                                <span className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>
                                                    #{s.rollNumber}
                                                </span>
                                            )}
                                            {s.batchIds?.length > 0 && (
                                                <span className="text-xs" style={{ color: '#C1440E', opacity: 0.7 }}>
                                                    {s.batchIds.map(b => b.name || b).join(', ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {isOpen ? <ChevronUp size={14} color="#2C1810" opacity={0.4} /> : <ChevronDown size={14} color="#2C1810" opacity={0.4} />}
                                </div>

                                {isOpen && (
                                    <div className="px-4 pb-4 border-t space-y-3" style={{ borderColor: 'rgba(193,68,14,0.06)' }}>
                                        <div className="pt-3 space-y-1.5">
                                            {s.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail size={12} color="#C1440E" opacity={0.6} />
                                                    <p className="text-xs" style={{ color: '#2C1810', opacity: 0.6 }}>{s.email}</p>
                                                </div>
                                            )}
                                            {s.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={12} color="#C1440E" opacity={0.6} />
                                                    <p className="text-xs" style={{ color: '#2C1810', opacity: 0.6 }}>{s.phone}</p>
                                                </div>
                                            )}
                                            {linkedParent && (
                                                <div className="flex items-center gap-2">
                                                    <UserCheck size={12} color="#16a34a" />
                                                    <p className="text-xs font-medium" style={{ color: '#16a34a' }}>
                                                        Parent: {linkedParent.name}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <button onClick={() => openEdit(s)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                                                style={{ backgroundColor: 'rgba(193,68,14,0.08)', color: '#C1440E' }}>
                                                <Edit2 size={12} /> Edit
                                            </button>
                                            <button onClick={() => downloadProgressReport(s._id, s.name)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                                                style={{ backgroundColor: 'rgba(44,24,16,0.06)', color: '#2C1810' }}>
                                                <FileDown size={12} /> Report
                                            </button>
                                            <button onClick={() => toggleActive(s)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                                                style={{
                                                    backgroundColor: s.isActive ? 'rgba(148,163,184,0.12)' : 'rgba(22,163,74,0.1)',
                                                    color: s.isActive ? '#94a3b8' : '#16a34a',
                                                }}>
                                                {s.isActive ? <><UserX size={12} /> Deactivate</> : <><UserPlus size={12} /> Activate</>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add / Edit Sheet */}
            <Sheet open={showAdd || !!editStudent} onClose={() => { setShowAdd(false); setEditStudent(null); }}
                title={editStudent ? `Edit — ${editStudent.name}` : 'Add New Student'}>
                <form onSubmit={handleSave} className="space-y-4">
                    <Field label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                    {!editStudent && (
                        <>
                            <Field label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                            <Field label="Password" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required placeholder="Min 6 characters" />
                        </>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Phone" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Mobile number" />
                        <Field label="Roll Number" value={form.rollNumber} onChange={e => setForm(p => ({ ...p, rollNumber: e.target.value }))} placeholder="e.g. 42" />
                    </div>
                    <Field label="Address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Optional" />

                    {/* Batch assignment */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#2C1810', opacity: 0.6 }}>
                            Assign Batches
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {batches.map(b => {
                                const selected = form.batchIds.includes(b._id);
                                return (
                                    <button key={b._id} type="button" onClick={() => toggleBatch(b._id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                                        style={{
                                            backgroundColor: selected ? '#C1440E' : '#F5F0E8',
                                            color: selected ? '#F5F0E8' : '#2C1810',
                                        }}>
                                        {selected && <Check size={11} />}
                                        {b.name} · {b.subject}
                                    </button>
                                );
                            })}
                            {batches.length === 0 && <p className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>No batches created yet</p>}
                        </div>
                    </div>

                    {error && <p className="text-xs py-2 text-center rounded-xl" style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>{error}</p>}
                    <button type="submit" disabled={saving}
                        className="w-full py-3 rounded-xl font-semibold text-sm"
                        style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                        {saving ? 'Saving...' : editStudent ? 'Save Changes' : 'Create Student'}
                    </button>
                    {!editStudent && (
                        <p className="text-xs text-center" style={{ color: '#2C1810', opacity: 0.4 }}>
                            Login credentials will be emailed to the student
                        </p>
                    )}
                </form>
            </Sheet>

            {/* Bulk import Sheet */}
            <Sheet open={showImport} onClose={() => setShowImport(false)} title="Import Students (CSV)">
                {importResult ? (
                    // ── Results summary ──
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
                                <p className="font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#16a34a', fontSize: 26 }}>{importResult.created}</p>
                                <p className="text-xs font-medium" style={{ color: '#2C1810' }}>Created</p>
                            </div>
                            <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.25)' }}>
                                <p className="font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#b45309', fontSize: 26 }}>{importResult.skipped}</p>
                                <p className="text-xs font-medium" style={{ color: '#2C1810' }}>Skipped</p>
                            </div>
                        </div>
                        {importResult.errors?.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#2C1810', opacity: 0.6 }}>
                                    {importResult.errors.length} row(s) needed attention
                                </p>
                                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                                    {importResult.errors.map((e, i) => (
                                        <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#FEF2F2' }}>
                                            <AlertCircle size={13} color="#C1440E" className="flex-shrink-0 mt-0.5" />
                                            <p className="text-xs" style={{ color: '#2C1810' }}>
                                                <strong>Row {e.row}</strong> ({e.email}): {e.reason}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button onClick={() => setShowImport(false)}
                            className="w-full py-3 rounded-xl font-semibold text-sm"
                            style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                            Done
                        </button>
                    </div>
                ) : (
                    // ── Upload + preview ──
                    <div className="space-y-4">
                        <div className="rounded-xl p-3" style={{ backgroundColor: '#F7F4EF', border: '1px solid rgba(193,68,14,0.1)' }}>
                            <p className="text-xs" style={{ color: '#2C1810', opacity: 0.7 }}>
                                Upload a CSV with columns: <strong>name, email, password</strong> (required), and optional phone, rollNumber, address, batches.
                                Use <strong>;</strong> to separate multiple batch names. Existing emails are skipped.
                            </p>
                            <button onClick={downloadTemplate}
                                className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold" style={{ color: '#C1440E' }}>
                                <FileDown size={13} /> Download template
                            </button>
                        </div>

                        <label className="flex flex-col items-center justify-center gap-2 py-7 rounded-2xl cursor-pointer transition-all"
                            style={{ border: '2px dashed rgba(193,68,14,0.3)', backgroundColor: 'rgba(193,68,14,0.03)' }}>
                            <Upload size={22} color="#C1440E" />
                            <span className="text-sm font-medium" style={{ color: '#2C1810' }}>
                                {importFileName || 'Choose CSV file'}
                            </span>
                            <input type="file" accept=".csv,text/csv" onChange={handleImportFile} className="hidden" />
                        </label>

                        {importError && (
                            <p className="text-xs py-2 px-3 text-center rounded-xl" style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>{importError}</p>
                        )}

                        {importRows.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold mb-2" style={{ color: '#2C1810' }}>
                                    {importRows.length} student{importRows.length !== 1 ? 's' : ''} ready · preview
                                </p>
                                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(44,24,16,0.08)' }}>
                                    {importRows.slice(0, 5).map((r, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-2"
                                            style={{ backgroundColor: i % 2 ? '#F7F4EF' : '#FFFFFF' }}>
                                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                style={{ backgroundColor: 'rgba(193,68,14,0.1)', color: '#C1440E' }}>
                                                {r.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold truncate" style={{ color: '#2C1810' }}>{r.name || '(no name)'}</p>
                                                <p className="text-xs truncate" style={{ color: '#2C1810', opacity: 0.45 }}>{r.email || '(no email)'}</p>
                                            </div>
                                            {r.batches && <span className="text-xs flex-shrink-0" style={{ color: '#C1440E', opacity: 0.7 }}>{r.batches}</span>}
                                        </div>
                                    ))}
                                    {importRows.length > 5 && (
                                        <div className="px-3 py-2 text-center text-xs" style={{ color: '#2C1810', opacity: 0.45, backgroundColor: '#FFFFFF' }}>
                                            + {importRows.length - 5} more
                                        </div>
                                    )}
                                </div>
                                <button onClick={handleImport} disabled={importing}
                                    className="w-full py-3 rounded-xl font-semibold text-sm mt-3"
                                    style={{ backgroundColor: '#C1440E', color: '#F5F0E8', opacity: importing ? 0.6 : 1 }}>
                                    {importing ? 'Importing…' : `Import ${importRows.length} student${importRows.length !== 1 ? 's' : ''}`}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Sheet>
        </div>
    );
}

// ─── BATCHES TAB ─────────────────────────────────────────────────────────────
function BatchesTab({ batches, students, onRefresh }) {
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name: '', subject: '', schedule: '', capacity: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(null);

    const handleAdd = async (e) => {
        e.preventDefault(); setSaving(true); setError('');
        try {
            await api.post('/users/batches', form);
            await onRefresh();
            setShowAdd(false);
            setForm({ name: '', subject: '', schedule: '', capacity: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this batch? Students will be removed from it.')) return;
        await api.delete(`/users/batches/${id}`);
        onRefresh();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button onClick={() => setShowAdd(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                    <Plus size={15} /> Create Batch
                </button>
            </div>

            {batches.length === 0 ? (
                <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <BookOpen size={36} color="#C1440E" opacity={0.2} className="mx-auto mb-2" />
                    <p className="text-sm" style={{ color: '#2C1810', opacity: 0.5 }}>No batches yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {batches.map(b => {
                        const batchStudents = students.filter(s =>
                            s.batchIds?.some(bid => (bid._id || bid) === b._id)
                        );
                        const isOpen = expanded === b._id;
                        return (
                            <div key={b._id} className="rounded-2xl overflow-hidden shadow-sm"
                                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                                <div className="px-4 py-4 flex items-center gap-3 cursor-pointer"
                                    onClick={() => setExpanded(isOpen ? null : b._id)}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: 'rgba(193,68,14,0.1)' }}>
                                        <BookOpen size={16} color="#C1440E" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold" style={{ color: '#2C1810' }}>{b.name}</p>
                                        <p className="text-xs" style={{ color: '#2C1810', opacity: 0.5 }}>
                                            {b.subject}{b.schedule ? ` · ${b.schedule}` : ''}
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0"
                                        style={{ backgroundColor: 'rgba(193,68,14,0.08)', color: '#C1440E' }}>
                                        {batchStudents.length} students
                                    </span>
                                    {isOpen ? <ChevronUp size={14} color="#2C1810" opacity={0.4} /> : <ChevronDown size={14} color="#2C1810" opacity={0.4} />}
                                </div>

                                {isOpen && (
                                    <div className="px-4 pb-4 border-t" style={{ borderColor: 'rgba(193,68,14,0.06)' }}>
                                        {batchStudents.length > 0 ? (
                                            <div className="pt-3 space-y-1.5">
                                                {batchStudents.map(s => (
                                                    <div key={s._id} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                                        style={{ backgroundColor: '#F7F4EF' }}>
                                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                                                            style={{ backgroundColor: 'rgba(193,68,14,0.15)', color: '#C1440E' }}>
                                                            {s.name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <p className="text-xs font-medium flex-1" style={{ color: '#2C1810' }}>{s.name}</p>
                                                        {s.rollNumber && <span className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>#{s.rollNumber}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="pt-3 text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>No students in this batch</p>
                                        )}
                                        <button onClick={() => handleDelete(b._id)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium mt-3"
                                            style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>
                                            <Trash2 size={12} /> Delete Batch
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <Sheet open={showAdd} onClose={() => setShowAdd(false)} title="Create New Batch">
                <form onSubmit={handleAdd} className="space-y-4">
                    <Field label="Batch Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Science Batch A" />
                    <Field label="Subject" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required placeholder="e.g. Physics, Maths" />
                    <Field label="Schedule" value={form.schedule} onChange={e => setForm(p => ({ ...p, schedule: e.target.value }))} placeholder="e.g. Mon/Wed/Fri 5–7 PM" />
                    <Field label="Capacity" type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} placeholder="Max students (optional)" />
                    {error && <p className="text-xs py-2 text-center rounded-xl" style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>{error}</p>}
                    <button type="submit" disabled={saving}
                        className="w-full py-3 rounded-xl font-semibold text-sm"
                        style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                        {saving ? 'Creating...' : 'Create Batch'}
                    </button>
                </form>
            </Sheet>
        </div>
    );
}

// ─── PARENTS TAB ─────────────────────────────────────────────────────────────
function ParentsTab({ parents, students, onRefresh }) {
    const [showAdd, setShowAdd] = useState(false);
    const [editParent, setEditParent] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', childIds: [] });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [search, setSearch] = useState('');

    const filtered = parents.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setForm({ name: '', email: '', password: '', phone: '', childIds: [] });
        setError(''); setShowAdd(true);
    };

    const openEdit = (p) => {
        setEditParent(p);
        setForm({
            name: p.name || '', phone: p.phone || '',
            childIds: p.childIds?.map(c => c._id || c) || [],
        });
        setError('');
    };

    const toggleChild = (id) => setForm(p => ({
        ...p, childIds: p.childIds.includes(id) ? p.childIds.filter(c => c !== id) : [...p.childIds, id]
    }));

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true); setError('');
        try {
            if (editParent) {
                await api.patch(`/users/parents/${editParent._id}`, form);
            } else {
                await api.post('/users/parents', form);
            }
            await onRefresh();
            setShowAdd(false); setEditParent(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save');
        } finally { setSaving(false); }
    };

    const toggleActive = async (p) => {
        await api.patch(`/users/parents/${p._id}`, { isActive: !p.isActive });
        onRefresh();
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(193,68,14,0.12)' }}>
                    <Search size={14} color="#C1440E" opacity={0.6} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search parents..."
                        className="flex-1 text-sm outline-none bg-transparent"
                        style={{ color: '#2C1810' }} />
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                    <Plus size={15} /> Add
                </button>
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <UserCheck size={36} color="#C1440E" opacity={0.2} className="mx-auto mb-2" />
                    <p className="text-sm" style={{ color: '#2C1810', opacity: 0.5 }}>No parents yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(p => {
                        const isOpen = expanded === p._id;
                        const children = p.childIds || [];
                        return (
                            <div key={p._id} className="rounded-2xl overflow-hidden shadow-sm"
                                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                                <div className="px-4 py-3.5 flex items-center gap-3 cursor-pointer"
                                    onClick={() => setExpanded(isOpen ? null : p._id)}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: 'rgba(232,160,32,0.12)' }}>
                                        <span className="text-sm font-bold" style={{ color: '#E8A020' }}>
                                            {p.name?.[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate" style={{ color: '#2C1810' }}>{p.name}</p>
                                        <p className="text-xs truncate" style={{ color: '#2C1810', opacity: 0.4 }}>
                                            {children.length > 0
                                                ? children.map(c => c.name || students.find(s => s._id === (c._id || c))?.name || '?').join(', ')
                                                : 'No children linked'}
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0"
                                        style={{ backgroundColor: 'rgba(232,160,32,0.1)', color: '#b45309' }}>
                                        {children.length} child{children.length !== 1 ? 'ren' : ''}
                                    </span>
                                    {isOpen ? <ChevronUp size={14} color="#2C1810" opacity={0.4} /> : <ChevronDown size={14} color="#2C1810" opacity={0.4} />}
                                </div>

                                {isOpen && (
                                    <div className="px-4 pb-4 border-t space-y-3" style={{ borderColor: 'rgba(193,68,14,0.06)' }}>
                                        <div className="pt-3 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Mail size={12} color="#C1440E" opacity={0.6} />
                                                <p className="text-xs" style={{ color: '#2C1810', opacity: 0.6 }}>{p.email}</p>
                                            </div>
                                            {p.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={12} color="#C1440E" opacity={0.6} />
                                                    <p className="text-xs" style={{ color: '#2C1810', opacity: 0.6 }}>{p.phone}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(p)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                                                style={{ backgroundColor: 'rgba(193,68,14,0.08)', color: '#C1440E' }}>
                                                <Edit2 size={12} /> Edit / Link Children
                                            </button>
                                            <button onClick={() => toggleActive(p)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                                                style={{
                                                    backgroundColor: p.isActive ? 'rgba(148,163,184,0.12)' : 'rgba(22,163,74,0.1)',
                                                    color: p.isActive ? '#94a3b8' : '#16a34a',
                                                }}>
                                                {p.isActive ? <><UserX size={12} /> Deactivate</> : <><UserPlus size={12} /> Activate</>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <Sheet open={showAdd || !!editParent} onClose={() => { setShowAdd(false); setEditParent(null); }}
                title={editParent ? `Edit — ${editParent.name}` : 'Add New Parent'}>
                <form onSubmit={handleSave} className="space-y-4">
                    <Field label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                    {!editParent && (
                        <>
                            <Field label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                            <Field label="Password" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required placeholder="Min 6 characters" />
                        </>
                    )}
                    <Field label="Phone" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Mobile number" />

                    {/* Link children */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#2C1810', opacity: 0.6 }}>
                            Link Children (Students)
                        </label>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {students.map(s => {
                                const selected = form.childIds.includes(s._id);
                                return (
                                    <button key={s._id} type="button" onClick={() => toggleChild(s._id)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                                        style={{
                                            backgroundColor: selected ? 'rgba(193,68,14,0.08)' : '#F5F0E8',
                                            border: `1px solid ${selected ? 'rgba(193,68,14,0.25)' : 'transparent'}`,
                                        }}>
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                            style={{ backgroundColor: selected ? '#C1440E' : 'rgba(193,68,14,0.1)', color: selected ? '#F5F0E8' : '#C1440E' }}>
                                            {s.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium" style={{ color: '#2C1810' }}>{s.name}</p>
                                            {s.rollNumber && <p className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>Roll #{s.rollNumber}</p>}
                                        </div>
                                        {selected && <Check size={14} color="#C1440E" />}
                                    </button>
                                );
                            })}
                            {students.length === 0 && <p className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>No students yet</p>}
                        </div>
                    </div>

                    {error && <p className="text-xs py-2 text-center rounded-xl" style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>{error}</p>}
                    <button type="submit" disabled={saving}
                        className="w-full py-3 rounded-xl font-semibold text-sm"
                        style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                        {saving ? 'Saving...' : editParent ? 'Save Changes' : 'Create Parent'}
                    </button>
                    {!editParent && (
                        <p className="text-xs text-center" style={{ color: '#2C1810', opacity: 0.4 }}>
                            Login credentials will be emailed to the parent
                        </p>
                    )}
                </form>
            </Sheet>
        </div>
    );
}

// ─── SIRS TAB ──────────────────────────────────────────────────────────────
function SirsTab({ sirs, onRefresh }) {
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [editSir, setEditSir] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const filtered = sirs.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
    );

    const openAdd = () => {
        setForm({ name: '', email: '', password: '', phone: '' });
        setError(''); setShowAdd(true);
    };

    const openEdit = (s) => {
        setEditSir(s);
        setForm({ name: s.name || '', phone: s.phone || '' });
        setError('');
    };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true); setError('');
        try {
            if (editSir) {
                await api.patch(`/users/sirs/${editSir._id}`, { name: form.name, phone: form.phone });
            } else {
                await api.post('/users/sirs', form);
            }
            await onRefresh();
            setShowAdd(false); setEditSir(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save');
        } finally { setSaving(false); }
    };

    const toggleActive = async (s) => {
        try {
            await api.patch(`/users/sirs/${s._id}`, { isActive: !s.isActive });
            onRefresh();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to change status');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(193,68,14,0.12)' }}>
                    <Search size={14} color="#C1440E" opacity={0.6} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search sirs/admins..."
                        className="flex-1 text-sm outline-none bg-transparent"
                        style={{ color: '#2C1810' }} />
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                    <Plus size={15} /> Add
                </button>
            </div>

            <p className="text-xs px-1" style={{ color: '#2C1810', opacity: 0.5 }}>
                {filtered.length} sir{filtered.length !== 1 ? 's' : ''}
            </p>

            {filtered.length === 0 ? (
                <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <UserPlus size={36} color="#C1440E" opacity={0.2} className="mx-auto mb-2" />
                    <p className="text-sm" style={{ color: '#2C1810', opacity: 0.5 }}>No admins found</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(s => {
                        const isOpen = expanded === s._id;
                        return (
                            <div key={s._id} className="rounded-2xl overflow-hidden shadow-sm"
                                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                                <div className="px-4 py-3.5 flex items-center gap-3 cursor-pointer"
                                    onClick={() => setExpanded(isOpen ? null : s._id)}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: s.isActive ? 'rgba(193,68,14,0.1)' : 'rgba(44,24,16,0.06)' }}>
                                        <span className="text-sm font-bold" style={{ color: s.isActive ? '#C1440E' : '#94a3b8' }}>
                                            {s.name?.[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-bold truncate" style={{ color: '#2C1810' }}>{s.name}</p>
                                            {!s.isActive && (
                                                <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: 'rgba(148,163,184,0.15)', color: '#94a3b8' }}>
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs truncate" style={{ color: '#2C1810', opacity: 0.4 }}>
                                            {s.email}
                                        </p>
                                    </div>
                                    {isOpen ? <ChevronUp size={14} color="#2C1810" opacity={0.4} /> : <ChevronDown size={14} color="#2C1810" opacity={0.4} />}
                                </div>

                                {isOpen && (
                                    <div className="px-4 pb-4 border-t space-y-3" style={{ borderColor: 'rgba(193,68,14,0.06)' }}>
                                        <div className="pt-3 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Mail size={12} color="#C1440E" opacity={0.6} />
                                                <p className="text-xs" style={{ color: '#2C1810', opacity: 0.6 }}>{s.email}</p>
                                            </div>
                                            {s.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={12} color="#C1440E" opacity={0.6} />
                                                    <p className="text-xs" style={{ color: '#2C1810', opacity: 0.6 }}>{s.phone}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(s)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                                                style={{ backgroundColor: 'rgba(193,68,14,0.08)', color: '#C1440E' }}>
                                                <Edit2 size={12} /> Edit
                                            </button>
                                            <button onClick={() => toggleActive(s)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                                                style={{
                                                    backgroundColor: s.isActive ? 'rgba(148,163,184,0.12)' : 'rgba(22,163,74,0.1)',
                                                    color: s.isActive ? '#94a3b8' : '#16a34a',
                                                }}>
                                                {s.isActive ? <><UserX size={12} /> Deactivate</> : <><UserPlus size={12} /> Activate</>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <Sheet open={showAdd || !!editSir} onClose={() => { setShowAdd(false); setEditSir(null); }}
                title={editSir ? `Edit — ${editSir.name}` : 'Add New Sir'}>
                <form onSubmit={handleSave} className="space-y-4">
                    <Field label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                    {!editSir && (
                        <>
                            <Field label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                            <Field label="Password" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required placeholder="Min 6 characters" />
                        </>
                    )}
                    <Field label="Phone" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Mobile number" />

                    {error && <p className="text-xs py-2 text-center rounded-xl" style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>{error}</p>}
                    <button type="submit" disabled={saving}
                        className="w-full py-3 rounded-xl font-semibold text-sm"
                        style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                        {saving ? 'Saving...' : editSir ? 'Save Changes' : 'Create Sir'}
                    </button>
                    {!editSir && (
                        <p className="text-xs text-center" style={{ color: '#2C1810', opacity: 0.4 }}>
                            Login credentials will be emailed to the new teacher
                        </p>
                    )}
                </form>
            </Sheet>
        </div>
    );
}

// ─── ROOT PAGE ────────────────────────────────────────────────────────────────
export default function StudentList() {
    const [tab, setTab] = useState('students');
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [parents, setParents] = useState([]);
    const [sirs, setSirs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        try {
            const [sRes, bRes, pRes, sirRes] = await Promise.all([
                api.get('/users/students'),
                api.get('/users/batches'),
                api.get('/users/parents'),
                api.get('/users/sirs'),
            ]);
            setStudents(sRes.data.students || []);
            setBatches(bRes.data.batches || []);
            setParents(pRes.data.parents || []);
            setSirs(sirRes.data.sirs || []);
        } catch (_) {}
    };

    useEffect(() => {
        fetchAll().finally(() => setLoading(false));
    }, []);

    if (loading) return <PageLoader />;

    const tabs = [
        { key: 'students', label: 'Students', count: students.length, Icon: Users },
        { key: 'batches', label: 'Batches', count: batches.length, Icon: BookOpen },
        { key: 'parents', label: 'Parents', count: parents.length, Icon: UserCheck },
        { key: 'sirs', label: 'Sirs', count: sirs.length, Icon: UserPlus },
    ];

    return (
        <div className="min-h-screen pb-28 page-fade" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader title="Students" subtitle="Manage students, batches & parents" />

            {/* Tabs */}
            <div className="px-6 mb-5">
                <div className="flex gap-1 p-1 rounded-2xl" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    {tabs.map(({ key, label, count, Icon }) => (
                        <button key={key} onClick={() => setTab(key)}
                            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl transition-all"
                            style={{ backgroundColor: tab === key ? '#C1440E' : 'transparent' }}>
                            <Icon size={16} color={tab === key ? '#F5F0E8' : 'rgba(44,24,16,0.4)'} />
                            <span className="text-xs font-semibold" style={{ color: tab === key ? '#F5F0E8' : 'rgba(44,24,16,0.5)' }}>
                                {label}
                            </span>
                            <span className="text-xs font-bold" style={{ color: tab === key ? 'rgba(245,240,232,0.7)' : 'rgba(44,24,16,0.3)' }}>
                                {count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6">
                {tab === 'students' && <StudentsTab students={students} batches={batches} parents={parents} onRefresh={fetchAll} />}
                {tab === 'batches' && <BatchesTab batches={batches} students={students} onRefresh={fetchAll} />}
                {tab === 'parents' && <ParentsTab parents={parents} students={students} onRefresh={fetchAll} />}
                {tab === 'sirs' && <SirsTab sirs={sirs} onRefresh={fetchAll} />}
            </div>

            <BottomNav />
        </div>
    );
}
