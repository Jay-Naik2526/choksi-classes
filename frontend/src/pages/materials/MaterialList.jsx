import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, BookOpen, Search, FileText, Video, StickyNote,
    Trash2, ExternalLink, Bookmark, BookmarkCheck,
    Folder, FolderOpen, ChevronRight, Home, ArrowLeft,
    Grid3X3, List, File, Users
} from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoader } from '../../components/ui/Spinner';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const typeIcon  = { pdf: FileText, video: Video, note: StickyNote };
const typeColor = { pdf: '#dc2626', video: '#2563eb', note: '#059669' };
const typeBg    = { pdf: 'rgba(220,38,38,0.08)', video: 'rgba(37,99,235,0.08)', note: 'rgba(5,150,105,0.08)' };

// ── Folder colour palette ──────────────────────────────────────────────────
const FOLDER_PALETTE = [
    { bg: 'rgba(193,68,14,0.1)',   icon: '#C1440E' },
    { bg: 'rgba(37,99,235,0.1)',   icon: '#2563eb' },
    { bg: 'rgba(5,150,105,0.1)',   icon: '#059669' },
    { bg: 'rgba(124,58,237,0.1)',  icon: '#7c3aed' },
    { bg: 'rgba(232,160,32,0.1)',  icon: '#E8A020' },
    { bg: 'rgba(220,38,38,0.1)',   icon: '#dc2626' },
    { bg: 'rgba(6,182,212,0.1)',   icon: '#0891b2' },
    { bg: 'rgba(236,72,153,0.1)',  icon: '#ec4899' },
];
const folderColor = (idx) => FOLDER_PALETTE[idx % FOLDER_PALETTE.length];

