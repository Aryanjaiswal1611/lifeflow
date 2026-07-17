import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import BlogDetails from './pages/BlogDetails';
import AdminBlogs from './pages/AdminBlogs';
import Contact from './pages/Contact';
import Testimonials from './pages/Testimonials';
import Search from './pages/Search';
import NearbyMap from './pages/NearbyMap';
import AIChatbot from './pages/AIChatbot';
import Leaderboard from './pages/Leaderboard';
import EmergencySOS from './pages/EmergencySOS';
import Compatibility from './pages/Compatibility';
import BloodCamps from './pages/BloodCamps';
import BloodAvailability from './pages/BloodAvailability';
import HospitalFinder from './pages/HospitalFinder';

const App = () => {
  return (
    <Router>
      <ErrorBoundary>
      <AuthProvider>
      <SocketProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', background: '#333', color: '#fff', fontSize: '14px' } }} />
        <Navbar />
        <main className="min-h-screen bg-gray-50 pt-16 dark:bg-gray-950">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetails />} />
            <Route path="/admin/blogs" element={<ProtectedRoute roles={['admin']}><AdminBlogs /></ProtectedRoute>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/nearby" element={<ProtectedRoute><NearbyMap /></ProtectedRoute>} />
            <Route path="/ai-chat" element={<ProtectedRoute><AIChatbot /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/emergency-sos" element={<ProtectedRoute><EmergencySOS /></ProtectedRoute>} />
            <Route path="/compatibility" element={<ProtectedRoute><Compatibility /></ProtectedRoute>} />
            <Route path="/camps" element={<ProtectedRoute><BloodCamps /></ProtectedRoute>} />
            <Route path="/blood-availability" element={<ProtectedRoute><BloodAvailability /></ProtectedRoute>} />
            <Route path="/hospital-finder" element={<ProtectedRoute><HospitalFinder /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </SocketProvider>
      </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
