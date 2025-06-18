import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  GetApp as DownloadIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  NightlightRound as NightIcon,
} from '@mui/icons-material';
import {
  getLoadDistributionReport,
  getComplianceReport,
  exportMonitoringSheet,
} from '../services/api';

interface LoadDistribution {
  facultyId: string;
  name: string;
  type: string;
  department: string;
  regularLoad: number;
  extraLoad: number;
  totalLoad: number;
  assignments: number;
}

interface ComplianceReport {
  violations: Array<{
    type: string;
    faculty?: string;
    course?: string;
    reason: string;
  }>;
  nightClassCoverage: {
    total: number;
    covered: number;
    percentage: number;
    uncovered: Array<{
      id: string;
      code: string;
      name: string;
    }>;
  };
}

const Reports: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [loadDistribution, setLoadDistribution] = useState<LoadDistribution[]>([]);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);

  useEffect(() => {
    if (selectedTab === 0) {
      fetchLoadDistribution();
    } else if (selectedTab === 1) {
      fetchComplianceReport();
    }
  }, [selectedTab]);

  const fetchLoadDistribution = async () => {
    try {
      setLoading(true);
      const data = await getLoadDistributionReport();
      setLoadDistribution(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch load distribution');
    } finally {
      setLoading(false);
    }
  };

  const fetchComplianceReport = async () => {
    try {
      setLoading(true);
      const data = await getComplianceReport();
      setComplianceReport(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch compliance report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportMonitoringSheet = async () => {
    try {
      const blob = await exportMonitoringSheet();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'monitoring-sheet.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError('Failed to export monitoring sheet');
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      Regular: 'primary',
      PartTime: 'secondary',
      Temporary: 'warning',
      Designee: 'info',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getLoadStatus = (totalLoad: number, maxLoad: number) => {
    const percentage = (totalLoad / maxLoad) * 100;
    if (percentage >= 100) return { label: 'Full Load', color: 'error' };
    if (percentage >= 80) return { label: 'High Load', color: 'warning' };
    if (percentage >= 50) return { label: 'Medium Load', color: 'info' };
    return { label: 'Low Load', color: 'success' };
  };

  const getMaxLoadForType = (type: string) => {
    const limits = {
      Regular: 30, // 21 regular + 9 extra
      PartTime: 12, // 12 regular + 0 extra
      Temporary: 30, // 21 regular + 9 extra
      Designee: 24, // 18 regular + 6 extra
    };
    return limits[type as keyof typeof limits] || 0;
  };

  const showViolationDetails = (violations: any[]) => {
    setSelectedDetails(violations);
    setDetailsDialogOpen(true);
  };

  const renderLoadDistributionReport = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Faculty Load Distribution Report
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportMonitoringSheet}
        >
          Export Monitoring Sheet
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{loadDistribution.length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Faculty
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssessmentIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {loadDistribution.reduce((sum, f) => sum + f.totalLoad, 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Load Hours
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WarningIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {loadDistribution.filter(f => {
                      const maxLoad = getMaxLoadForType(f.type);
                      return f.totalLoad >= maxLoad * 0.9;
                    }).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Near Max Load
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SchoolIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {Math.round(
                      loadDistribution.reduce((sum, f) => sum + f.totalLoad, 0) /
                      loadDistribution.length
                    )}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Load per Faculty
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Load Distribution Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Faculty Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Regular Load</TableCell>
              <TableCell>Extra Load</TableCell>
              <TableCell>Total Load</TableCell>
              <TableCell>Assignments</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadDistribution.map((faculty) => {
              const maxLoad = getMaxLoadForType(faculty.type);
              const loadStatus = getLoadStatus(faculty.totalLoad, maxLoad);
              
              return (
                <TableRow key={faculty.facultyId}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {faculty.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={faculty.type}
                      color={getTypeColor(faculty.type) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{faculty.department}</TableCell>
                  <TableCell>{faculty.regularLoad} hrs</TableCell>
                  <TableCell>{faculty.extraLoad} hrs</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {faculty.totalLoad}/{maxLoad} hrs
                    </Typography>
                  </TableCell>
                  <TableCell>{faculty.assignments}</TableCell>
                  <TableCell>
                    <Chip
                      label={loadStatus.label}
                      color={loadStatus.color as any}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderComplianceReport = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Compliance Monitoring Report
      </Typography>

      {complianceReport && (
        <>
          {/* Compliance Summary */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    {complianceReport.violations.length === 0 ? (
                      <CheckIcon color="success" sx={{ mr: 2 }} />
                    ) : (
                      <ErrorIcon color="error" sx={{ mr: 2 }} />
                    )}
                    <Box>
                      <Typography variant="h6">
                        {complianceReport.violations.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Policy Violations
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <NightIcon color="info" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">
                        {complianceReport.nightClassCoverage.percentage}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Night Class Coverage
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <ScheduleIcon color="warning" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h6">
                        {complianceReport.nightClassCoverage.uncovered.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Uncovered Night Classes
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Violations List */}
          {complianceReport.violations.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Policy Violations Detected
                </Typography>
                <List>
                  {complianceReport.violations.map((violation, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <ErrorIcon color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={violation.type}
                          secondary={
                            <>
                              {violation.faculty && `Faculty: ${violation.faculty}`}
                              {violation.course && ` | Course: ${violation.course}`}
                              <br />
                              {violation.reason}
                            </>
                          }
                        />
                      </ListItem>
                      {index < complianceReport.violations.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Night Class Coverage */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Night Class Coverage Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    <strong>Total Night Classes Required:</strong> {complianceReport.nightClassCoverage.total}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    <strong>Currently Covered:</strong> {complianceReport.nightClassCoverage.covered}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    <strong>Coverage Percentage:</strong> {complianceReport.nightClassCoverage.percentage}%
                  </Typography>
                </Grid>
              </Grid>

              {complianceReport.nightClassCoverage.uncovered.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Uncovered Night Classes:
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Course Code</TableCell>
                          <TableCell>Course Name</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {complianceReport.nightClassCoverage.uncovered.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell>{course.code}</TableCell>
                            <TableCell>{course.name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          <Tab label="Load Distribution" />
          <Tab label="Compliance Report" />
          <Tab label="ITEES Summary" disabled />
          <Tab label="Department Analysis" disabled />
        </Tabs>
      </Box>

      {selectedTab === 0 && renderLoadDistributionReport()}
      {selectedTab === 1 && renderComplianceReport()}
      {selectedTab === 2 && (
        <Typography variant="body1" color="textSecondary">
          ITEES Summary report - Coming soon
        </Typography>
      )}
      {selectedTab === 3 && (
        <Typography variant="body1" color="textSecondary">
          Department Analysis report - Coming soon
        </Typography>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Violation Details</DialogTitle>
        <DialogContent>
          {selectedDetails && (
            <List>
              {selectedDetails.map((detail: any, index: number) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={detail.type}
                    secondary={detail.reason}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;