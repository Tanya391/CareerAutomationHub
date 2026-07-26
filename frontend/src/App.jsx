import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Companies from './pages/Companies';
import Profile from './pages/Profile';
import ScanLogs from './pages/ScanLogs';
import TestingLab from './pages/TestingLab';
import Login from './pages/Login';
import Register from './pages/Register';

// Guard layout for protected routes
const PrivateLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-semibold text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full h-screen overflow-y-auto">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="py-6 border-t border-slate-200 bg-white text-slate-500 text-xs text-center mt-auto shrink-0">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Ac 2026 Career Automation Hub & Job Scouting System.</span>
            <div className="flex items-center gap-4">
              <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span> Engine Status: 100% Operational
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Route guard for public-only auth routes (Login/Register)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-semibold text-sm">
        Loading...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Main Routes */}
          <Route
            path="/"
            element={
              <PrivateLayout>
                <Dashboard />
              </PrivateLayout>
            }
          />
          <Route
            path="/jobs"
            element={
              <PrivateLayout>
                <Jobs />
              </PrivateLayout>
            }
          />
          <Route
            path="/tracker"
            element={
              <PrivateLayout>
                <Applications />
              </PrivateLayout>
            }
          />
          <Route
            path="/companies"
            element={
              <PrivateLayout>
                <Companies />
              </PrivateLayout>
            }
          />
          <Route
            path="/logs"
            element={
              <PrivateLayout>
                <ScanLogs />
              </PrivateLayout>
            }
          />
          <Route
            path="/testing-lab"
            element={
              <PrivateLayout>
                <TestingLab />
              </PrivateLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateLayout>
                <Profile />
              </PrivateLayout>
            }
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
