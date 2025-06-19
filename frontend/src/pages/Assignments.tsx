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
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Book as BookIcon,
  AccessTime as TimeIcon,
  Room as RoomIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import {
  getAssignments,
  createAssignment,
  validateAssignment,
  approveAssignment,
  updateAssignment,
  getFaculty,
  getCourses,
} from '../services/api';

interface Assignment {
  id: string;
  facultyId: string;
  courseId: string;
  sectionId?: string;
  faculty?: Faculty;
  course?: Course;
  sectionEntity?: {
    id: string;
    sectionCode: string;
    room?: string;
    status: string;
  };
  type: 'Regular' | 'Extra' | 'OJT' | 'Seminar';
  status: 'Proposed' | 'Approved' | 'Active' | 'Completed';
  timeSlot: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  };
  semester: string;
  academicYear: string;
  section?: string;
  room?: string;
  creditHours: number;
  contactHours: number;
  lectureHours?: number;
  laboratoryHours?: number;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

interface Faculty {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  type: 'Regular' | 'PartTime' | 'Temporary' | 'Designee';
  department: string;
  currentRegularLoad: number;
  currentExtraLoad: number;
  consecutiveLowRatings: number;
}

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
}

interface AssignmentFormData {
  facultyId: string;
  courseId: string;
  type: 'Regular' | 'Extra' | 'OJT' | 'Seminar';
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  semester: string;
  academicYear: string;
  section?: string;
  room?: string;
  lectureHours?: number;
  laboratoryHours?: number;
  notes?: string;
}

const Assignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<AssignmentFormData>();
  
  const watchedFacultyId = watch('facultyId');
  const watchedCourseId = watch('courseId');
  const watchedType = watch('type');
  const watchedDayOfWeek = watch('dayOfWeek');
  const watchedStartTime = watch('startTime');
  const watchedEndTime = watch('endTime');

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const loadTypes = [
    { value: 'Regular', label: 'Regular Load' },
    { value: 'Extra', label: 'Extra Load' },
    { value: 'OJT', label: 'OJT Supervision' },
    { value: 'Seminar', label: 'Seminar/Workshop' },
  ];

  const timeSlots = [
    { value: '07:30', label: '7:30 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:30', label: '10:30 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:30', label: '2:30 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '16:30', label: '4:30 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '19:30', label: '7:30 PM' },
    { value: '21:00', label: '9:00 PM' },
  ];

  const steps = [
    'Select Faculty & Course',
    'Configure Time Slot',
    'Validate Assignment',
    'Review & Submit'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (watchedFacultyId) {
      const faculty = facultyList.find(f => f.id === watchedFacultyId);
      setSelectedFaculty(faculty || null);
    }
  }, [watchedFacultyId]);

  useEffect(() => {
    if (watchedCourseId) {
      const course = courses.find(c => c.id === watchedCourseId);
      setSelectedCourse(course || null);
    }
  }, [watchedCourseId]);

  useEffect(() => {
    if (activeStep === 2 && watchedFacultyId && watchedCourseId && watchedType && watchedDayOfWeek !== undefined && watchedStartTime && watchedEndTime) {
      validateCurrentAssignment();
    }
  }, [activeStep, watchedFacultyId, watchedCourseId, watchedType, watchedDayOfWeek, watchedStartTime, watchedEndTime]);

  const facultyList = faculty.map(f => ({
    ...f,
    label: `${f.firstName} ${f.lastName} (${f.employeeId})`,
    value: f.id
  }));

  const courseList = courses.map(c => ({
    ...c,
    label: `${c.code} - ${c.name}`,
    value: c.id
  }));

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, facultyData, coursesData] = await Promise.all([
        getAssignments(),
        getFaculty(),
        getCourses(),
      ]);
      setAssignments(assignmentsData);
      setFaculty(facultyData);
      setCourses(coursesData);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentAssignment = async () => {
    try {
      const formData = {
        facultyId: watchedFacultyId,
        courseId: watchedCourseId,
        type: watchedType,
        timeSlot: {
          dayOfWeek: watchedDayOfWeek,
          startTime: watchedStartTime,
          endTime: watchedEndTime,
        },
      };
      
      const result = await validateAssignment(formData);
      setValidationResult(result);
    } catch (err: any) {
      setValidationResult({
        valid: false,
        errors: [err.response?.data?.error || 'Validation failed']
      });
    }
  };

  const handleOpenDialog = () => {
    reset({
      facultyId: '',
      courseId: '',
      type: 'Regular',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '12:00',
      semester: 'First',
      academicYear: '2024-2025',
      section: '',
      room: '',
      notes: '',
    });
    setActiveStep(0);
    setValidationResult(null);
    setSelectedFaculty(null);
    setSelectedCourse(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setActiveStep(0);
    setValidationResult(null);
    setSelectedFaculty(null);
    setSelectedCourse(null);
    reset();
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      const assignmentData = {
        ...data,
        timeSlot: {
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
        },
        creditHours: selectedCourse?.credits || 0,
        contactHours: selectedCourse?.contactHours || 0,
      };
      
      await createAssignment(assignmentData);
      await fetchData();
      handleCloseDialog();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create assignment');
    }
  };

  const handleApprove = async (assignmentId: string) => {
    try {
      await approveAssignment(assignmentId);
      await fetchData();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve assignment');
    }
  };

  const handleEditClick = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    reset({
      facultyId: assignment.facultyId,
      courseId: assignment.courseId,
      type: assignment.type,
      dayOfWeek: assignment.timeSlot.dayOfWeek,
      startTime: assignment.timeSlot.startTime,
      endTime: assignment.timeSlot.endTime,
      semester: assignment.semester,
      academicYear: assignment.academicYear,
      lectureHours: assignment.lectureHours || 0,
      laboratoryHours: assignment.laboratoryHours || 0,
      notes: '',
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditingAssignment(null);
  };

  const handleEditSubmit = async (data: AssignmentFormData) => {
    if (!editingAssignment) return;
    
    try {
      const assignmentData = {
        ...data,
        timeSlot: {
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
        },
      };
      
      await updateAssignment(editingAssignment.id, assignmentData);
      await fetchData();
      handleEditClose();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update assignment');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Proposed: 'warning',
      Approved: 'info',
      Active: 'success',
      Completed: 'default',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      Regular: 'primary',
      Extra: 'secondary',
      OJT: 'info',
      Seminar: 'warning',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getLoadLimitForType = (type: string) => {
    const limits = {
      Regular: { regular: 21, extra: 9 },
      PartTime: { regular: 12, extra: 0 },
      Temporary: { regular: 21, extra: 9 },
      Designee: { regular: 9, extra: 6 },
    };
    return limits[type as keyof typeof limits] || { regular: 0, extra: 0 };
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
          Assignment Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Create Assignment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Assignment Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ScheduleIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{assignments.length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Assignments
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
                <CheckIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {assignments.filter(a => a.status === 'Active').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Assignments
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
                    {assignments.filter(a => a.status === 'Proposed').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending Approval
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
                <TimeIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {assignments.filter(a => a.course?.requiresNightSection).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Night Classes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assignments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Faculty</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Load Hours</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {assignment.faculty ? 
                      `${assignment.faculty.firstName} ${assignment.faculty.lastName}` : 
                      'Unknown Faculty'
                    }
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {assignment.faculty?.employeeId || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {assignment.course?.code || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {assignment.course?.name || 'Course name not available'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {assignment.sectionEntity ? (
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {assignment.sectionEntity.sectionCode}
                      </Typography>
                      <Chip 
                        label={assignment.sectionEntity.status} 
                        size="small" 
                        color={assignment.sectionEntity.status === 'Assigned' ? 'success' : 'default'} 
                      />
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {assignment.section || 'No section'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        (Not linked)
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={assignment.type}
                    color={getTypeColor(assignment.type) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {dayNames[assignment.timeSlot.dayOfWeek]}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatTime(assignment.timeSlot.startTime)} - {formatTime(assignment.timeSlot.endTime)}
                  </Typography>
                </TableCell>
                <TableCell>{assignment.room || 'TBD'}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {assignment.creditHours} credits
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {assignment.contactHours} contact hrs
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={assignment.status}
                    color={getStatusColor(assignment.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  {assignment.status === 'Proposed' && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleApprove(assignment.id)}
                    >
                      Approve
                    </Button>
                  )}
                  <IconButton
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => handleEditClick(assignment)}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Assignment Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          Create New Assignment
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stepper activeStep={activeStep} orientation="vertical">
              {/* Step 1: Select Faculty & Course */}
              <Step>
                <StepLabel>Select Faculty & Course</StepLabel>
                <StepContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Controller
                        name="facultyId"
                        control={control}
                        rules={{ required: 'Faculty is required' }}
                        render={({ field }) => (
                          <Autocomplete
                            {...field}
                            options={facultyList}
                            getOptionLabel={(option) => option.label}
                            onChange={(event, newValue) => {
                              field.onChange(newValue?.value || '');
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Faculty"
                                error={!!errors.facultyId}
                                helperText={errors.facultyId?.message}
                                fullWidth
                              />
                            )}
                            renderOption={(props, option) => (
                              <Box component="li" {...props}>
                                <Box>
                                  <Typography variant="body1">
                                    {option.firstName} {option.lastName}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {option.employeeId} • {option.type} • {option.department}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          />
                        )}
                      />
                    </Grid>
                    
                    {selectedFaculty && (
                      <Grid item xs={12}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                              Faculty Load Information
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  Current Regular Load: {selectedFaculty.currentRegularLoad} hrs
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  Current Extra Load: {selectedFaculty.currentExtraLoad} hrs
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  Max Regular: {getLoadLimitForType(selectedFaculty.type).regular} hrs
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2">
                                  Max Extra: {getLoadLimitForType(selectedFaculty.type).extra} hrs
                                </Typography>
                              </Grid>
                            </Grid>
                            {selectedFaculty.consecutiveLowRatings >= 2 && (
                              <Alert severity="warning" sx={{ mt: 1 }}>
                                This faculty member is restricted from extra load assignments due to consecutive low ITEES ratings.
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                    
                    <Grid item xs={12}>
                      <Controller
                        name="courseId"
                        control={control}
                        rules={{ required: 'Course is required' }}
                        render={({ field }) => (
                          <Autocomplete
                            {...field}
                            options={courseList}
                            getOptionLabel={(option) => option.label}
                            onChange={(event, newValue) => {
                              field.onChange(newValue?.value || '');
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Course"
                                error={!!errors.courseId}
                                helperText={errors.courseId?.message}
                                fullWidth
                              />
                            )}
                            renderOption={(props, option) => (
                              <Box component="li" {...props}>
                                <Box>
                                  <Typography variant="body1">
                                    {option.code} - {option.name}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {option.credits} credits • {option.contactHours} contact hrs • {option.department}
                                    {option.requiresNightSection && ' • Night Section Required'}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="type"
                        control={control}
                        rules={{ required: 'Load type is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            select
                            label="Load Type"
                            error={!!errors.type}
                            helperText={errors.type?.message}
                          >
                            {loadTypes.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!watchedFacultyId || !watchedCourseId || !watchedType}
                    >
                      Next
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 2: Configure Time Slot */}
              <Step>
                <StepLabel>Configure Time Slot</StepLabel>
                <StepContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name="dayOfWeek"
                        control={control}
                        rules={{ required: 'Day is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            select
                            label="Day of Week"
                            error={!!errors.dayOfWeek}
                            helperText={errors.dayOfWeek?.message}
                          >
                            {dayNames.map((day, index) => (
                              <MenuItem key={index} value={index}>
                                {day}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name="startTime"
                        control={control}
                        rules={{ required: 'Start time is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            select
                            label="Start Time"
                            error={!!errors.startTime}
                            helperText={errors.startTime?.message}
                          >
                            {timeSlots.map((slot) => (
                              <MenuItem key={slot.value} value={slot.value}>
                                {slot.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name="endTime"
                        control={control}
                        rules={{ required: 'End time is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            select
                            label="End Time"
                            error={!!errors.endTime}
                            helperText={errors.endTime?.message}
                          >
                            {timeSlots.map((slot) => (
                              <MenuItem key={slot.value} value={slot.value}>
                                {slot.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="room"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Room (Optional)"
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="section"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Section (Optional)"
                          />
                        )}
                      />
                    </Grid>
                    
                    {selectedCourse?.requiresNightSection && (
                      <Grid item xs={12}>
                        <Alert severity="info">
                          This course requires a night section (4:30 PM - 9:00 PM). Please ensure the selected time slot meets this requirement.
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                  
                  <Box sx={{ mt: 2 }}>
                    <Button onClick={handleBack} sx={{ mr: 1 }}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!watchedDayOfWeek && watchedDayOfWeek !== 0 || !watchedStartTime || !watchedEndTime}
                    >
                      Next
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 3: Validate Assignment */}
              <Step>
                <StepLabel>Validate Assignment</StepLabel>
                <StepContent>
                  {validationResult ? (
                    <Box>
                      {validationResult.valid ? (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          <Typography variant="h6">✅ Assignment is valid!</Typography>
                          <Typography variant="body2">
                            This assignment meets all constraints and can be created.
                          </Typography>
                        </Alert>
                      ) : (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          <Typography variant="h6">❌ Assignment validation failed</Typography>
                          <Typography variant="body2" component="div">
                            {validationResult.errors && validationResult.errors.length > 0 ? (
                              <>
                                The following issues were found:
                                <ul>
                                  {validationResult.errors.map((error: string, index: number) => (
                                    <li key={index}>{error}</li>
                                  ))}
                                </ul>
                              </>
                            ) : (
                              'No specific errors provided. Please check your assignment details and try again.'
                            )}
                          </Typography>
                        </Alert>
                      )}
                      
                      <Card variant="outlined" sx={{ mt: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            Assignment Summary
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="body2">
                                <strong>Faculty:</strong> {selectedFaculty?.firstName} {selectedFaculty?.lastName}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2">
                                <strong>Course:</strong> {selectedCourse?.code} - {selectedCourse?.name}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2">
                                <strong>Type:</strong> {watchedType}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2">
                                <strong>Schedule:</strong> {dayNames[watchedDayOfWeek]} {formatTime(watchedStartTime)} - {formatTime(watchedEndTime)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2">
                                <strong>Credit Hours:</strong> {selectedCourse?.credits}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2">
                                <strong>Contact Hours:</strong> {selectedCourse?.contactHours}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Box>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                      <CircularProgress />
                      <Typography variant="body2" sx={{ ml: 2 }}>
                        Validating assignment...
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    <Button onClick={handleBack} sx={{ mr: 1 }}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!validationResult?.valid}
                    >
                      Next
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 4: Review & Submit */}
              <Step>
                <StepLabel>Review & Submit</StepLabel>
                <StepContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
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
                          >
                            <MenuItem value="First">First</MenuItem>
                            <MenuItem value="Second">Second</MenuItem>
                            <MenuItem value="Summer">Summer</MenuItem>
                          </TextField>
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
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
                          >
                            <MenuItem value="2024-2025">2024-2025</MenuItem>
                            <MenuItem value="2025-2026">2025-2026</MenuItem>
                          </TextField>
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={3}
                            label="Notes (Optional)"
                            placeholder="Any additional notes or special requirements..."
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 2 }}>
                    <Button onClick={handleBack} sx={{ mr: 1 }}>
                      Back
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                      Create Assignment
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(handleEditSubmit)}>
          <DialogTitle>Edit Assignment</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="facultyId"
                  control={control}
                  defaultValue={editingAssignment?.facultyId || ''}
                  rules={{ required: 'Faculty is required' }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={facultyList}
                      getOptionLabel={(option) => option.label || ''}
                      value={facultyList.find(f => f.id === field.value) || null}
                      onChange={(_, newValue) => {
                        field.onChange(newValue?.id || '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Faculty"
                          required
                          error={!!errors.facultyId}
                          helperText={errors.facultyId?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="courseId"
                  control={control}
                  defaultValue={editingAssignment?.courseId || ''}
                  rules={{ required: 'Course is required' }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={courseList}
                      getOptionLabel={(option) => option.label || ''}
                      value={courseList.find(c => c.id === field.value) || null}
                      onChange={(_, newValue) => {
                        field.onChange(newValue?.id || '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Course"
                          required
                          error={!!errors.courseId}
                          helperText={errors.courseId?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="type"
                  control={control}
                  defaultValue={editingAssignment?.type || 'Regular'}
                  rules={{ required: 'Type is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Assignment Type"
                      error={!!errors.type}
                      helperText={errors.type?.message}
                    >
                      <MenuItem value="Regular">Regular</MenuItem>
                      <MenuItem value="Extra">Extra</MenuItem>
                      <MenuItem value="OJT">OJT</MenuItem>
                      <MenuItem value="Seminar">Seminar</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="dayOfWeek"
                  control={control}
                  defaultValue={editingAssignment?.timeSlot?.dayOfWeek || 1}
                  rules={{ required: 'Day is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Day of Week"
                      error={!!errors.dayOfWeek}
                      helperText={errors.dayOfWeek?.message}
                    >
                      <MenuItem value={1}>Monday</MenuItem>
                      <MenuItem value={2}>Tuesday</MenuItem>
                      <MenuItem value={3}>Wednesday</MenuItem>
                      <MenuItem value={4}>Thursday</MenuItem>
                      <MenuItem value={5}>Friday</MenuItem>
                      <MenuItem value={6}>Saturday</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="startTime"
                  control={control}
                  defaultValue={editingAssignment?.timeSlot?.startTime || ''}
                  rules={{ required: 'Start time is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="time"
                      label="Start Time"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.startTime}
                      helperText={errors.startTime?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="endTime"
                  control={control}
                  defaultValue={editingAssignment?.timeSlot?.endTime || ''}
                  rules={{ required: 'End time is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="time"
                      label="End Time"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.endTime}
                      helperText={errors.endTime?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="semester"
                  control={control}
                  defaultValue={editingAssignment?.semester || 'First'}
                  rules={{ required: 'Semester is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Semester"
                      error={!!errors.semester}
                      helperText={errors.semester?.message}
                    >
                      <MenuItem value="First">First</MenuItem>
                      <MenuItem value="Second">Second</MenuItem>
                      <MenuItem value="Summer">Summer</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="academicYear"
                  control={control}
                  defaultValue={editingAssignment?.academicYear || '2025-2026'}
                  rules={{ required: 'Academic year is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Academic Year"
                      error={!!errors.academicYear}
                      helperText={errors.academicYear?.message}
                    >
                      <MenuItem value="2024-2025">2024-2025</MenuItem>
                      <MenuItem value="2025-2026">2025-2026</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="lectureHours"
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Lecture Hours"
                      inputProps={{ min: 0, step: 0.5 }}
                      helperText="Hours allocated for lecture component"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="laboratoryHours"
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Laboratory Hours"
                      inputProps={{ min: 0, step: 0.5 }}
                      helperText="Hours allocated for laboratory component"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={3}
                      label="Notes (Optional)"
                      placeholder="Any additional notes or special requirements..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Update Assignment
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Assignments;