import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Quizzes from './pages/Quizzes';
import TakeQuiz from './pages/TakeQuiz';
import QuizResult from './pages/QuizResult';
import Attempts from './pages/Attempts';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import JmiPyq from './pages/JmiPyq';
import AmuPyq from './pages/AmuPyq';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* All routes use MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="verify-email/:token" element={<VerifyEmail />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="jmi-pyq" element={<JmiPyq />} />
          <Route path="amu-pyq" element={<AmuPyq />} />
          <Route path="quiz/:quizId" element={
            <ProtectedRoute>
              <TakeQuiz />
            </ProtectedRoute>
          } />
          <Route path="quiz/result/:quizId" element={
            <ProtectedRoute>
              <QuizResult />
            </ProtectedRoute>
          } />
          <Route path="attempts" element={
            <ProtectedRoute>
              <Attempts />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="about" element={<About />} />
          <Route path="admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}
