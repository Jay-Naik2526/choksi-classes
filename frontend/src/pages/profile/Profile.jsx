import { useEffect, useState } from 'react';
import { Camera, LogOut, User, Mail, Phone, MapPin, Calendar, BookOpen, Lock, Eye, EyeOff } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import PageHeader from '../../components/layout/PageHeader';
import Spinner from '../../components/ui/Spinner';
import { PageLoader } from '../../components/ui/Spinner';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

export default function Profile() {
    const { logout } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Change password state
    const [showPwSection, setShowPwSection] = useState(false);
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');
    const [showPw, setShowPw] = useState({ current: false, new: false });

    useEffect(() => {
        api.get('/users/profile')
            .then(r => {
                setProfile(r.data.user);
                setForm({ name: r.data.user.name || '', phone: r.data.user.phone || '', address: r.data.user.address || '' });
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            await api.patch('/users/profile', form);
            setProfile(prev => ({ ...prev, ...form }));
            setEditing(false);
            setSuccess('Profile updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch { setError('Failed to update profile'); }
        finally { setSaving(false); }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoLoading(true);
        try {
            const formData = new FormData();
            formData.append('photo', file);
            const res = await api.post('/users/profile/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setProfile(prev => ({ ...prev, profilePhoto: res.data.photoUrl }));
        } catch { setError('Photo upload failed'); }
        finally { setPhotoLoading(false); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwError(''); setPwSuccess('');
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwError('New passwords do not match'); return;
        }
        if (pwForm.newPassword.length < 6) {
            setPwError('New password must be at least 6 characters'); return;
        }
        setPwSaving(true);
        try {
            await api.patch('/auth/change-password', {
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword,
            });
            setPwSuccess('Password changed successfully');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => { setPwSuccess(''); setShowPwSection(false); }, 2500);
        } catch (err) {
            setPwError(err.response?.data?.message || 'Failed to change password');
        } finally { setPwSaving(false); }
    };

    if (loading) return <PageLoader />;

    const roleColors = { sir: '#C1440E', student: '#2C1810', parent: '#E8A020' };
    const roleColor = roleColors[profile?.role] || '#C1440E';

    const PwInput = ({ field, label, showKey }) => (
        <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>{label}</label>
            <div className="relative">
                <input
                    type={showPw[showKey] ? 'text' : 'password'}
                    value={pwForm[field]}
                    onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-11"
                    style={{ backgroundColor: '#F7F4EF', border: '1.5px solid transparent', color: '#2C1810' }}
                    onFocus={e => e.target.style.borderColor = '#C1440E'}
                    onBlur={e => e.target.style.borderColor = 'transparent'} />
                <button type="button" onClick={() => setShowPw(p => ({ ...p, [showKey]: !p[showKey] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPw[showKey] ? <EyeOff size={15} color="#2C1810" opacity={0.4} /> : <Eye size={15} color="#2C1810" opacity={0.4} />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pb-28 page-fade" style={{ backgroundColor: '#F7F4EF' }}>
            <PageHeader
                title="Profile"
                action={
                    <button onClick={logout}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                        style={{ backgroundColor: '#2C1810', color: '#F5F0E8' }}>
                        <LogOut size={13} /> Logout
                    </button>
                }
            />

            <div className="px-6 space-y-4">
                {/* Avatar + name */}
                <div className="rounded-2xl p-6 shadow-sm text-center overflow-hidden relative"
                    style={{ backgroundColor: '#2C1810' }}>
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5"
                        style={{ backgroundColor: '#C1440E', transform: 'translate(30%, -30%)' }} />
                    <div className="relative w-20 h-20 mx-auto mb-4">
                        {profile?.profilePhoto ? (
                            <img src={profile.profilePhoto} alt={profile.name}
                                className="w-20 h-20 rounded-2xl object-cover" />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold"
                                style={{ backgroundColor: roleColor, color: '#F5F0E8', fontFamily: 'Playfair Display, serif' }}>
                                {profile?.name?.[0]?.toUpperCase()}
                            </div>
                        )}
                        <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center cursor-pointer"
                            style={{ backgroundColor: '#E8A020' }}>
                            {photoLoading ? <Spinner size="sm" color="#2C1810" /> : <Camera size={13} color="#2C1810" />}
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                    </div>
                    <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8' }}>
                        {profile?.name}
                    </h2>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize"
                        style={{ backgroundColor: roleColor, color: '#F5F0E8' }}>
                        {profile?.role}
                    </span>
                    {profile?.rollNumber && (
                        <p className="text-xs mt-2" style={{ color: '#F5F0E8', opacity: 0.5 }}>
                            Roll No: {profile.rollNumber}
                        </p>
                    )}
                </div>

                {success && (
                    <p className="text-xs text-center py-2 rounded-xl" style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                        {success}
                    </p>
                )}
                {error && (
                    <p className="text-xs text-center py-2 rounded-xl" style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>
                        {error}
                    </p>
                )}

                {/* Personal Info */}
                <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                            Personal Information
                        </h3>
                        {!editing ? (
                            <button onClick={() => setEditing(true)}
                                className="text-xs font-medium px-3 py-1.5 rounded-xl"
                                style={{ backgroundColor: 'rgba(193,68,14,0.1)', color: '#C1440E' }}>
                                Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setEditing(false)}
                                    className="text-xs font-medium px-3 py-1.5 rounded-xl"
                                    style={{ backgroundColor: '#F7F4EF', color: '#2C1810' }}>
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                                    style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {[
                            { icon: User, label: 'Full Name', key: 'name', value: profile?.name },
                            { icon: Mail, label: 'Email', key: 'email', value: profile?.email, readonly: true },
                            { icon: Phone, label: 'Phone', key: 'phone', value: profile?.phone },
                            { icon: MapPin, label: 'Address', key: 'address', value: profile?.address },
                        ].map(({ icon: Icon, label, key, value, readonly }) => (
                            <div key={key} className="flex items-start gap-3">
                                <div className="p-2 rounded-xl mt-0.5 flex-shrink-0" style={{ backgroundColor: 'rgba(193,68,14,0.08)' }}>
                                    <Icon size={14} color="#C1440E" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#2C1810', opacity: 0.4 }}>
                                        {label}
                                    </p>
                                    {editing && !readonly ? (
                                        <input value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                            style={{ backgroundColor: '#F7F4EF', border: '1.5px solid transparent', color: '#2C1810' }}
                                            onFocus={e => e.target.style.borderColor = '#C1440E'}
                                            onBlur={e => e.target.style.borderColor = 'transparent'} />
                                    ) : (
                                        <p className="text-sm font-medium" style={{ color: '#2C1810' }}>
                                            {value || <span style={{ opacity: 0.3 }}>Not set</span>}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Enrolled Batches */}
                {profile?.batchIds?.length > 0 && (
                    <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                        <h3 className="text-sm font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                            Enrolled Batches
                        </h3>
                        <div className="space-y-2">
                            {profile.batchIds.map((b) => (
                                <div key={b._id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F7F4EF' }}>
                                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(193,68,14,0.1)' }}>
                                        <BookOpen size={13} color="#C1440E" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: '#2C1810' }}>{b.name}</p>
                                        <p className="text-xs" style={{ color: '#2C1810', opacity: 0.5 }}>
                                            {b.subject}{b.schedule ? ` · ${b.schedule}` : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Change Password */}
                <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <button onClick={() => { setShowPwSection(p => !p); setPwError(''); setPwSuccess(''); }}
                        className="w-full flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(193,68,14,0.08)' }}>
                                <Lock size={14} color="#C1440E" />
                            </div>
                            <p className="text-sm font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>
                                Change Password
                            </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: '#F7F4EF', color: '#2C1810', opacity: 0.6 }}>
                            {showPwSection ? 'Cancel' : 'Change'}
                        </span>
                    </button>

                    {showPwSection && (
                        <form onSubmit={handleChangePassword} className="px-5 pb-5 space-y-3 border-t" style={{ borderColor: 'rgba(193,68,14,0.06)' }}>
                            <div className="pt-3">
                                <PwInput field="currentPassword" label="Current Password" showKey="current" />
                            </div>
                            <PwInput field="newPassword" label="New Password" showKey="new" />
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#2C1810', opacity: 0.6 }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={pwForm.confirmPassword}
                                    onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                    required
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                    style={{ backgroundColor: '#F7F4EF', border: '1.5px solid transparent', color: '#2C1810' }}
                                    onFocus={e => e.target.style.borderColor = '#C1440E'}
                                    onBlur={e => e.target.style.borderColor = 'transparent'} />
                            </div>
                            {pwError && <p className="text-xs py-2 text-center rounded-lg" style={{ backgroundColor: '#FEF2F2', color: '#C1440E' }}>{pwError}</p>}
                            {pwSuccess && <p className="text-xs py-2 text-center rounded-lg" style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>{pwSuccess}</p>}
                            <button type="submit" disabled={pwSaving}
                                className="w-full py-3 rounded-xl font-semibold text-sm"
                                style={{ backgroundColor: '#C1440E', color: '#F5F0E8' }}>
                                {pwSaving ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Account */}
                <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(44,24,16,0.07)', boxShadow: '0 2px 12px rgba(44,24,16,0.04)' }}>
                    <h3 className="text-sm font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif', color: '#2C1810' }}>Account</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} color="#2C1810" opacity={0.4} />
                            <p className="text-xs" style={{ color: '#2C1810', opacity: 0.5 }}>
                                Joined {new Date(profile?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                            Active
                        </span>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
