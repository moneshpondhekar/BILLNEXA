import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FolderUploadPage } from './pages/admin/FolderUploadPage';
import { FolderManagementPage } from './pages/admin/FolderManagementPage';
import { EmployeeAssignmentPage } from './pages/admin/EmployeeAssignmentPage';
import { ClaimsOverviewPage } from './pages/admin/ClaimsOverviewPage';
import { SearchTrackingPage } from './pages/admin/SearchTrackingPage';
import { EmployeeManagementPage } from './pages/admin/EmployeeManagementPage';
import { ActivityLogsPage } from './pages/admin/ActivityLogsPage';

import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { MyAssignedDocumentsPage } from './pages/employee/MyAssignedDocumentsPage';
import { DocumentViewerPage } from './pages/employee/DocumentViewerPage';
import { IntakeBillsWorkspace } from './pages/employee/IntakeBillsWorkspace';
import { SavedClaimsPage } from './pages/employee/SavedClaimsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'admin' | 'employee' }> = ({
  children,
  allowedRole
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Bill Nexa...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect if role does not match
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />;
  }

  return <>{children}</>;
};

// Root Redirect Component
const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRole="admin"><AppLayout /></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/upload" element={<FolderUploadPage />} />
            <Route path="/admin/folders" element={<FolderManagementPage />} />
            <Route path="/admin/assignments" element={<EmployeeAssignmentPage />} />
            <Route path="/admin/claims" element={<ClaimsOverviewPage />} />
            <Route path="/admin/search" element={<SearchTrackingPage />} />
            <Route path="/admin/employees" element={<EmployeeManagementPage />} />
            <Route path="/admin/activity" element={<ActivityLogsPage />} />
          </Route>

          {/* Employee Protected Routes */}
          <Route element={<ProtectedRoute allowedRole="employee"><AppLayout /></ProtectedRoute>}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/tasks" element={<MyAssignedDocumentsPage />} />
            <Route path="/employee/document/:id" element={<DocumentViewerPage />} />
            <Route path="/employee/intake/:id" element={<IntakeBillsWorkspace />} />
            <Route path="/employee/claims" element={<SavedClaimsPage />} />
            <Route path="/employee/search" element={<SearchTrackingPage />} />
            <Route path="/employee/activity" element={<ActivityLogsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