export default function MaterialList() {
    const { user } = useAuthStore();
    const navigate  = useNavigate();

    const [materials, setMaterials]           = useState([]);
    const [loading, setLoading]               = useState(true);
    const [search, setSearch]                 = useState('');
    const [showBookmarked, setShowBookmarked] = useState(false);
    const [viewMode, setViewMode]             = useState('folder'); // 'folder' | 'list'

    // path: [] = batch root | [batchKey] | [batchKey, subject] | [batchKey, subject, chapter]
    const [path, setPath] = useState([]);

    const fetchAll = () =>
        api.get('/materials')
            .then(r => setMaterials(r.data.materials || []))
            .finally(() => setLoading(false));

    useEffect(() => { fetchAll(); }, []);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Delete this material?')) return;
        await api.delete(`/materials/${id}`);
        setMaterials(prev => prev.filter(m => m._id !== id));
    };

    const handleToggleBookmark = async (id, e) => {
        e.stopPropagation();
        try {
            const res = await api.patch(`/materials/${id}/bookmark`);
            setMaterials(prev => prev.map(m =>
                m._id === id ? { ...m, isBookmarked: res.data.bookmarked } : m
            ));
        } catch {}
    };

    // ── Derived hierarchy ─────────────────────────────────────────────────
    // Structure: { batchKey: { batchName, subjects: { subject: { chapter: [materials] } } } }
    const hierarchy = useMemo(() => {
        let filtered = materials;
        if (showBookmarked) filtered = filtered.filter(m => m.isBookmarked);
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(m =>
                m.title.toLowerCase().includes(q) ||
                m.subject?.toLowerCase().includes(q) ||
                m.chapter?.toLowerCase().includes(q)
            );
        }

        const map = {}; // batchKey → { name, subjects: { subj: { ch: [m] } } }

        filtered.forEach(m => {
            const batchList = m.batchIds && m.batchIds.length > 0
                ? m.batchIds
                : [{ _id: 'general', name: 'General' }];

            batchList.forEach(b => {
                const key  = b._id?.toString() || 'general';
                const name = b.name || 'General';
                const sub  = m.subject || 'Uncategorised';
                const ch   = m.chapter  || 'General';

                if (!map[key]) map[key] = { name, subjects: {} };
                if (!map[key].subjects[sub]) map[key].subjects[sub] = {};
                if (!map[key].subjects[sub][ch]) map[key].subjects[sub][ch] = [];
                map[key].subjects[sub][ch].push(m);
            });
        });

        return map;
    }, [materials, showBookmarked, search]);

    if (loading) return <PageLoader />;

    const isSir       = user?.role === 'sir';
    const canBookmark = user?.role === 'student' || user?.role === 'parent';

    // Student batch filter — only show batches they belong to
    const userBatchIds = user?.batchIds?.map(b => b?.toString?.() || b) || [];

    // ── Path levels ───────────────────────────────────────────────────────
    const atRoot    = path.length === 0;
    const atBatch   = path.length === 1;
    const atSubject = path.length === 2;
    const atChapter = path.length === 3;

    const [currentBatchKey, currentSubject, currentChapter] = path;

    // Batch keys visible to this user
    const allBatchKeys = Object.keys(hierarchy).sort((a, b) => {
        const na = hierarchy[a].name;
        const nb = hierarchy[b].name;
        if (na === 'General') return 1;
        if (nb === 'General') return -1;
        return na.localeCompare(nb);
    });

    const visibleBatchKeys = isSir
        ? allBatchKeys
        : allBatchKeys.filter(k => k === 'general' || userBatchIds.includes(k));

    const subjectNames = atBatch
        ? Object.keys(hierarchy[currentBatchKey]?.subjects || {}).sort()
        : [];

    const chapterNames = atSubject
        ? Object.keys(hierarchy[currentBatchKey]?.subjects?.[currentSubject] || {}).sort()
        : [];

    const filesAtLevel = atChapter
        ? (hierarchy[currentBatchKey]?.subjects?.[currentSubject]?.[currentChapter] || [])
        : [];

    const isSearching = search.length > 0;

    // Helper counts
    const batchFileCount = (k) => {
        let c = 0;
        Object.values(hierarchy[k]?.subjects || {}).forEach(subs =>
            Object.values(subs).forEach(files => c += files.length)
        );
        return c;
    };
    const batchSubjectCount = (k) => Object.keys(hierarchy[k]?.subjects || {}).length;

    const subjectFileCount = (k, s) => {
        let c = 0;
        Object.values(hierarchy[k]?.subjects?.[s] || {}).forEach(files => c += files.length);
        return c;
    };
    const subjectChapterCount = (k, s) => Object.keys(hierarchy[k]?.subjects?.[s] || {}).length;

    // Flat list for search / list mode
    const allDisplayed = useMemo(() => {
        let out = [];
        Object.values(hierarchy).forEach(b =>
            Object.values(b.subjects).forEach(subs =>
                Object.values(subs).forEach(files => out.push(...files))
            )
        );
        // deduplicate by _id (material may appear in multiple batches)
        const seen = new Set();
        return out.filter(m => { if (seen.has(m._id)) return false; seen.add(m._id); return true; });
    }, [hierarchy]);

    // Breadcrumb label helper
    const batchName = currentBatchKey ? (hierarchy[currentBatchKey]?.name || currentBatchKey) : '';

    return (
        <div className="min-h-screen pb-28 page-fade" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader
                title="Study Materials"
                subtitle={
                    atRoot    ? `${visibleBatchKeys.length} batch${visibleBatchKeys.length !== 1 ? 'es' : ''}`
                    : atBatch   ? batchName
                    : atSubject ? `${batchName} › ${currentSubject}`
                    : `${currentSubject} › ${currentChapter}`
                }
                action={
                    <div className="flex items-center gap-2">
                        {/* View toggle */}
                        <button
                            onClick={() => setViewMode(v => v === 'folder' ? 'list' : 'folder')}
                            className="p-2 rounded-xl transition-all"
                            style={{ backgroundColor: 'rgba(193,68,14,0.08)' }}>
                            {viewMode === 'folder'
                                ? <List size={15} color="#C1440E" />
                                : <Grid3X3 size={15} color="#C1440E" />}
                        </button>
                        {isSir && (
                            <button onClick={() => navigate('/materials/upload')}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
                                style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                                <Plus size={15} /> Upload
                            </button>
                        )}
                    </div>
                }
            />

            <div className="px-4 space-y-3">

                {/* ── Search bar ─────────────────────────────────────── */}
                <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" color="#2C1810" opacity={0.4} />
                    <input value={search} onChange={e => { setSearch(e.target.value); if (e.target.value) setPath([]); }}
                        placeholder="Search materials…"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(193,68,14,0.12)', color: '#2C1810' }} />
                </div>

                {/* ── Breadcrumb + saved toggle ───────────────────────── */}
                <div className="flex items-center gap-2 flex-wrap">
                    {!isSearching && (
                        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
                            <button
                                onClick={() => setPath([])}
                                className="flex items-center gap-1 px-2 py-1.5 rounded-lg flex-shrink-0 transition-all"
                                style={{
                                    backgroundColor: atRoot ? 'rgba(193,68,14,0.1)' : 'transparent',
                                    color: atRoot ? '#C1440E' : '#2C1810',
                                }}>
                                <Home size={13} />
                                <span className="text-xs font-medium">Home</span>
                            </button>

                            {/* Batch crumb */}
                            {path.length >= 1 && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <ChevronRight size={12} color="#2C1810" opacity={0.3} />
                                    <button
                                        onClick={() => setPath([currentBatchKey])}
                                        className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                                        style={{
                                            backgroundColor: path.length === 1 ? 'rgba(193,68,14,0.1)' : 'transparent',
                                            color: path.length === 1 ? '#C1440E' : '#2C1810',
                                            maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                        {batchName}
                                    </button>
                                </div>
                            )}

                            {/* Subject crumb */}
                            {path.length >= 2 && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <ChevronRight size={12} color="#2C1810" opacity={0.3} />
                                    <button
                                        onClick={() => setPath([currentBatchKey, currentSubject])}
                                        className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                                        style={{
                                            backgroundColor: path.length === 2 ? 'rgba(193,68,14,0.1)' : 'transparent',
                                            color: path.length === 2 ? '#C1440E' : '#2C1810',
                                            maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                        {currentSubject}
                                    </button>
                                </div>
                            )}

                            {/* Chapter crumb */}
                            {path.length >= 3 && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <ChevronRight size={12} color="#2C1810" opacity={0.3} />
                                    <button
                                        onClick={() => setPath([currentBatchKey, currentSubject, currentChapter])}
                                        className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                                        style={{
                                            backgroundColor: 'rgba(193,68,14,0.1)',
                                            color: '#C1440E',
                                            maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                        {currentChapter}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Saved toggle */}
                    {canBookmark && (
                        <button onClick={() => setShowBookmarked(p => !p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-all"
                            style={{
                                backgroundColor: showBookmarked ? '#E8A020' : '#FFFFFF',
                                color: '#2C1810',
                                border: `1px solid ${showBookmarked ? '#E8A020' : 'rgba(193,68,14,0.12)'}`,
                            }}>
                            {showBookmarked ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
                            Saved
                        </button>
                    )}
                </div>

                {/* ── Empty state ─────────────────────────────────────── */}
                {allDisplayed.length === 0 && (
                    <div className="rounded-2xl p-14 text-center"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <BookOpen size={40} color="#C1440E" opacity={0.15} className="mx-auto mb-3" />
                        <p className="text-sm font-medium" style={{ color: '#2C1810' }}>
                            {showBookmarked ? 'No saved materials yet' : 'No materials found'}
                        </p>
                        {isSir && (
                            <button onClick={() => navigate('/materials/upload')}
                                className="mt-4 px-4 py-2 rounded-xl text-sm font-medium"
                                style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                                Upload First Material
                            </button>
                        )}
                    </div>
                )}

                {/* ══ FOLDER VIEW ══════════════════════════════════════ */}
                {viewMode === 'folder' && !isSearching && allDisplayed.length > 0 && (
                    <div className="space-y-3">

                        {/* Back button */}
                        {!atRoot && (
                            <button
                                onClick={() => setPath(p => p.slice(0, -1))}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(193,68,14,0.12)', color: '#2C1810' }}>
                                <ArrowLeft size={14} color="#C1440E" />
                                Back
                            </button>
                        )}

                        {/* ── ROOT: Batch folders ──────────────────────── */}
                        {atRoot && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {visibleBatchKeys.map((key, idx) => {
                                    const { bg, icon } = folderColor(idx);
                                    const fc = batchFileCount(key);
                                    const sc = batchSubjectCount(key);
                                    const name = hierarchy[key]?.name || key;
                                    return (
                                        <button key={key}
                                            onClick={() => setPath([key])}
                                            className="rounded-2xl p-4 text-left transition-all active:scale-95"
                                            style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: bg }}>
                                                    <Users size={22} color={icon} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold leading-snug mb-1 truncate" style={{ color: '#2C1810' }}>
                                                        {name}
                                                    </p>
                                                    <p className="text-xs" style={{ color: '#2C1810', opacity: 0.45 }}>
                                                        {sc} subject{sc !== 1 ? 's' : ''} · {fc} file{fc !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── BATCH level: Subject folders ─────────────── */}
                        {atBatch && subjectNames.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider px-1"
                                    style={{ color: '#2C1810', opacity: 0.4 }}>Subjects</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {subjectNames.map((sub, idx) => {
                                        const { bg, icon } = folderColor(idx);
                                        const fc = subjectFileCount(currentBatchKey, sub);
                                        const cc = subjectChapterCount(currentBatchKey, sub);
                                        return (
                                            <button key={sub}
                                                onClick={() => setPath([currentBatchKey, sub])}
                                                className="rounded-2xl p-4 text-left transition-all active:scale-95"
                                                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                                                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5"
                                                    style={{ backgroundColor: bg }}>
                                                    <FolderOpen size={22} color={icon} />
                                                </div>
                                                <p className="text-sm font-semibold leading-snug mb-1 truncate" style={{ color: '#2C1810' }}>
                                                    {sub}
                                                </p>
                                                <p className="text-xs" style={{ color: '#2C1810', opacity: 0.45 }}>
                                                    {cc > 1 ? `${cc} chapters · ` : ''}{fc} file{fc !== 1 ? 's' : ''}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── SUBJECT level: Chapter folders ──────────── */}
                        {atSubject && chapterNames.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider px-1"
                                    style={{ color: '#2C1810', opacity: 0.4 }}>Chapters</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {chapterNames.map((ch, idx) => {
                                        const { bg, icon } = folderColor(idx + 2);
                                        const count = (hierarchy[currentBatchKey]?.subjects?.[currentSubject]?.[ch] || []).length;
                                        return (
                                            <button key={ch}
                                                onClick={() => setPath([currentBatchKey, currentSubject, ch])}
                                                className="rounded-2xl p-4 text-left transition-all active:scale-95"
                                                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                                                    style={{ backgroundColor: bg }}>
                                                    <Folder size={20} color={icon} />
                                                </div>
                                                <p className="text-sm font-semibold leading-snug mb-0.5 truncate" style={{ color: '#2C1810' }}>
                                                    {ch}
                                                </p>
                                                <p className="text-xs" style={{ color: '#2C1810', opacity: 0.45 }}>
                                                    {count} file{count !== 1 ? 's' : ''}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── CHAPTER level: Files ────────────────────── */}
                        {atChapter && filesAtLevel.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider px-1"
                                    style={{ color: '#2C1810', opacity: 0.4 }}>Files</p>
                                <FileGrid
                                    files={filesAtLevel}
                                    isSir={isSir}
                                    canBookmark={canBookmark}
                                    onDelete={handleDelete}
                                    onBookmark={handleToggleBookmark}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* ══ LIST VIEW or SEARCH results ══════════════════════ */}
                {(viewMode === 'list' || isSearching) && allDisplayed.length > 0 && (
                    <FileGrid
                        files={allDisplayed}
                        isSir={isSir}
                        canBookmark={canBookmark}
                        onDelete={handleDelete}
                        onBookmark={handleToggleBookmark}
                        showPath
                    />
                )}
            </div>

            <BottomNav />
        </div>
    );
}

// ── File card component ─────────────────────────────────────────────────────
function FileGrid({ files, isSir, canBookmark, onDelete, onBookmark, showPath = false }) {
    return (
        <div className="grid grid-cols-1 gap-3">
            {files.map((m) => {
                const Icon = typeIcon[m.type] || File;
                return (
                    <div key={m._id} className="rounded-2xl p-4 shadow-sm transition-all"
                        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <div className="flex items-start gap-3">
                            {/* Type icon */}
                            <div className="p-3 rounded-xl flex-shrink-0"
                                style={{ backgroundColor: typeBg[m.type] || 'rgba(193,68,14,0.08)' }}>
                                <Icon size={18} color={typeColor[m.type] || '#C1440E'} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm leading-snug" style={{ color: '#2C1810' }}>
                                    {m.title}
                                </p>
                                {showPath && (
                                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                        {m.batchIds && m.batchIds.length > 0 && (
                                            <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: 'rgba(124,58,237,0.08)', color: '#7c3aed' }}>
                                                {m.batchIds[0]?.name || 'Batch'}
                                            </span>
                                        )}
                                        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: 'rgba(193,68,14,0.08)', color: '#C1440E' }}>
                                            {m.subject}
                                        </span>
                                        {m.chapter && (
                                            <span className="text-xs" style={{ color: '#2C1810', opacity: 0.4 }}>
                                                › {m.chapter}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {!showPath && (
                                    <p className="text-xs mt-0.5" style={{ color: '#2C1810', opacity: 0.45 }}>
                                        {m.type.toUpperCase()}
                                        {m.chapter ? ` · ${m.chapter}` : ''}
                                    </p>
                                )}
                                {m.description && (
                                    <p className="text-xs mt-1 line-clamp-2" style={{ color: '#2C1810', opacity: 0.55 }}>
                                        {m.description}
                                    </p>
                                )}
                                <p className="text-xs mt-1.5" style={{ color: '#2C1810', opacity: 0.28 }}>
                                    {new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 flex-shrink-0">
                                {canBookmark && (
                                    <button onClick={(e) => onBookmark(m._id, e)}
                                        className="p-2 rounded-xl transition-colors"
                                        style={{ backgroundColor: m.isBookmarked ? 'rgba(232,160,32,0.12)' : 'transparent' }}>
                                        {m.isBookmarked
                                            ? <BookmarkCheck size={16} color="#E8A020" />
                                            : <Bookmark size={16} color="#2C1810" opacity={0.3} />}
                                    </button>
                                )}
                                {(m.driveLink || m.videoUrl) && (
                                    <a href={m.driveLink || m.videoUrl} target="_blank" rel="noopener noreferrer"
                                        className="p-2 rounded-xl transition-colors"
                                        style={{ backgroundColor: 'rgba(193,68,14,0.08)' }}
                                        onClick={e => e.stopPropagation()}>
                                        <ExternalLink size={14} color="#C1440E" />
                                    </a>
                                )}
                                {isSir && (
                                    <button onClick={(e) => onDelete(m._id, e)}
                                        className="p-2 rounded-xl hover:bg-red-50 transition-colors">
                                        <Trash2 size={14} color="#C1440E" opacity={0.5} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* YouTube embed */}
                        {m.type === 'video' && m.videoUrl && m.videoUrl.includes('youtube.com') && (
                            <div className="mt-3 rounded-xl overflow-hidden aspect-video">
                                <iframe src={m.videoUrl.replace('watch?v=', 'embed/')}
                                    className="w-full h-full" allowFullScreen title={m.title} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
