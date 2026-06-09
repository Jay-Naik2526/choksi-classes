import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home, FileText, HelpCircle, BookOpen, User,
    Bell, IndianRupee, Users, ClipboardList,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const sirNav = [
    { label: 'Home',      path: '/dashboard', Icon: Home },
    { label: 'Students',  path: '/students',  Icon: Users },
    { label: 'Homework',  path: '/homework',  Icon: ClipboardList },
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
                {navItems.map(({ label, path, Icon }) => {
                    const active = isActive(path);
                    return (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className="flex flex-col items-center justify-center gap-1 py-2.5 flex-1 min-w-0 relative"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            {/* active pill highlight behind icon */}
                            {active && (
                                <span
                                    className="absolute"
                                    style={{
                                        top: '8px',
                                        width: 36,
                                        height: 28,
                                        borderRadius: 10,
                                        backgroundColor: 'rgba(193,68,14,0.1)',
                                    }}
                                />
                            )}
                            <Icon
                                size={20}
                                color={active ? '#C1440E' : 'rgba(44,24,16,0.32)'}
                                strokeWidth={active ? 2.5 : 1.8}
                                style={{ position: 'relative' }}
                            />
                            <span
                                className="font-medium leading-none truncate w-full text-center px-0.5"
                                style={{
                                    fontSize: '9px',
                                    color: active ? '#C1440E' : 'rgba(44,24,16,0.32)',
                                    letterSpacing: '0.02em',
                                }}
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
