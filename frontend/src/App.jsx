import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Landing from './pages/Landing';
import Admissions from './pages/Admissions';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import NoticeList from './pages/notices/NoticeList';
import CreateNotice from './pages/notices/CreateNotice';
import MaterialList from './pages/materials/MaterialList';
import UploadMaterial from './pages/materials/UploadMaterial';
import FeeList from './pages/fees/FeeList';
import DoubtList from './pages/doubts/DoubtList';
import SubmitDoubt from './pages/doubts/SubmitDoubt';
import DoubtDetail from './pages/doubts/DoubtDetail';
import TestList from './pages/tests/TestList';
import CreateTest from './pages/tests/CreateTest';
import AttemptTest from './pages/tests/AttemptTest';
import TestResult from './pages/tests/TestResult';
import QuestionBank from './pages/tests/QuestionBank';
import Profile from './pages/profile/Profile';
import StudentList from './pages/students/StudentList';
import HomeworkList from './pages/homework/HomeworkList';
import CreateHomework from './pages/homework/CreateHomework';
import HomeworkDetail from './pages/homework/HomeworkDetail';
import BatchManagement from './pages/batches/BatchManagement';
import ReferralTracker from './pages/students/ReferralTracker';

const PrivateRoute = ({ children }) => {
    const { token } = useAuthStore();
    return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
    const { token } = useAuthStore();
    return !token ? children : <Navigate to="/dashboard" replace />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

                <Route path="/notices" element={<PrivateRoute><NoticeList /></PrivateRoute>} />
                <Route path="/notices/create" element={<PrivateRoute><CreateNotice /></PrivateRoute>} />

                <Route path="/materials" element={<PrivateRoute><MaterialList /></PrivateRoute>} />
                <Route path="/materials/upload" element={<PrivateRoute><UploadMaterial /></PrivateRoute>} />

                <Route path="/fees" element={<PrivateRoute><FeeList /></PrivateRoute>} />

                <Route path="/doubts" element={<PrivateRoute><DoubtList /></PrivateRoute>} />
                <Route path="/doubts/submit" element={<PrivateRoute><SubmitDoubt /></PrivateRoute>} />
                <Route path="/doubts/:id" element={<PrivateRoute><DoubtDetail /></PrivateRoute>} />

                <Route path="/tests" element={<PrivateRoute><TestList /></PrivateRoute>} />
                <Route path="/tests/create" element={<PrivateRoute><CreateTest /></PrivateRoute>} />
                <Route path="/tests/question-bank" element={<PrivateRoute><QuestionBank /></PrivateRoute>} />
                <Route path="/tests/:id/attempt" element={<PrivateRoute><AttemptTest /></PrivateRoute>} />
                <Route path="/tests/:id/result" element={<PrivateRoute><TestResult /></PrivateRoute>} />

                <Route path="/students" element={<PrivateRoute><StudentList /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

                {/* Homework */}
                <Route path="/homework" element={<PrivateRoute><HomeworkList /></PrivateRoute>} />
                <Route path="/homework/create" element={<PrivateRoute><CreateHomework /></PrivateRoute>} />
                <Route path="/homework/:id" element={<PrivateRoute><HomeworkDetail /></PrivateRoute>} />

                {/* Batches */}
                <Route path="/batches" element={<PrivateRoute><BatchManagement /></PrivateRoute>} />

                {/* Referrals */}
                <Route path="/referrals" element={<PrivateRoute><ReferralTracker /></PrivateRoute>} />

                {/* Public */}
                <Route path="/admissions" element={<Admissions />} />
                <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
