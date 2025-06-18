import React from 'react';
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
import Login from './pages/Login';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated } = useAuth();

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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;