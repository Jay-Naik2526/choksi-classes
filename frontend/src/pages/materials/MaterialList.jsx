import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, BookOpen, Search, FileText, Video, StickyNote,
    Trash2, ExternalLink, Bookmark, BookmarkCheck,
    Folder, FolderOpen, ChevronRight, Home, ArrowLeft,
    Grid3X3, List, File
} from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import PageHeader from '../../components/layout/PageHeader';
import { PageLoader } from '../../components/ui/Spinner';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const typeIcon  = { pdf: FileText, video: Video, note: StickyNote };
const typeColor = { pdf: '#dc2626', video: '#2563eb', note: '#059669' };
const typeBg    = { pdf: 'rgba(220,38,38,0.08)', video: 'rgba(37,99,235,0.08)', note: 'rgba(5,150,105,0.08)' };

// ── Subject folder colour palette ─────────────────────────────────────────
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

    const [materials, setMaterials]       = useState([]);
    const [loading, setLoading]           = useState(true);
    const [search, setSearch]             = useState('');
    const [showBookmarked, setShowBookmarked] = useState(false);
    const [viewMode, setViewMode]         = useState('folder'); // 'folder' | 'list'

    // Folder-browser path: [] → show subjects; [subject] → show chapters; [subject, chapter] → show files
    const [path, setPath] = useState([]);   // e.g. [] | ['Maths'] | ['Maths','Algebra']

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

    // ── Derived folder data ────────────────────────────────────────────────
    const { subjectMap, displayed } = useMemo(() => {
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

        // Build hierarchy: { subject → { chapter → [materials] } }
        const map = {};
        filtered.forEach(m => {
            const sub = m.subject || 'Uncategorised';
            const ch  = m.chapter  || 'General';
            if (!map[sub]) map[sub] = {};
            if (!map[sub][ch]) map[sub][ch] = [];
            map[sub][ch].push(m);
        });

        return { subjectMap: map, displayed: filtered };
    }, [materials, showBookmarked, search]);

    if (loading) return <PageLoader />;

    const isSir       = user?.role === 'sir';
    const canBookmark = user?.role === 'student' || user?.role === 'parent';

    // ── What level are we at? ───────────────────────────────────────────────
    const atRoot    = path.length === 0;
    const atSubject = path.length === 1;
    const atChapter = path.length === 2;

    const currentSubject = path[0];
    const currentChapter = path[1];

    // Items at current level
    const subjectNames = Object.keys(subjectMap).sort();
    const chapterNames = atSubject ? Object.keys(subjectMap[currentSubject] || {}).sort() : [];
    const filesAtLevel = atChapter
        ? (subjectMap[currentSubject]?.[currentChapter] || [])
        : atSubject
            ? Object.values(subjectMap[currentSubject] || {}).flat()  // all files under subject when no chapter drill-down
            : [];

    // In list/search mode, just show all matching files
    const isSearching = search.length > 0;

    const fileCount = (sub) => Object.values(subjectMap[sub] || {}).flat().length;
    const chapterCount = (sub) => Object.keys(subjectMap[sub] || {}).length;

    return (
        <div className="min-h-screen pb-28 page-fade" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader
                title="Study Materials"
                subtitle={
                    atRoot ? `${subjectNames.length} subject${subjectNames.length !== 1 ? 's' : ''}`
                    : atSubject ? currentSubject
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

                {/* ── Top bar: breadcrumb + saved toggle ─────────────── */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Breadcrumb */}
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
                            {path.map((segment, idx) => (
                                <div key={idx} className="flex items-center gap-1 flex-shrink-0">
                                    <ChevronRight size={12} color="#2C1810" opacity={0.3} />
                                    <button
                                        onClick={() => setPath(path.slice(0, idx + 1))}
                                        className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                                        style={{
                                            backgroundColor: idx === path.length - 1 ? 'rgba(193,68,14,0.1)' : 'transparent',
                                            color: idx === path.length - 1 ? '#C1440E' : '#2C1810',
                                            maxWidth: '120px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                        {segment}
                                    </button>
                                </div>
                            ))}
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
                {displayed.length === 0 && (
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
                {viewMode === 'folder' && !isSearching && displayed.length > 0 && (
                    <div className="space-y-3">

                        {/* Back button when inside a folder */}
                        {!atRoot && (
                            <button
                                onClick={() => setPath(p => p.slice(0, -1))}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                                style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(193,68,14,0.12)', color: '#2C1810' }}>
                                <ArrowLeft size={14} color="#C1440E" />
                                Back
                            </button>
                        )}

                        {/* ── Root: subject folders ──────────────────── */}
                        {atRoot && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {subjectNames.map((sub, idx) => {
                                    const { bg, icon } = folderColor(idx);
                                    return (
                                        <button key={sub}
                                            onClick={() => setPath([sub])}
                                            className="rounded-2xl p-4 text-left transition-all active:scale-95"
                                            style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                                                style={{ backgroundColor: bg }}>
                                                <FolderOpen size={24} color={icon} />
                                            </div>
                                            <p className="text-sm font-semibold leading-snug mb-1" style={{ color: '#2C1810' }}>
                                                {sub}
                                            </p>
                                            <p className="text-xs" style={{ color: '#2C1810', opacity: 0.45 }}>
                                                {chapterCount(sub) > 1 ? `${chapterCount(sub)} chapters · ` : ''}
                                                {fileCount(sub)} file{fileCount(sub) !== 1 ? 's' : ''}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── Subject level: chapter sub-folders ────────── */}
                        {atSubject && chapterNames.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider px-1"
                                    style={{ color: '#2C1810', opacity: 0.4 }}>Chapters</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {chapterNames.map((ch, idx) => {
                                        const { bg, icon } = folderColor(idx + 2);
                                        const count = (subjectMap[currentSubject]?.[ch] || []).length;
                                        return (
                                            <button key={ch}
                                                onClick={() => setPath([currentSubject, ch])}
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

                        {/* ── Files at chapter level (or subject if only 1 chapter group) ── */}
                        {(atChapter || (atSubject && chapterNames.length === 0)) && filesAtLevel.length > 0 && (
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
                {(viewMode === 'list' || isSearching) && displayed.length > 0 && (
                    <FileGrid
                        files={displayed}
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
