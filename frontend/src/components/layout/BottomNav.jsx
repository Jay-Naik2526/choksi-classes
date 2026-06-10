import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, FileText, HelpCircle, BookOpen, User,
    Bell, IndianRupee, Users, ClipboardList, Inbox,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const sirNav = [
    { label: 'Home',      path: '/dashboard', Icon: Home },
    { label: 'Students',  path: '/students',  Icon: Users },
    { label: 'Enquiries', path: '/enquiries', Icon: Inbox,  badge: 'enquiry' },
    { label: 'Tests',     path: '/tests',     Icon: FileText },
    { label: 'Materials', path: '/materials', Icon: BookOpen },
    { label: 'Profile',   path: '/profile',   Icon: User },
];

const studentNav = [
    { label: 'Home',      path: '/dashboard', Icon: Home },
    { label: 'Homework',  path: '/homework',  Icon: ClipboardList },
    { label: 'Tests',     path: '/tests',     Icon: FileText },
    { label: 'Doubts',    path: '/doubts',    Icon: HelpCircle },
    { label: 'Materials', path: '/materials', Icon: BookOpen },
    { label: 'Profile',   path: '/profile',   Icon: User },
];

const parentNav = [
    { label: 'Home',    path: '/dashboard', Icon: Home },
    { label: 'Fees',    path: '/fees',      Icon: IndianRupee },
    { label: 'Tests',   path: '/tests',     Icon: FileText },
    { label: 'Notices', path: '/notices',   Icon: Bell },
    { label: 'Profile', path: '/profile',   Icon: User },
];

export default function BottomNav() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { user } = useAuthStore();
    const [newEnquiries, setNewEnquiries] = useState(0);

    /* Poll new-enquiry count for Sir every 60s */
    useEffect(() => {
        if (user?.role !== 'sir') return;
        const fetch = () =>
            api.get('/enquiry?status=new')
               .then(r => setNewEnquiries(r.data.newCount || 0))
               .catch(() => {});
        fetch();
        const t = setInterval(fetch, 60000);
        return () => clearInterval(t);
    }, [user?.role]);

    const navMap = { sir: sirNav, student: studentNav, parent: parentNav };
    const navItems = navMap[user?.role] || studentNav;

    const isActive = (path) =>
        path === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(path);

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid rgba(44,24,16,0.08)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                boxShadow: '0 -4px 24px rgba(44,24,16,0.06)',
            }}
        >
            <div className="flex items-stretch justify-around">
                {navItems.map(({ label, path, Icon, badge }) => {
                    const active    = isActive(path);
                    const badgeCount = badge === 'enquiry' ? newEnquiries : 0;

                    return (
                        <button
                            key={path}
                            onClick={() => { navigate(path); if (badge === 'enquiry') setNewEnquiries(0); }}
                            className="flex flex-col items-center justify-center gap-1 py-2.5 flex-1 min-w-0 relative"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            {/* active pill */}
                            {active && (
                                <span className="absolute" style={{ top: '8px', width: 36, height: 28, borderRadius: 10, backgroundColor: 'rgba(193,68,14,0.1)' }} />
                            )}

                            {/* icon + badge dot */}
                            <div style={{ position: 'relative', display: 'inline-flex' }}>
                                <Icon
                                    size={20}
                                    color={active ? '#C1440E' : 'rgba(44,24,16,0.32)'}
                                    strokeWidth={active ? 2.5 : 1.8}
                                    style={{ position: 'relative' }}
                                />
                                <AnimatePresence>
                                    {badgeCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            style={{
                                                position: 'absolute', top: -4, right: -5,
                                                minWidth: 15, height: 15, borderRadius: 50,
                                                backgroundColor: '#C1440E', color: '#fff',
                                                fontSize: 8, fontWeight: 700,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                padding: '0 3px',
                                                border: '1.5px solid #fff',
                                            }}
                                        >
                                            {badgeCount > 9 ? '9+' : badgeCount}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>

                            <span
                                className="font-medium leading-none truncate w-full text-center px-0.5"
                                style={{ fontSize: '9px', color: active ? '#C1440E' : 'rgba(44,24,16,0.32)', letterSpacing: '0.02em' }}
                            >
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
