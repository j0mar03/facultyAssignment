import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { sectionService } from '../services/sectionService';
import { courseService } from '../services/courseService';
import { facultyService } from '../services/facultyService';
import SectionCalendar from '../components/SectionCalendar';

interface Section {
  id: string;
  sectionCode: string;
  courseId?: string;
  facultyId?: string;
  course: {
    id: string;
    code: string;
    name: string;
    credits: number;
  };
  faculty?: {
    id: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
  };
  status: 'Planning' | 'Assigned' | 'Active' | 'Completed' | 'Cancelled';
  classType: 'Regular' | 'Laboratory' | 'Lecture' | 'Combined';
  semester: string;
  academicYear: string;
  maxStudents: number;
  enrolledStudents: number;
  room?: string;
  timeSlots?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  isNightSection: boolean;
  lectureHours?: number;
  laboratoryHours?: number;
  notes?: string;
  hasConflicts?: boolean;
  conflicts?: any[];
}

interface SectionsOverview {
  summary: {
    totalSections: number;
    assignedSections: number;
    unassignedSections: number;
    nightSections: number;
    assignedNightSections: number;
    conflictCount: number;
    assignmentRate: number;
    nightAssignmentRate: number;
  };
  courseGrouping: any;
  unassignedSections: any[];
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Sections: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);
  const [overview, setOverview] = useState<SectionsOverview | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [filters, setFilters] = useState({
    semester: 'First',
    academicYear: '2025-2026',
    status: '',
    unassigned: false,
    hasConflicts: false,
    sectionCode: '',
    courseId: '',
    facultyId: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    sectionCode: '',
    courseId: '',
    facultyId: '',
    status: 'Planning',
    classType: 'Regular',
    semester: 'First',
    academicYear: '2024-2025',
    maxStudents: 30,
    enrolledStudents: 0,
    room: '',
    isNightSection: false,
    lectureHours: 0,
    laboratoryHours: 0,
    notes: '',
    timeSlots: [] as Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load sections with filters
      const sectionsResponse = await sectionService.getAllSections({
        ...filters,
        hasConflicts: filters.hasConflicts ? 'true' : undefined,
        unassigned: filters.unassigned ? 'true' : undefined,
        sectionCode: filters.sectionCode || undefined,
        courseId: filters.courseId || undefined,
        facultyId: filters.facultyId || undefined
      });
      
      // Transform sections to include fullName for faculty
      const transformedSections = sectionsResponse.map((section: Section) => ({
        ...section,
        faculty: section.faculty ? {
          ...section.faculty,
          fullName: section.faculty.fullName || `${section.faculty.firstName || ''} ${section.faculty.lastName || ''}`.trim()
        } : undefined
      }));
      
      setSections(transformedSections);

      // Load overview
      const overviewResponse = await sectionService.getSectionsOverview({
        semester: filters.semester,
        academicYear: filters.academicYear
      });
      setOverview(overviewResponse);

      // Load courses and faculty
      const [coursesResponse, facultyResponse] = await Promise.all([
        courseService.getAllCourses(),
        facultyService.getAllFaculty()
      ]);
      setCourses(coursesResponse);
      
      // Sort faculty by full name for easier selection
      const sortedFaculty = facultyResponse.sort((a, b) => {
        const nameA = a.fullName || `${a.firstName} ${a.lastName}`;
        const nameB = b.fullName || `${b.firstName} ${b.lastName}`;
        return nameA.localeCompare(nameB);
      });
      setFaculty(sortedFaculty);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = () => {
    setEditingSection(null);
    setFormData({
      sectionCode: '',
      courseId: '',
      facultyId: '',
      status: 'Planning',
      classType: 'Regular',
      semester: filters.semester,
      academicYear: filters.academicYear,
      maxStudents: 30,
      enrolledStudents: 0,
      room: '',
      isNightSection: false,
      notes: '',
      timeSlots: []
    });
    setOpenDialog(true);
  };

  const handleEditSection = (section: Section) => {
    console.log('Edit button clicked for section:', section);
    console.log('Section course:', section.course);
    console.log('Section faculty:', section.faculty);
    
    setEditingSection(section);
    const formDataToSet = {
      sectionCode: section.sectionCode,
      courseId: section.course?.id || section.courseId || '',
      facultyId: section.faculty?.id || section.facultyId || '',
      status: section.status,
      classType: section.classType,
      semester: section.semester,
      academicYear: section.academicYear,
      maxStudents: section.maxStudents,
      enrolledStudents: section.enrolledStudents,
      room: section.room || '',
      isNightSection: section.isNightSection,
      lectureHours: section.lectureHours || 0,
      laboratoryHours: section.laboratoryHours || 0,
      notes: section.notes || '',
      timeSlots: section.timeSlots || []
    };
    
    console.log('Setting form data:', formDataToSet);
    setFormData(formDataToSet);
    setOpenDialog(true);
  };

  const handleSaveSection = async () => {
    console.log('Save button clicked');
    console.log('Editing section:', editingSection);
    console.log('Form data being sent:', JSON.stringify(formData, null, 2));
    
    try {
      if (editingSection) {
        console.log('Updating section with ID:', editingSection.id);
        console.log('Data being sent to updateSection:', {
          id: editingSection.id,
          data: formData
        });
        await sectionService.updateSection(editingSection.id, formData);
      } else {
        console.log('Creating new section');
        await sectionService.createSection(formData);
      }
      // Clear the editing state and close dialog
      setEditingSection(null);
      setOpenDialog(false);
      // Reset form data
      setFormData({
        sectionCode: '',
        courseId: '',
        facultyId: '',
        status: 'Planning',
        classType: 'Regular',
        semester: 'First',
        academicYear: '2025-2026',
        maxStudents: 40,
        enrolledStudents: 0,
        room: '',
        isNightSection: false,
        lectureHours: 0,
        laboratoryHours: 0,
        notes: '',
        timeSlots: []
      });
      loadData();
    } catch (error: any) {
      console.error('Error saving section:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      // Keep dialog open on error so user can see what happened
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error saving section. Check console for details.';
      alert(errorMessage);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await sectionService.deleteSection(sectionId);
        loadData();
      } catch (error) {
        console.error('Error deleting section:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'default';
      case 'Assigned': return 'primary';
      case 'Active': return 'success';
      case 'Completed': return 'info';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatTimeSlots = (timeSlots?: any[]) => {
    if (!timeSlots || timeSlots.length === 0) return 'Not scheduled';
    return timeSlots.map(slot => 
      `${dayNames[slot.dayOfWeek]} ${slot.startTime}-${slot.endTime}`
    ).join(', ');
  };

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      timeSlots: [
        ...formData.timeSlots,
        {
          dayOfWeek: 1, // Monday
          startTime: '08:00',
          endTime: '09:00'
        }
      ]
    });
  };

  const removeTimeSlot = (index: number) => {
    const newTimeSlots = formData.timeSlots.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      timeSlots: newTimeSlots
    });
  };

  const updateTimeSlot = (index: number, field: string, value: any) => {
    const newTimeSlots = [...formData.timeSlots];
    newTimeSlots[index] = { ...newTimeSlots[index], [field]: value };
    setFormData({
      ...formData,
      timeSlots: newTimeSlots
    });
  };

  const OverviewTab = () => (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {overview?.summary.totalSections || 0}
                </Typography>
                <Typography variant="body2">Total Sections</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {overview?.summary.assignedSections || 0}
                </Typography>
                <Typography variant="body2">Assigned Sections</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={overview?.summary.assignmentRate || 0}
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption">
                  {overview?.summary.assignmentRate || 0}% assigned
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {overview?.summary.unassignedSections || 0}
                </Typography>
                <Typography variant="body2">Unassigned Sections</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error.main">
                  {overview?.summary.conflictCount || 0}
                </Typography>
                <Typography variant="body2">Conflicts</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Night Class Coverage */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Night Class Coverage
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {overview?.summary.assignedNightSections || 0} of {overview?.summary.nightSections || 0} night sections assigned
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={overview?.summary.nightAssignmentRate || 0}
              sx={{ mt: 2 }}
            />
            <Typography variant="caption">
              {overview?.summary.nightAssignmentRate || 0}% coverage
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Unassigned Sections */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Unassigned Sections
            </Typography>
            {overview?.unassignedSections.length === 0 ? (
              <Typography variant="body2" color="success.main">
                All sections have been assigned!
              </Typography>
            ) : (
              overview?.unassignedSections.map((section: any) => (
                <Box key={section.id} sx={{ mb: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle2">
                    {section.courseCode} - {section.sectionCode}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {section.courseName}
                    {section.isNightSection && (
                      <Chip size="small" label="Night" color="primary" sx={{ ml: 1 }} />
                    )}
                  </Typography>
                  <Typography variant="caption">
                    {section.enrolledStudents}/{section.maxStudents} students
                  </Typography>
                </Box>
              ))
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const resetFilters = () => {
    setFilters({
      semester: 'First',
      academicYear: '2025-2026',
      status: '',
      unassigned: false,
      hasConflicts: false,
      sectionCode: '',
      courseId: '',
      facultyId: ''
    });
  };

  const SectionsListTab = () => (
    <Box>
      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Semester</InputLabel>
          <Select
            value={filters.semester}
            label="Semester"
            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
          >
            <MenuItem value="First">First Semester</MenuItem>
            <MenuItem value="Second">Second Semester</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Planning">Planning</MenuItem>
            <MenuItem value="Assigned">Assigned</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Section</InputLabel>
          <Select
            value={filters.sectionCode}
            label="Section"
            onChange={(e) => setFilters({ ...filters, sectionCode: e.target.value })}
          >
            <MenuItem value="">All Sections</MenuItem>
            {Array.from(new Set(sections.map(s => s.sectionCode))).sort().map(code => (
              <MenuItem key={code} value={code}>{code}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Course</InputLabel>
          <Select
            value={filters.courseId}
            label="Course"
            onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
          >
            <MenuItem value="">All Courses</MenuItem>
            {courses.map(course => (
              <MenuItem key={course.id} value={course.id}>
                {course.code} - {course.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Faculty</InputLabel>
          <Select
            value={filters.facultyId}
            label="Faculty"
            onChange={(e) => setFilters({ ...filters, facultyId: e.target.value })}
          >
            <MenuItem value="">All Faculty</MenuItem>
            {faculty.map(f => (
              <MenuItem key={f.id} value={f.id}>
                {f.fullName || `${f.firstName} ${f.lastName}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant={filters.unassigned ? "contained" : "outlined"}
            onClick={() => setFilters({ ...filters, unassigned: !filters.unassigned })}
            startIcon={<WarningIcon />}
          >
            Unassigned Only
          </Button>
          
          <Button
            variant={filters.hasConflicts ? "contained" : "outlined"}
            color="error"
            onClick={() => setFilters({ ...filters, hasConflicts: !filters.hasConflicts })}
            startIcon={<WarningIcon />}
          >
            Conflicts Only
          </Button>

          <Button
            variant="outlined"
            onClick={resetFilters}
            disabled={filters.status === '' && filters.sectionCode === '' && filters.courseId === '' && filters.facultyId === '' && !filters.unassigned && !filters.hasConflicts}
          >
            Reset Filters
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateSection}
          >
            Add Section
          </Button>
        </Box>
      </Box>

      {/* Results Count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {sections.filter(section => {
            if (filters.sectionCode && section.sectionCode !== filters.sectionCode) return false;
            if (filters.courseId && section.courseId !== filters.courseId) return false;
            if (filters.facultyId && section.facultyId !== filters.facultyId) return false;
            return true;
          }).length} of {sections.length} sections
        </Typography>
      </Box>

      {/* Sections Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Section</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Faculty</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Students</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sections
              .filter(section => {
                // Apply client-side filtering for immediate response
                if (filters.sectionCode && section.sectionCode !== filters.sectionCode) return false;
                if (filters.courseId && section.courseId !== filters.courseId) return false;
                if (filters.facultyId && section.facultyId !== filters.facultyId) return false;
                return true;
              })
              .map((section) => (
              <TableRow key={section.id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">
                      {section.sectionCode}
                    </Typography>
                    {section.isNightSection && (
                      <Chip size="small" label="Night" color="primary" />
                    )}
                    {section.hasConflicts && (
                      <Chip size="small" label="Conflict" color="error" icon={<WarningIcon />} />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">
                    {section.course.code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {section.course.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  {section.faculty ? (
                    <Typography variant="body2">
                      {section.faculty.fullName}
                    </Typography>
                  ) : (
                    <Chip size="small" label="Unassigned" color="warning" />
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    size="small" 
                    label={section.status} 
                    color={getStatusColor(section.status) as any}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {section.enrolledStudents}/{section.maxStudents}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(section.enrolledStudents / section.maxStudents) * 100}
                    sx={{ mt: 0.5 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatTimeSlots(section.timeSlots)}
                  </Typography>
                  {section.room && (
                    <Typography variant="caption" color="text.secondary">
                      Room: {section.room}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {!section.faculty && (
                    <Tooltip title="Assign Faculty">
                      <IconButton size="small" color="primary" onClick={() => {
                        // Open faculty assignment dialog - we need to implement this
                        // For now, use the edit dialog
                        handleEditSection(section);
                      }}>
                        <PersonIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleEditSection(section)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleDeleteSection(section.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Section Management
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Manage class sections, detect scheduling conflicts, and track faculty assignments
      </Typography>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Overview" icon={<SchoolIcon />} />
        <Tab label="Weekly Calendar" icon={<ScheduleIcon />} />
        <Tab label="Sections List" icon={<AssignmentIcon />} />
      </Tabs>

      {loading ? (
        <Box sx={{ mt: 4 }}>
          <LinearProgress />
        </Box>
      ) : (
        <>
          {activeTab === 0 && <OverviewTab />}
          {activeTab === 1 && (
            <SectionCalendar 
              sections={sections}
              onSectionClick={(section) => {
                // For calendar view, let SectionCalendar handle the click logic
                // It will open assignment dialog for unassigned sections
                // and details dialog for assigned sections
              }}
              onSectionAssign={handleEditSection}
              onSectionUpdate={loadData}
            />
          )}
          {activeTab === 2 && <SectionsListTab />}
        </>
      )}

      {/* Section Dialog */}
      <Dialog open={openDialog} onClose={() => {
        console.log('Dialog closing');
        setOpenDialog(false);
      }} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSection ? 'Edit Section' : 'Create New Section'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Section Code"
                value={formData.sectionCode}
                onChange={(e) => setFormData({ ...formData, sectionCode: e.target.value })}
                placeholder="e.g., DCPET 1-1"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select
                  value={formData.courseId}
                  label="Course"
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Faculty (Optional)</InputLabel>
                <Select
                  value={formData.facultyId}
                  label="Faculty (Optional)"
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {faculty.map((f) => (
                    <MenuItem key={f.id} value={f.id} sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                        <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                          {f.fullName || `${f.firstName} ${f.lastName}`}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 0.25 }}>
                          <Typography variant="caption" sx={{ 
                            backgroundColor: 'primary.light', 
                            color: 'primary.contrastText',
                            px: 1, 
                            py: 0.25, 
                            borderRadius: 1,
                            fontSize: '0.7rem'
                          }}>
                            {f.type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {f.department}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
                          Load: {f.currentRegularLoad}h + {f.currentExtraLoad}h extra
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Class Type</InputLabel>
                <Select
                  value={formData.classType}
                  label="Class Type"
                  onChange={(e) => setFormData({ ...formData, classType: e.target.value })}
                >
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Laboratory">Laboratory</MenuItem>
                  <MenuItem value="Lecture">Lecture</MenuItem>
                  <MenuItem value="Combined">Combined</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Planning">Planning</MenuItem>
                  <MenuItem value="Assigned">Assigned</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Max Students"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Enrolled Students"
                value={formData.enrolledStudents}
                onChange={(e) => setFormData({ ...formData, enrolledStudents: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Room"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g., IT204"
              />
            </Grid>

            {/* Lecture and Laboratory Hours */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Lecture Hours"
                value={formData.lectureHours}
                onChange={(e) => setFormData({ ...formData, lectureHours: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, step: 0.5 }}
                helperText="Hours allocated for lecture component"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Laboratory Hours"
                value={formData.laboratoryHours}
                onChange={(e) => setFormData({ ...formData, laboratoryHours: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, step: 0.5 }}
                helperText="Hours allocated for laboratory component"
              />
            </Grid>

            {/* Time Slots Section */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Schedule Time Slots
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<AddIcon />}
                    onClick={addTimeSlot}
                  >
                    Add Time Slot
                  </Button>
                </Box>

                {formData.timeSlots.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No time slots configured. Click "Add Time Slot" to schedule this section.
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {formData.timeSlots.map((slot, index) => (
                      <Card key={index} variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                              <InputLabel>Day of Week</InputLabel>
                              <Select
                                value={slot.dayOfWeek}
                                label="Day of Week"
                                onChange={(e) => updateTimeSlot(index, 'dayOfWeek', e.target.value)}
                              >
                                {dayNames.slice(1, 7).map((day, dayIndex) => (
                                  <MenuItem key={dayIndex + 1} value={dayIndex + 1}>
                                    {day}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              type="time"
                              label="Start Time"
                              value={slot.startTime}
                              onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              type="time"
                              label="End Time"
                              value={slot.endTime}
                              onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <IconButton 
                              color="error" 
                              onClick={() => removeTimeSlot(index)}
                              title="Remove time slot"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setEditingSection(null);
            // Reset form data on cancel
            setFormData({
              sectionCode: '',
              courseId: '',
              facultyId: '',
              status: 'Planning',
              classType: 'Regular',
              semester: 'First',
              academicYear: '2025-2026',
              maxStudents: 40,
              enrolledStudents: 0,
              room: '',
              isNightSection: false,
              lectureHours: 0,
              laboratoryHours: 0,
              notes: '',
              timeSlots: []
            });
          }}>Cancel</Button>
          <Button onClick={handleSaveSection} variant="contained">
            {editingSection ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sections;