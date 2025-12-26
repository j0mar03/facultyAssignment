import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Faculty from './pages/Faculty';
import Courses from './pages/Courses';
import Assignments from './pages/Assignments';
import Sections from './pages/Sections';
import Schedule from './pages/Schedule';
import Reports from './pages/Reports';
import Rooms from './pages/Rooms';
import Login from './pages/Login';
import { useAuth } from './hooks/useAuth';
import { useAppDispatch } from './hooks/redux';
import { logout } from './store/slices/authSlice';

function App() {
  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Listen for logout events from API interceptor
    const handleLogout = () => {
      dispatch(logout());
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [dispatch]);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/sections" element={<Sections />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;