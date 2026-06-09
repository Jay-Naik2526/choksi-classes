import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { PageLoader } from './components/ui/Spinner';

const Landing = lazy(() => import('./pages/Landing'));
const Admissions = lazy(() => import('./pages/Admissions'));
const Login = lazy(() => import('./pages/auth/Login'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const NoticeList = lazy(() => import('./pages/notices/NoticeList'));
const CreateNotice = lazy(() => import('./pages/notices/CreateNotice'));
const MaterialList = lazy(() => import('./pages/materials/MaterialList'));
const UploadMaterial = lazy(() => import('./pages/materials/UploadMaterial'));
const FeeList = lazy(() => import('./pages/fees/FeeList'));
const DoubtList = lazy(() => import('./pages/doubts/DoubtList'));
const SubmitDoubt = lazy(() => import('./pages/doubts/SubmitDoubt'));
const DoubtDetail = lazy(() => import('./pages/doubts/DoubtDetail'));
const TestList = lazy(() => import('./pages/tests/TestList'));
const CreateTest = lazy(() => import('./pages/tests/CreateTest'));
const AttemptTest = lazy(() => import('./pages/tests/AttemptTest'));
const TestResult = lazy(() => import('./pages/tests/TestResult'));
const QuestionBank = lazy(() => import('./pages/tests/QuestionBank'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const StudentList = lazy(() => import('./pages/students/StudentList'));
const HomeworkList = lazy(() => import('./pages/homework/HomeworkList'));
const CreateHomework = lazy(() => import('./pages/homework/CreateHomework'));
const HomeworkDetail = lazy(() => import('./pages/homework/HomeworkDetail'));
const BatchManagement = lazy(() => import('./pages/batches/BatchManagement'));
const ReferralTracker = lazy(() => import('./pages/students/ReferralTracker'));

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
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
