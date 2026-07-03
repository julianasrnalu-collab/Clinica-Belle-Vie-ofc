import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { Clock } from 'lucide-react';

// Auth Pages
import Login from './pages/Login';
import RegisterClient from './pages/RegisterClient';
import RegisterEmployee from './pages/RegisterEmployee';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Team from './pages/Team';
import Results from './pages/Results';
import Promotions from './pages/Promotions';
import Contact from './pages/Contact';
import BookAppointment from './pages/BookAppointment';

// Dashboard pages
import Dashboard from './pages/Dashboard';
import DashboardSchedule from './pages/DashboardSchedule';
import DashboardServices from './pages/DashboardServices';
import DashboardProfessionals from './pages/DashboardProfessionals';
import DashboardClients from './pages/DashboardClients';
import DashboardReports from './pages/DashboardReports';
import DashboardMyAppointments from './pages/DashboardMyAppointments';
import DashboardProfile from './pages/DashboardProfile';
import DashboardMessages from './pages/DashboardMessages';
import DashboardPromotions from './pages/DashboardPromotions';
import DashboardTestimonials from './pages/DashboardTestimonials';
import DashboardGallery from './pages/DashboardGallery';
import DashboardLoyalty from './pages/DashboardLoyalty';
import DashboardSettings from './pages/DashboardSettings';
import DepositPayment from './pages/DepositPayment';

// Layouts
import PublicLayout from './components/public/PublicLayout';
import DashboardLayout from './components/dashboard/DashboardLayout';
import FloatingMenu from './components/public/FloatingMenu';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[hsl(30,25%,98%)]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/Login" replace />;
  }

  // If roles are specified, check if user's role matches
  if (allowedRoles && user.profile?.role && !allowedRoles.includes(user.profile.role)) {
    // Redirect clients trying to access admin dashboard back to their appointments
    if (user.profile.role === 'client') {
      return <Navigate to="/DashboardMyAppointments" replace />;
    }
    // Redirect admins/employees trying to access client-only areas
    return <Navigate to="/Dashboard" replace />;
  }

  // Pending Approval Check for Employees
  if (user.profile?.role === 'employee' && user.profile?.approval_status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-yellow-100">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Acesso em Análise</h2>
          <p className="text-gray-500 mb-6 text-sm">Seu cadastro como profissional está sob análise da administração. Você receberá acesso assim que for aprovado.</p>
          <button onClick={() => navigate('/Login')} className="w-full bg-[hsl(350,35%,45%)] hover:bg-[hsl(350,35%,38%)] text-white rounded-xl py-3 font-semibold transition-colors">
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/Home" element={<Home />} />
          <Route path="/About" element={<About />} />
          <Route path="/Services" element={<Services />} />
          <Route path="/Team" element={<Team />} />
          <Route path="/Results" element={<Results />} />
          <Route path="/Promotions" element={<Promotions />} />
          <Route path="/Contact" element={<Contact />} />
          
          <Route path="/Login" element={<Login />} />
          <Route path="/RegisterClient" element={<RegisterClient />} />
          <Route path="/RegisterEmployee" element={<RegisterEmployee />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/ResetPassword" element={<ResetPassword />} />
        </Route>

        {/* Booking (has its own nav) */}
        <Route path="/BookAppointment" element={<BookAppointment />} />
        <Route path="/DepositPayment" element={<DepositPayment />} />

        {/* Dashboard routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          {/* Admin & Employee routes */}
          <Route path="/Dashboard" element={<ProtectedRoute allowedRoles={['admin', 'employee']}><Dashboard /></ProtectedRoute>} />
          <Route path="/DashboardSchedule" element={<ProtectedRoute allowedRoles={['admin', 'employee']}><DashboardSchedule /></ProtectedRoute>} />
          <Route path="/DashboardServices" element={<ProtectedRoute allowedRoles={['admin', 'employee']}><DashboardServices /></ProtectedRoute>} />
          <Route path="/DashboardProfessionals" element={<ProtectedRoute allowedRoles={['admin']}><DashboardProfessionals /></ProtectedRoute>} />
          <Route path="/DashboardClients" element={<ProtectedRoute allowedRoles={['admin', 'employee']}><DashboardClients /></ProtectedRoute>} />
          <Route path="/DashboardReports" element={<ProtectedRoute allowedRoles={['admin']}><DashboardReports /></ProtectedRoute>} />
          <Route path="/DashboardMessages" element={<ProtectedRoute allowedRoles={['admin', 'employee']}><DashboardMessages /></ProtectedRoute>} />
          <Route path="/DashboardPromotions" element={<ProtectedRoute allowedRoles={['admin']}><DashboardPromotions /></ProtectedRoute>} />
          <Route path="/DashboardLoyalty" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLoyalty /></ProtectedRoute>} />
          <Route path="/DashboardSettings" element={<ProtectedRoute allowedRoles={['admin']}><DashboardSettings /></ProtectedRoute>} />
          <Route path="/DashboardTestimonials" element={<ProtectedRoute allowedRoles={['admin']}><DashboardTestimonials /></ProtectedRoute>} />
          <Route path="/DashboardGallery" element={<ProtectedRoute allowedRoles={['admin']}><DashboardGallery /></ProtectedRoute>} />
          
          {/* Client & Employee routes (Profile/Appointments) */}
          <Route path="/DashboardMyAppointments" element={<DashboardMyAppointments />} />
          <Route path="/DashboardProfile" element={<DashboardProfile />} />
        </Route>

        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <FloatingMenu />
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <AppRoutes />
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  )
}

export default App