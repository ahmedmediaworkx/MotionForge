import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { authAPI } from './services/api';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import DashboardHome from './pages/Dashboard/DashboardHome';
import ProjectsPage from './pages/Dashboard/ProjectsPage';
import EditorPage from './pages/Dashboard/EditorPage';
import ExportsPage from './pages/Dashboard/ExportsPage';
import BillingPage from './pages/Dashboard/BillingPage';
import SettingsPage from './pages/Dashboard/SettingsPage';
import TeamPage from './pages/Dashboard/TeamPage';

// Guards
import AuthGuard from './components/common/AuthGuard';

// Initialize auth on app load
const useInitAuth = () => {
  const { isAuthenticated, setUser, setAccessToken, logout } = useAuthStore();

  const { isLoading } = useQuery({
    queryKey: ['initAuth'],
    queryFn: async () => {
      try {
        const response = await authAPI.getMe();
        const user = response.data.data.user;
        setUser(user);
        return user;
      } catch (error) {
        // If token is invalid, logout
        if (error.response?.status === 401) {
          logout();
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return isLoading;
};

function App() {
  const isLoadingAuth = useInitAuth();

  // Show loading screen while initializing
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-lime flex items-center justify-center">
            <span className="text-background-primary font-bold text-2xl font-clash">MF</span>
          </div>
          <div className="animate-spin w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="editor/:id" element={<EditorPage />} />
        <Route path="exports" element={<ExportsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="team" element={<TeamPage />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;