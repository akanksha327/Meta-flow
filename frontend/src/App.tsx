import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { APIKeys } from './pages/APIKeys';
import { Billing } from './pages/Billing';
import { APIs } from './pages/APIs';
import { Settings } from './pages/Settings';
import { Success } from './pages/Success';
import { Cancel } from './pages/Cancel';
import { VerifyEmail } from './pages/VerifyEmail';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="apis" element={<APIs />} />
                <Route path="keys" element={<APIKeys />} />
                <Route path="billing" element={<Billing />} />
                <Route path="usage" element={<div className="p-8">Usage detailed metrics coming soon...</div>} />
                <Route path="settings" element={<Settings />} />
              </Route>

            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
