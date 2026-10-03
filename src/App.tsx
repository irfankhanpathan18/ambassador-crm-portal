import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AmbassadorManagement } from './pages/admin/AmbassadorManagement';
import { RegistrationManagement } from './pages/admin/RegistrationManagement';
import { Leaderboard } from './pages/admin/Leaderboard';
import { Reports } from './pages/admin/Reports';
import { Settings } from './pages/admin/Settings';

// Ambassador Pages
import { AmbassadorDashboard } from './pages/ambassador/AmbassadorDashboard';
import { MyRegistrations } from './pages/ambassador/MyRegistrations';
import { AmbassadorLeaderboard } from './pages/ambassador/AmbassadorLeaderboard';
import { AmbassadorProfile } from './pages/ambassador/AmbassadorProfile';

const AuthenticatedLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Routes>
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/ambassadors" element={<AmbassadorManagement />} />
            <Route path="/admin/registrations" element={<RegistrationManagement />} />
            <Route path="/admin/leaderboard" element={<Leaderboard />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>

          {/* Ambassador Routes */}
          <Route element={<ProtectedRoute allowedRoles={['AMBASSADOR']} />}>
            <Route path="/ambassador/dashboard" element={<AmbassadorDashboard />} />
            <Route path="/ambassador/registrations" element={<MyRegistrations />} />
            <Route path="/ambassador/leaderboard" element={<AmbassadorLeaderboard />} />
            <Route path="/ambassador/profile" element={<AmbassadorProfile />} />
          </Route>

          {/* Root Fallback */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </div>
    </div>
  );
};

const HomeRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'ADMIN' ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/ambassador/dashboard" replace />
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Unauthenticated Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Canonical Redirects for Legacy / Alternate Routes */}
          <Route path="/student-register" element={<Navigate to="/register" replace />} />
          <Route path="/public-register" element={<Navigate to="/register" replace />} />
          <Route path="/register-form" element={<Navigate to="/register" replace />} />
          <Route path="/register/student" element={<Navigate to="/register" replace />} />

          {/* Protected Application Routes */}
          <Route path="/*" element={<AuthenticatedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
