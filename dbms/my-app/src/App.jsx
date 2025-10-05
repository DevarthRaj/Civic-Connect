import ComplaintManagement from './Components/officer/ComplaintManagement';
import OfficerComplaintDetails from './Components/officer/ComplaintDetails';
import OfficerMyComplaints from './Components/officer/MyComplaints';

// Officer Pages
import OfficerDashboard from './Components/officer/Dashboard';
import OfficerReports from './Components/officer/Reports';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useState } from 'react';

// Layouts
import MainLayout from './Components/layout/MainLayout';
import AuthLayout from './Components/layout/AuthLayout';

// Auth Pages
import Login from './Components/auth/Login';
import Register from './Components/auth/EnhancedRegister';

// Citizen Pages
import CitizenDashboard from './Components/citizen/Dashboard';
import MyComplaints from './Components/citizen/MyComplaints';
import ComplaintDetails from './Components/citizen/ComplaintDetails';
import Feedback from './Components/citizen/Feedback';
import FileComplaint from './Components/citizen/FileComplaint';

// Admin Pages
import AdminDashboard from './Components/admin/Dashboard';
import UserManagement from './Components/admin/UserManagement';
import DepartmentManagement from './Components/admin/DepartmentManagement';
import CategoryManagement from './Components/admin/CategoryManagement';
import ComplaintOversight from './Components/admin/ComplaintOversight';
import Reports from './Components/admin/Reports';

// Shared Components
import NotFound from './Components/shared/NotFound';

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  if (!user.token) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Officer Routes */}
          <Route path="/officer" element={
            <ProtectedRoute requiredRole="officer">
              <MainLayout>
                <OfficerDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/officer/reports" element={
            <ProtectedRoute requiredRole="officer">
              <MainLayout>
                <OfficerReports />
              </MainLayout>
            </ProtectedRoute>
          } />
          {/* Auth Routes */}
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
          
          {/* Citizen Routes */}
          <Route path="/citizen" element={
            <ProtectedRoute requiredRole="citizen">
              <MainLayout>
                <CitizenDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/file-complaint" element={
            <ProtectedRoute requiredRole="citizen">
              <MainLayout>
                <FileComplaint />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/my-complaints" element={
            <ProtectedRoute requiredRole="citizen">
              <MainLayout>
                <MyComplaints />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/complaint/:id" element={
            <ProtectedRoute requiredRole="citizen">
              <MainLayout>
                <ComplaintDetails />
              </MainLayout>
            </ProtectedRoute>
          } />
                    <Route path="/officer/complaints" element={
            <ProtectedRoute requiredRole="officer">
              <MainLayout>
                <ComplaintManagement />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/officer/my-complaints" element={
            <ProtectedRoute requiredRole="officer">
              <MainLayout>
                <OfficerMyComplaints />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/officer/complaints/:id" element={
            <ProtectedRoute requiredRole="officer">
              <MainLayout>
                <OfficerComplaintDetails />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/complaint/:id/feedback" element={
            <ProtectedRoute requiredRole="citizen">
              <MainLayout>
                <Feedback />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <MainLayout>
                <UserManagement />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/departments" element={
            <ProtectedRoute requiredRole="admin">
              <MainLayout>
                <DepartmentManagement />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/categories" element={
            <ProtectedRoute requiredRole="admin">
              <MainLayout>
                <CategoryManagement />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/complaints" element={
            <ProtectedRoute requiredRole="admin">
              <MainLayout>
                <ComplaintOversight />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/reports" element={
            <ProtectedRoute requiredRole="admin">
              <MainLayout>
                <Reports />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
