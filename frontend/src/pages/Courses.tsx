import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Book as BookIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Search as SearchIcon,
  NightlightRound as NightIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { getCourses, createCourse } from '../services/api';

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  contactHours: number;
  program: string;
  department: string;
  semester: string;
  academicYear: string;
  requiresNightSection: boolean;
  maxStudents: number;
  enrolledStudents: number;
  isActive: boolean;
}

interface CourseFormData {
  code: string;
  name: string;
  credits: number;
  contactHours: number;
  program: string;
  department: string;
  semester: string;
  academicYear: string;
  requiresNightSection: boolean;
  maxStudents: number;
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterDepartment, setFilterDepartment] = useState('All');
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CourseFormData>();

  const departments = [
    'All',
    'Computer Science',
    'Information Technology',
    'Information Systems',
    'Computer Engineering',
  ];

  const programs = [
    'Bachelor of Science in Computer Science',
    'Bachelor of Science in Information Technology',
    'Bachelor of Science in Information Systems',
    'Bachelor of Science in Computer Engineering',
  ];

  const semesters = ['First', 'Second', 'Summer'];
  const academicYears = ['2024-2025', '2025-2026'];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, filterDepartment, selectedTab]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.program.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by department
    if (filterDepartment !== 'All') {
      filtered = filtered.filter((course) => course.department === filterDepartment);
    }

    // Filter by tab
    switch (selectedTab) {
      case 1: // Night Classes
        filtered = filtered.filter((course) => course.requiresNightSection);
        break;
      case 2: // High Enrollment
        filtered = filtered.filter((course) => course.enrolledStudents >= course.maxStudents * 0.8);
        break;
      default:
        break;
    }

    setFilteredCourses(filtered);
  };

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      reset({
        code: course.code,
        name: course.name,
        credits: course.credits,
        contactHours: course.contactHours,
        program: course.program,
        department: course.department,
        semester: course.semester,
        academicYear: course.academicYear,
        requiresNightSection: course.requiresNightSection,
        maxStudents: course.maxStudents,
      });
    } else {
      setEditingCourse(null);
      reset({
        code: '',
        name: '',
        credits: 3,
        contactHours: 3,
        program: programs[0],
        department: 'Computer Science',
        semester: 'First',
        academicYear: '2024-2025',
        requiresNightSection: false,
        maxStudents: 40,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCourse(null);
    reset();
  };

  const onSubmit = async (data: CourseFormData) => {
    try {
      if (editingCourse) {
        // Update course API call would go here
        console.log('Update course:', data);
      } else {
        await createCourse(data);
      }
      await fetchCourses();
      handleCloseDialog();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save course');
    }
  };

  const getEnrollmentStatus = (enrolled: number, max: number) => {
    const percentage = (enrolled / max) * 100;
    if (percentage >= 100) return { label: 'Full', color: 'error' };
    if (percentage >= 80) return { label: 'High', color: 'warning' };
    if (percentage >= 50) return { label: 'Medium', color: 'info' };
    return { label: 'Low', color: 'success' };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Course Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Course
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Course Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BookIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{courses.length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Courses
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
                <NightIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {courses.filter(c => c.requiresNightSection).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Night Classes
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
                <GroupIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {courses.reduce((sum, c) => sum + c.enrolledStudents, 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Enrolled
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
                <ScheduleIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {courses.filter(c => (c.enrolledStudents / c.maxStudents) >= 0.8).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    High Enrollment
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Department"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2 }}>
            <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
              <Tab label="All Courses" />
              <Tab label="Night Classes" />
              <Tab label="High Enrollment" />
            </Tabs>
          </Box>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course Code</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>Program</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Contact Hours</TableCell>
              <TableCell>Enrollment</TableCell>
              <TableCell>Features</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCourses.map((course) => {
              const enrollmentStatus = getEnrollmentStatus(
                course.enrolledStudents,
                course.maxStudents
              );
              
              return (
                <TableRow key={course.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {course.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {course.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {course.department}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {course.program.replace('Bachelor of Science in ', 'BS ')}
                    </Typography>
                  </TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>{course.contactHours}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {course.enrolledStudents}/{course.maxStudents}
                    </Typography>
                    <Chip
                      label={enrollmentStatus.label}
                      color={enrollmentStatus.color as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {course.requiresNightSection && (
                      <Chip
                        label="Night Section"
                        color="info"
                        size="small"
                        icon={<NightIcon />}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={course.isActive ? 'Active' : 'Inactive'}
                      color={course.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(course)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Course Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCourse ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="code"
                  control={control}
                  rules={{ required: 'Course code is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Course Code"
                      error={!!errors.code}
                      helperText={errors.code?.message}
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="credits"
                  control={control}
                  rules={{ 
                    required: 'Credits is required',
                    min: { value: 1, message: 'Credits must be at least 1' },
                    max: { value: 6, message: 'Credits cannot exceed 6' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Credits"
                      type="number"
                      error={!!errors.credits}
                      helperText={errors.credits?.message}
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Course name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Course Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="program"
                  control={control}
                  rules={{ required: 'Program is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Program"
                      error={!!errors.program}
                      helperText={errors.program?.message}
                      margin="normal"
                    >
                      {programs.map((program) => (
                        <MenuItem key={program} value={program}>
                          {program}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="department"
                  control={control}
                  rules={{ required: 'Department is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Department"
                      error={!!errors.department}
                      helperText={errors.department?.message}
                      margin="normal"
                    >
                      {departments.filter(d => d !== 'All').map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="contactHours"
                  control={control}
                  rules={{ 
                    required: 'Contact hours is required',
                    min: { value: 1, message: 'Contact hours must be at least 1' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Contact Hours"
                      type="number"
                      error={!!errors.contactHours}
                      helperText={errors.contactHours?.message}
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="semester"
                  control={control}
                  rules={{ required: 'Semester is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Semester"
                      error={!!errors.semester}
                      helperText={errors.semester?.message}
                      margin="normal"
                    >
                      {semesters.map((sem) => (
                        <MenuItem key={sem} value={sem}>
                          {sem}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="academicYear"
                  control={control}
                  rules={{ required: 'Academic year is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Academic Year"
                      error={!!errors.academicYear}
                      helperText={errors.academicYear?.message}
                      margin="normal"
                    >
                      {academicYears.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="maxStudents"
                  control={control}
                  rules={{ 
                    required: 'Max students is required',
                    min: { value: 1, message: 'Max students must be at least 1' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Max Students"
                      type="number"
                      error={!!errors.maxStudents}
                      helperText={errors.maxStudents?.message}
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="requiresNightSection"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Requires Night Section (4:30 PM - 9:00 PM)"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCourse ? 'Update' : 'Add'} Course
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Courses;