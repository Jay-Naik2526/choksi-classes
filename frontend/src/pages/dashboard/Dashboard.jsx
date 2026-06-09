import useAuthStore from '../../store/authStore';
import SirDashboard from './SirDashboard';
import StudentDashboard from './StudentDashboard';
import ParentDashboard from './ParentDashboard';

export default function Dashboard() {
    const { user } = useAuthStore();
    if (user?.role === 'sir') return <SirDashboard />;
    if (user?.role === 'student') return <StudentDashboard />;
    if (user?.role === 'parent') return <ParentDashboard />;
    return null;
}