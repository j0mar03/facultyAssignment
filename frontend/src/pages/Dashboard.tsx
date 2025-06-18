import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  People,
  School,
  Assignment,
  Warning,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchDashboardData } from '../services/api';

interface DashboardStats {
  totalFaculty: number;
  totalCourses: number;
  totalAssignments: number;
  pendingAssignments: number;
  complianceIssues: number;
  nightClassCoverage: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await fetchDashboardData();
      setStats(data.stats);
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Faculty Load Management Dashboard
      </Typography>
      
      {alerts.length > 0 && (
        <Box mb={3}>
          {alerts.map((alert, index) => (
            <Alert key={index} severity="warning" sx={{ mb: 1 }}>
              {alert}
            </Alert>
          ))}
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <People color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Total Faculty</Typography>
              </Box>
              <Typography variant="h3">{stats?.totalFaculty || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active faculty members
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <School color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Total Courses</Typography>
              </Box>
              <Typography variant="h3">{stats?.totalCourses || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Courses this semester
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Assignment color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Assignments</Typography>
              </Box>
              <Typography variant="h3">{stats?.totalAssignments || 0}</Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Chip
                  label={`${stats?.pendingAssignments || 0} pending`}
                  size="small"
                  color="warning"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Warning color="error" sx={{ mr: 2 }} />
                <Typography variant="h6">Compliance Issues</Typography>
              </Box>
              <Typography variant="h3" color="error">
                {stats?.complianceIssues || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Violations detected
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Schedule color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Night Class Coverage</Typography>
              </Box>
              <Typography variant="h3">
                {stats?.nightClassCoverage || 0}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stats?.nightClassCoverage || 0}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircle color="success" sx={{ mr: 2 }} />
                <Typography variant="h6">Deadline Status</Typography>
              </Box>
              <Typography variant="body1">OJT Monitoring Sheets</Typography>
              <Typography variant="body2" color="text.secondary">
                Due: July 7, 2025
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Course Offerings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Due: June 20, 2025
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Chip
              label="Generate Schedule"
              onClick={() => window.location.href = '/schedule'}
              clickable
              color="primary"
            />
          </Grid>
          <Grid item>
            <Chip
              label="View Reports"
              onClick={() => window.location.href = '/reports'}
              clickable
              color="primary"
            />
          </Grid>
          <Grid item>
            <Chip
              label="Manage Faculty"
              onClick={() => window.location.href = '/faculty'}
              clickable
              color="primary"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;