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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  getFaculty,
} from '../services/api';
import { sectionService } from '../services/sectionService';
import * as XLSX from 'xlsx';

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

interface SectionReportData {
  subjectCode: string;
  description: string;
  lecHours: number;
  labHours: number;
  totalHours: number;
  units: number;
  section: string;
  roomNo: string;
  day: string;
  startTime: string;
  endTime: string;
  faculty: string;
}

interface FacultyLoadingSummary {
  facultyId: string;
  name: string;
  type: string;
  department: string;
  totalHours: number;
  sectionCount: number;
}

const Reports: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [loadDistribution, setLoadDistribution] = useState<LoadDistribution[]>([]);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [sectionReportData, setSectionReportData] = useState<SectionReportData[]>([]);
  const [sectionFilters, setSectionFilters] = useState({
    semester: 'Second',
    academicYear: '2025-2026',
    sectionCode: '',
  });
  const [availableSectionCodes, setAvailableSectionCodes] = useState<string[]>([]);
  const [facultyLoadingSummary, setFacultyLoadingSummary] = useState<FacultyLoadingSummary[]>([]);
  const [facultyLoadingFilters, setFacultyLoadingFilters] = useState({
    semester: 'Second',
    academicYear: '2025-2026',
    facultyId: 'all',
  });
  const [facultyOptions, setFacultyOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);

  useEffect(() => {
    if (selectedTab === 0) {
      fetchLoadDistribution();
    } else if (selectedTab === 1) {
      fetchComplianceReport();
    } else if (selectedTab === 2) {
      fetchSectionReport();
    } else if (selectedTab === 3) {
      fetchFacultyLoadingSummary();
    }
  }, [selectedTab]);

  useEffect(() => {
    if (selectedTab === 2) {
      fetchSectionReport();
    }
  }, [sectionFilters]);

  useEffect(() => {
    if (selectedTab === 3) {
      fetchFacultyLoadingSummary();
    }
  }, [facultyLoadingFilters]);

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

  const fetchSectionReport = async () => {
    try {
      setLoading(true);
      const sections = await sectionService.getAllSections({
        semester: sectionFilters.semester,
        academicYear: sectionFilters.academicYear,
        sectionCode: sectionFilters.sectionCode || undefined,
      });
      
      // Flatten sections with multiple time slots into separate rows
      const reportRows: SectionReportData[] = [];

      sections.forEach((section: any) => {
        const timeSlots = section.timeSlots && section.timeSlots.length > 0
          ? section.timeSlots
          : [{ dayOfWeek: undefined, startTime: '', endTime: '' }];

        timeSlots.forEach((slot: any) => {
          reportRows.push({
            subjectCode: section.course?.code || '',
            description: section.course?.name || '',
            lecHours: section.lectureHours || 0,
            labHours: section.laboratoryHours || 0,
            totalHours: (section.lectureHours || 0) + (section.laboratoryHours || 0),
            units: section.course?.credits || 0,
            section: section.sectionCode || '',
            roomNo: section.room || 'TBA',
            day: slot.dayOfWeek !== undefined ? getDayName(slot.dayOfWeek) : '',
            startTime: slot.startTime || '',
            endTime: slot.endTime || '',
            faculty: section.faculty ? `${section.faculty.firstName} ${section.faculty.lastName}` : 'Unassigned'
          });
        });
      });
      
      setSectionReportData(reportRows);

      // Update available section codes for the filter dropdown
      const codes = Array.from(new Set(sections.map((s: any) => s.sectionCode))).sort();
      setAvailableSectionCodes(codes);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch section report');
    } finally {
      setLoading(false);
    }
  };

  // Helper to compute total hours for a section based on its schedule
  const computeSectionHours = (section: any): number => {
    if (section.timeSlots && Array.isArray(section.timeSlots) && section.timeSlots.length > 0) {
      const totalMinutes = section.timeSlots.reduce((sum: number, slot: any) => {
        if (!slot.startTime || !slot.endTime) return sum;
        const [sh, sm] = slot.startTime.split(':').map(Number);
        const [eh, em] = slot.endTime.split(':').map(Number);
        const minutes = (eh * 60 + em) - (sh * 60 + sm);
        return sum + (minutes > 0 ? minutes : 0);
      }, 0);
      return totalMinutes / 60;
    }

    return Number(section.lectureHours || 0) + Number(section.laboratoryHours || 0);
  };

  const fetchFacultyLoadingSummary = async () => {
    try {
      setLoading(true);
      const [sections, faculty] = await Promise.all([
        sectionService.getAllSections({
          semester: facultyLoadingFilters.semester,
          academicYear: facultyLoadingFilters.academicYear,
        }),
        getFaculty(),
      ]);

      setFacultyOptions(faculty);

      const summaryMap = new Map<string, FacultyLoadingSummary>();

      sections.forEach((section: any) => {
        if (!section.faculty) return;
        if (facultyLoadingFilters.facultyId !== 'all' && section.faculty.id !== facultyLoadingFilters.facultyId) {
          return;
        }

        const baseHours = computeSectionHours(section);
        const facultyMeta = faculty.find((f: any) => f.id === section.faculty.id);
        const name =
          facultyMeta?.fullName ||
          (facultyMeta ? `${facultyMeta.firstName} ${facultyMeta.lastName}`.trim() : section.faculty.fullName);

        const key = section.faculty.id;
        const existing = summaryMap.get(key);

        if (existing) {
          existing.totalHours += baseHours;
          existing.sectionCount += 1;
        } else {
          summaryMap.set(key, {
            facultyId: key,
            name,
            type: facultyMeta?.type || 'Regular',
            department: facultyMeta?.department || '',
            totalHours: baseHours,
            sectionCount: 1,
          });
        }
      });

      const summaryArray = Array.from(summaryMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      setFacultyLoadingSummary(summaryArray);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch faculty loading summary');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || '';
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

  const handleExportSectionReport = () => {
    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Convert data to Excel format
      const ws_data = [
        ['Subject Code', 'Description', 'Lec Hours', 'Lab Hours', 'Total Hours', 'Units', 'Section', 'Room No.', 'Day', 'Start Time', 'End Time', 'Faculty'],
        ...sectionReportData.map(row => [
          row.subjectCode,
          row.description,
          row.lecHours,
          row.labHours,
          row.totalHours,
          row.units,
          row.section,
          row.roomNo,
          row.day,
          row.startTime,
          row.endTime,
          row.faculty
        ])
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 12 }, // Subject Code
        { wch: 30 }, // Description
        { wch: 10 }, // Lec Hours
        { wch: 10 }, // Lab Hours
        { wch: 12 }, // Total Hours
        { wch: 8 },  // Units
        { wch: 12 }, // Section
        { wch: 10 }, // Room No.
        { wch: 12 }, // Day
        { wch: 12 }, // Start Time
        { wch: 12 }, // End Time
        { wch: 20 }  // Faculty
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'Section Report');
      
      // Generate filename with current date
      const today = new Date();
      const filename = `Section_Report_${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}.xlsx`;
      
      XLSX.writeFile(wb, filename);
    } catch (err) {
      setError('Failed to export section report');
    }
  };

  const handleExportFacultyLoadingSummary = () => {
    try {
      const wb = XLSX.utils.book_new();

      const ws_data = [
        ['Faculty Name', 'Type', 'Department', 'Total Hours', 'No. of Sections'],
        ...facultyLoadingSummary.map((row) => [
          row.name ?? '',
          row.type ?? '',
          row.department ?? '',
          row.totalHours ?? 0,
          row.sectionCount ?? 0,
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(ws_data);

      // Attach worksheet to workbook (required so workbook is not empty)
      XLSX.utils.book_append_sheet(wb, ws, 'Faculty Loading Summary');

      ws['!cols'] = [
        { wch: 30 }, // Faculty Name
        { wch: 12 }, // Type
        { wch: 20 }, // Department
        { wch: 12 }, // Total Hours
        { wch: 16 }, // No. of Sections
      ];

      const today = new Date();
      const filename = `Faculty_Loading_Summary_${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}.xlsx`;

      XLSX.writeFile(wb, filename);
    } catch (err: any) {
      console.error('Failed to export faculty loading summary:', err);
      const message =
        err?.message || (typeof err === 'string' ? err : 'Failed to export faculty loading summary');
      setError(message);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      Regular: 'primary',
      PartTime: 'secondary',
      Temporary: 'warning',
      Designee: 'info',
      AdminFaculty: 'warning',
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
      Designee: 15, // 9 regular + 6 extra
      AdminFaculty: 15, // 0 regular + 15 extra (part-time hours)
    };
    return limits[type as keyof typeof limits] || 0;
  };

  const showViolationDetails = (violations: any[]) => {
    setSelectedDetails(violations);
    setDetailsDialogOpen(true);
  };

  const renderSectionReport = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Section Report
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportSectionReport}
          disabled={sectionReportData.length === 0}
        >
          Export to Excel
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Semester</InputLabel>
          <Select
            value={sectionFilters.semester}
            label="Semester"
            onChange={(e) => setSectionFilters({ ...sectionFilters, semester: e.target.value })}
          >
            <MenuItem value="First">First Semester</MenuItem>
            <MenuItem value="Second">Second Semester</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Section</InputLabel>
          <Select
            value={sectionFilters.sectionCode}
            label="Section"
            onChange={(e) => setSectionFilters({ ...sectionFilters, sectionCode: e.target.value })}
          >
            <MenuItem value="">All Sections</MenuItem>
            {availableSectionCodes.map(code => (
              <MenuItem key={code} value={code}>{code}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SchoolIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{sectionReportData.length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Sections
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
                <PeopleIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {sectionReportData.filter(s => s.faculty !== 'Unassigned').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Assigned Sections
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
                    {sectionReportData.filter(s => s.faculty === 'Unassigned').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Unassigned Sections
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
                <ScheduleIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {sectionReportData.reduce((sum, s) => sum + s.totalHours, 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Hours
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Section Report Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject Code</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Lec Hours</TableCell>
              <TableCell align="center">Lab Hours</TableCell>
              <TableCell align="center">Total Hours</TableCell>
              <TableCell align="center">Units</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Room No.</TableCell>
              <TableCell>Day</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Faculty</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sectionReportData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.subjectCode}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell align="center">{row.lecHours}</TableCell>
                <TableCell align="center">{row.labHours}</TableCell>
                <TableCell align="center">{row.totalHours}</TableCell>
                <TableCell align="center">{row.units}</TableCell>
                <TableCell>{row.section}</TableCell>
                <TableCell>{row.roomNo}</TableCell>
                <TableCell>{row.day}</TableCell>
                <TableCell>{row.startTime}</TableCell>
                <TableCell>{row.endTime}</TableCell>
                <TableCell>
                  <Chip
                    label={row.faculty}
                    color={row.faculty === 'Unassigned' ? 'error' : 'success'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

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

  const renderFacultyLoadingSummary = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Faculty Loading Summary
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportFacultyLoadingSummary}
          disabled={facultyLoadingSummary.length === 0}
        >
          Export to Excel
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Semester</InputLabel>
          <Select
            value={facultyLoadingFilters.semester}
            label="Semester"
            onChange={(e) =>
              setFacultyLoadingFilters({ ...facultyLoadingFilters, semester: e.target.value })
            }
          >
            <MenuItem value="First">First Semester</MenuItem>
            <MenuItem value="Second">Second Semester</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Faculty</InputLabel>
          <Select
            value={facultyLoadingFilters.facultyId}
            label="Faculty"
            onChange={(e) =>
              setFacultyLoadingFilters({ ...facultyLoadingFilters, facultyId: e.target.value })
            }
          >
            <MenuItem value="all">All Faculty</MenuItem>
            {facultyOptions.map((f: any) => (
              <MenuItem key={f.id} value={f.id}>
                {f.fullName || `${f.firstName} ${f.lastName}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{facultyLoadingSummary.length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Faculty with Load
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
                <ScheduleIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {facultyLoadingSummary.reduce((sum, f) => sum + f.totalHours, 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Hours
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Faculty Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Department</TableCell>
              <TableCell align="center">Total Hours</TableCell>
              <TableCell align="center">No. of Sections</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facultyLoadingSummary.map((row) => (
              <TableRow key={row.facultyId}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell align="center">{row.totalHours}</TableCell>
                <TableCell align="center">{row.sectionCount}</TableCell>
              </TableRow>
            ))}
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
          <Tab label="Section Report" />
          <Tab label="Faculty Loading Summary" />
        </Tabs>
      </Box>

      {selectedTab === 0 && renderLoadDistributionReport()}
      {selectedTab === 1 && renderComplianceReport()}
      {selectedTab === 2 && renderSectionReport()}
      {selectedTab === 3 && renderFacultyLoadingSummary()}

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