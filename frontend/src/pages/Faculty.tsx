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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  List as ListIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { getFaculty, createFaculty, updateFaculty, deleteFaculty, forceDeleteFaculty } from '../services/api';
import { sectionService } from '../services/sectionService';

interface Faculty {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  type: 'Regular' | 'PartTime' | 'Temporary' | 'Designee';
  department: string;
  college: string;
  isActive: boolean;
  currentRegularLoad: number;
  currentExtraLoad: number;
  consecutiveLowRatings: number;
  latestITEESRating?: string;
}

interface FacultyFormData {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  type: 'Regular' | 'PartTime' | 'Temporary' | 'Designee';
  department: string;
  college: string;
}

interface FacultyScheduleTabProps {
  faculty: Faculty[];
  selectedFacultyId: string;
  setSelectedFacultyId: (id: string) => void;
  facultySections: any[];
}

const FacultyScheduleTab: React.FC<FacultyScheduleTabProps> = ({
  faculty,
  selectedFacultyId,
  setSelectedFacultyId,
  facultySections
}) => {
  // Time slots from 7:00 AM to 9:00 PM
  const timeSlots = React.useMemo(() => {
    const slots = [];
    for (let hour = 7; hour <= 21; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        displayTime: hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`,
        hour
      });
    }
    return slots;
  }, []);

  // Days of the week (Monday to Saturday)
  const weekDays = [
    { day: 1, name: 'Monday', short: 'MON' },
    { day: 2, name: 'Tuesday', short: 'TUE' },
    { day: 3, name: 'Wednesday', short: 'WED' },
    { day: 4, name: 'Thursday', short: 'THU' },
    { day: 5, name: 'Friday', short: 'FRI' },
    { day: 6, name: 'Saturday', short: 'SAT' }
  ];

  // Convert time string to minutes from midnight
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Get sections for a specific day
  const getSectionsForDay = (dayOfWeek: number) => {
    return facultySections.filter(section => {
      if (!section.timeSlots) return false;
      return section.timeSlots.some((timeSlot: any) => timeSlot.dayOfWeek === dayOfWeek);
    });
  };

  // Get the starting hour index for a section
  const getSectionStartHour = (section: any, dayOfWeek: number): number => {
    if (!section.timeSlots) return -1;
    
    const timeSlot = section.timeSlots.find((slot: any) => slot.dayOfWeek === dayOfWeek);
    if (!timeSlot) return -1;
    
    const startMinutes = timeToMinutes(timeSlot.startTime);
    return Math.floor(startMinutes / 60);
  };

  // Calculate section width based on duration
  const getSectionWidth = (section: any, dayOfWeek: number): number => {
    if (!section.timeSlots) return 80;
    
    const timeSlot = section.timeSlots.find((slot: any) => slot.dayOfWeek === dayOfWeek);
    if (!timeSlot) return 80;
    
    const duration = timeToMinutes(timeSlot.endTime) - timeToMinutes(timeSlot.startTime);
    const hours = Math.ceil(duration / 60);
    return hours * 80; // 80px per hour column
  };

  // Get section position offset
  const getSectionLeft = (section: any, dayOfWeek: number): number => {
    const startHour = getSectionStartHour(section, dayOfWeek);
    if (startHour === -1) return 0;
    
    const hourIndex = timeSlots.findIndex(slot => slot.hour === startHour);
    return hourIndex * 80;
  };

  // Convert time string to decimal hours (e.g., "07:30" -> 7.5)
  const timeToDecimalHours = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
  };

  // Determine load type for designee faculty based on time slot
  const determineDesigneeLoadType = (timeSlot: any, facultyType: string): 'Regular' | 'Extra' | 'Temporary' => {
    // Only apply special logic for designees
    if (facultyType !== 'Designee') {
      return 'Regular'; // Default for non-designees
    }

    const startHour = timeToDecimalHours(timeSlot.startTime);
    const endHour = timeToDecimalHours(timeSlot.endTime);
    const dayOfWeek = timeSlot.dayOfWeek;

    // Saturday/Sunday classes = temporary substitution
    if (dayOfWeek === 6 || dayOfWeek === 0) {
      return 'Temporary';
    }

    // Check if time falls within regular hours (9am-6pm)
    const isWithinRegularHours = startHour >= 9.0 && endHour <= 18.0;
    
    if (isWithinRegularHours) {
      return 'Regular';
    }

    // Check if time falls within part-time hours (7:30am-9am or 6pm-9pm)
    const isEarlyPartTime = startHour >= 7.5 && endHour <= 9.0;
    const isEveningPartTime = startHour >= 18.0 && endHour <= 21.0;
    
    if (isEarlyPartTime || isEveningPartTime) {
      return 'Extra'; // Part-time hours counted as extra load
    }

    // Default to regular if doesn't fit other categories
    return 'Regular';
  };

  // Get color for load type
  const getLoadTypeColor = (loadType: 'Regular' | 'Extra' | 'Temporary') => {
    switch (loadType) {
      case 'Regular':
        return {
          backgroundColor: 'primary.light',
          color: 'primary.contrastText',
          borderColor: 'primary.main'
        };
      case 'Extra':
        return {
          backgroundColor: 'warning.light',
          color: 'warning.contrastText',
          borderColor: 'warning.main'
        };
      case 'Temporary':
        return {
          backgroundColor: 'secondary.light',
          color: 'secondary.contrastText',
          borderColor: 'secondary.main'
        };
      default:
        return {
          backgroundColor: 'grey.light',
          color: 'text.primary',
          borderColor: 'grey.main'
        };
    }
  };

  // Get faculty load summary for selected faculty
  const getSelectedFacultyLoad = () => {
    if (selectedFacultyId === 'all') return null;
    const selectedFaculty = faculty.find(f => f.id === selectedFacultyId);
    if (!selectedFaculty) return null;

    const getLoadLimitForType = (type: string) => {
      const limits = {
        Regular: { regular: 21, extra: 9 },
        PartTime: { regular: 12, extra: 0 },
        Temporary: { regular: 21, extra: 9 },
        Designee: { regular: 9, extra: 6 },
      };
      return limits[type as keyof typeof limits] || { regular: 0, extra: 0 };
    };

    const limit = getLoadLimitForType(selectedFaculty.type);
    const totalLoad = selectedFaculty.currentRegularLoad + selectedFaculty.currentExtraLoad;
    const maxLoad = limit.regular + limit.extra;

    return {
      faculty: selectedFaculty,
      totalLoad,
      maxLoad,
      regularLoad: selectedFaculty.currentRegularLoad,
      extraLoad: selectedFaculty.currentExtraLoad,
      limit
    };
  };

  const facultyLoad = getSelectedFacultyLoad();

  return (
    <Box>
      {/* Faculty Filter and Load Summary */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Select Faculty</InputLabel>
              <Select
                value={selectedFacultyId}
                label="Select Faculty"
                onChange={(e) => setSelectedFacultyId(e.target.value)}
              >
                <MenuItem value="all">All Faculty</MenuItem>
                {faculty.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.firstName} {f.lastName} ({f.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {facultyLoad && (
            <Grid item xs={12} md={8}>
              <Card variant="outlined">
                <CardContent sx={{ py: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">
                        {facultyLoad.faculty.firstName} {facultyLoad.faculty.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {facultyLoad.faculty.type} • {facultyLoad.faculty.department}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            Load: {facultyLoad.totalLoad}/{facultyLoad.maxLoad} hrs
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Regular: {facultyLoad.regularLoad}/{facultyLoad.limit.regular} | 
                            Extra: {facultyLoad.extraLoad}/{facultyLoad.limit.extra}
                          </Typography>
                        </Box>
                        <Chip
                          label={facultyLoad.totalLoad >= facultyLoad.maxLoad ? 'Full Load' : 'Available'}
                          color={facultyLoad.totalLoad >= facultyLoad.maxLoad ? 'error' : 'success'}
                          size="small"
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Schedule Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {facultySections.length}
              </Typography>
              <Typography variant="body2">
                {selectedFacultyId === 'all' ? 'Total Sections' : 'Assigned Sections'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">
                {facultySections.filter(s => s.isNightSection).length}
              </Typography>
              <Typography variant="body2">Night Sections</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="info.main">
                {new Set(facultySections.map(s => s.course.code)).size}
              </Typography>
              <Typography variant="body2">Unique Courses</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">
                {facultySections.reduce((sum, s) => sum + s.enrolledStudents, 0)}
              </Typography>
              <Typography variant="body2">Total Students</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Weekly Calendar */}
      {facultySections.length > 0 ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            Weekly Schedule View
          </Typography>

          {/* Load Type Legend */}
          <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Load Type Legend (For Designees):
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  backgroundColor: 'primary.light',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 1 
                }} />
                <Typography variant="body2">
                  <strong>Regular Load</strong> - 9:00am to 6:00pm (Weekdays only)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  backgroundColor: 'warning.light',
                  border: '2px solid',
                  borderColor: 'warning.main',
                  borderRadius: 1 
                }} />
                <Typography variant="body2">
                  <strong>Extra Load</strong> - 7:30am-9:00am & 6:00pm-9:00pm (Part-time hours)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  backgroundColor: 'secondary.light',
                  border: '2px solid',
                  borderColor: 'secondary.main',
                  borderRadius: 1 
                }} />
                <Typography variant="body2">
                  <strong>Temporary Substitution</strong> - Weekends (Saturday/Sunday)
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              * Color coding applies to Designee faculty. Other faculty types use regular load classification.
            </Typography>
            <Typography variant="caption" color="primary.main" sx={{ mt: 0.5, display: 'block', fontWeight: 'bold' }}>
              ⚠️ Note: 7:30am-9:00am time slots are classified as Extra Load (Part-time hours) for designees.
            </Typography>
          </Box>
          
          {/* Calendar Header */}
          <Box sx={{ display: 'flex', mb: 2 }}>
            <Box sx={{ width: 100, flexShrink: 0 }} /> {/* Day column spacer */}
            {timeSlots.map(timeSlot => (
              <Box
                key={timeSlot.hour}
                sx={{
                  width: 80,
                  textAlign: 'center',
                  py: 1,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 'bold',
                  borderRight: `1px solid #e0e0e0`,
                  '&:last-child': { borderRight: 'none' }
                }}
              >
                <Typography variant="caption">{timeSlot.displayTime}</Typography>
              </Box>
            ))}
          </Box>

          {/* Calendar Grid */}
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
            {weekDays.map(day => (
              <Box
                key={day.day}
                sx={{
                  display: 'flex',
                  minHeight: 80,
                  borderBottom: '1px solid #e0e0e0',
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                {/* Day Column */}
                <Box
                  sx={{
                    width: 100,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRight: '1px solid #e0e0e0',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    flexDirection: 'column',
                    gap: 0.5
                  }}
                >
                  <Typography variant="subtitle2">{day.short}</Typography>
                  <Typography variant="caption">{day.name}</Typography>
                </Box>

                {/* Time Columns Container */}
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  position: 'relative',
                  minHeight: 80 
                }}>
                  {/* Time slot cells as background */}
                  {timeSlots.map(timeSlot => (
                    <Box
                      key={`${day.day}-${timeSlot.hour}`}
                      sx={{
                        width: 80,
                        minHeight: 80,
                        borderRight: '1px solid #e0e0e0',
                        '&:last-child': { borderRight: 'none' },
                        '&:hover': {
                          backgroundColor: '#f0f0f0'
                        }
                      }}
                    />
                  ))}
                  
                  {/* Sections positioned absolutely - show all time slots for each section */}
                  {getSectionsForDay(day.day).flatMap((section) => {
                    // Get all time slots for this section on this day
                    const sectionTimeSlots = section.timeSlots?.filter((slot: any) => slot.dayOfWeek === day.day) || [];
                    
                    // Create a visual block for each time slot
                    return sectionTimeSlots.map((timeSlot: any, slotIndex: number) => {
                      const startMinutes = timeToMinutes(timeSlot.startTime);
                      const endMinutes = timeToMinutes(timeSlot.endTime);
                      const startHour = Math.floor(startMinutes / 60);
                      const duration = endMinutes - startMinutes;
                      const hours = Math.ceil(duration / 60);
                      
                      const hourIndex = timeSlots.findIndex(slot => slot.hour === startHour);
                      const left = hourIndex * 80;
                      const width = hours * 80;

                      // Determine load type for this time slot
                      const loadType = determineDesigneeLoadType(timeSlot, section.faculty?.type || 'Regular');
                      const colorConfig = getLoadTypeColor(loadType);

                      return (
                        <Tooltip
                          key={`${section.id}-${slotIndex}`}
                          title={
                            <Box>
                              <Typography variant="subtitle2">{section.course.code}</Typography>
                              <Typography variant="body2">{section.course.name}</Typography>
                              <Typography variant="body2">Section: {section.sectionCode}</Typography>
                              <Typography variant="body2">
                                Faculty: {section.faculty?.firstName} {section.faculty?.lastName} ({section.faculty?.type})
                              </Typography>
                              <Typography variant="body2">Room: {section.room || 'TBA'}</Typography>
                              <Typography variant="body2">Time: {timeSlot.startTime} - {timeSlot.endTime}</Typography>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 'bold',
                                color: loadType === 'Regular' ? 'primary.main' : 
                                       loadType === 'Extra' ? 'warning.main' : 'secondary.main' 
                              }}>
                                Load Type: {loadType} {loadType === 'Extra' ? '(Part-time hours)' : loadType === 'Temporary' ? '(Weekend substitution)' : '(Regular hours)'}
                              </Typography>
                              <Typography variant="body2">
                                Students: {section.enrolledStudents}/{section.maxStudents}
                              </Typography>
                            </Box>
                          }
                        >
                          <Card
                            sx={{
                              position: 'absolute',
                              top: 4,
                              left: left + 4,
                              width: width - 8,
                              height: 'calc(100% - 8px)',
                              backgroundColor: colorConfig.backgroundColor,
                              color: colorConfig.color,
                              border: `2px solid`,
                              borderColor: colorConfig.borderColor,
                              cursor: 'pointer',
                              zIndex: 1,
                              '&:hover': {
                                transform: 'scale(1.02)',
                                zIndex: 2
                              },
                              transition: 'all 0.2s ease-in-out',
                              overflow: 'hidden'
                            }}
                          >
                            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                                {section.course.code}
                              </Typography>
                              
                              <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1.1, mt: 0.5 }}>
                                {section.sectionCode}
                              </Typography>
                              
                              <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1, mt: 0.25, color: 'text.secondary' }}>
                                {timeSlot.startTime} - {timeSlot.endTime}
                              </Typography>
                              
                              <Typography variant="caption" sx={{ fontSize: '0.6rem', mt: 0.25 }}>
                                {section.room || 'TBA'}
                              </Typography>
                              
                              <Typography variant="caption" sx={{ fontSize: '0.6rem', mt: 0.25 }}>
                                {section.enrolledStudents}/{section.maxStudents} students
                              </Typography>
                            </CardContent>
                          </Card>
                        </Tooltip>
                      );
                    });
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Schedule Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedFacultyId === 'all' 
              ? 'No faculty have been assigned to sections yet.'
              : 'Selected faculty has no assigned sections.'
            }
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const Faculty: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('all');
  const [facultySections, setFacultySections] = useState<any[]>([]);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FacultyFormData>();

  const facultyTypes = [
    { value: 'Regular', label: 'Regular Faculty' },
    { value: 'PartTime', label: 'Part-Time Faculty' },
    { value: 'Temporary', label: 'Temporary Faculty' },
    { value: 'Designee', label: 'Designee' },
  ];

  const departments = [
    'Computer Engineering',
    'Electronics Communication Engineer',
  ];

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    if (activeTab === 1) {
      loadFacultySections();
    }
  }, [activeTab, selectedFacultyId]);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const data = await getFaculty();
      setFaculty(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch faculty');
    } finally {
      setLoading(false);
    }
  };

  const loadFacultySections = async () => {
    try {
      const filters: any = {
        semester: 'First',
        academicYear: '2025-2026'
      };
      
      if (selectedFacultyId !== 'all') {
        filters.facultyId = selectedFacultyId;
      }

      const sections = await sectionService.getAllSections(filters);
      setFacultySections(sections.filter(section => section.faculty)); // Only assigned sections
    } catch (error) {
      console.error('Error loading faculty sections:', error);
      setFacultySections([]);
    }
  };

  const handleOpenDialog = (faculty?: Faculty) => {
    if (faculty) {
      setEditingFaculty(faculty);
      reset({
        employeeId: faculty.employeeId,
        firstName: faculty.firstName,
        lastName: faculty.lastName,
        email: faculty.email,
        type: faculty.type,
        department: faculty.department,
        college: faculty.college,
      });
    } else {
      setEditingFaculty(null);
      reset({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        type: 'Regular',
        department: 'Computer Engineering',
        college: 'College of Computer and Information Sciences',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFaculty(null);
    reset();
  };

  const onSubmit = async (data: FacultyFormData) => {
    try {
      if (editingFaculty) {
        await updateFaculty(editingFaculty.id, data);
      } else {
        await createFaculty(data);
      }
      await fetchFaculty();
      handleCloseDialog();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save faculty');
    }
  };

  const handleDeleteFaculty = async (facultyId: string) => {
    const facultyMember = faculty.find(f => f.id === facultyId);
    const confirmMessage = `Are you sure you want to delete ${facultyMember?.firstName} ${facultyMember?.lastName}? This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteFaculty(facultyId);
        await fetchFaculty();
        setError('');
      } catch (err: any) {
        if (err.response?.status === 409) {
          // Faculty has dependencies
          const errorData = err.response.data;
          const dependencyMessage = errorData.message || 'This faculty member has existing assignments.';
          const deps = errorData.dependencies;
          
          let detailMessage = `${dependencyMessage}\n\nDetails:\n`;
          if (deps?.assignments > 0) detailMessage += `• ${deps.assignments} assignment(s)\n`;
          if (deps?.sections > 0) detailMessage += `• ${deps.sections} section(s)\n`;
          if (deps?.iteesRecords > 0) detailMessage += `• ${deps.iteesRecords} ITEES record(s)\n`;
          
          detailMessage += '\nWhat would you like to do?\n';
          detailMessage += '• Click OK to force delete (removes all related data)\n';
          detailMessage += '• Click Cancel to keep the faculty member';
          
          if (window.confirm(detailMessage)) {
            try {
              await forceDeleteFaculty(facultyId);
              await fetchFaculty();
              setError('');
              alert('Faculty member and all related records have been deleted successfully.');
            } catch (forceErr: any) {
              setError(forceErr.response?.data?.error || 'Failed to force delete faculty');
            }
          }
        } else {
          setError(err.response?.data?.error || 'Failed to delete faculty');
        }
      }
    }
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

  const getTypeColor = (type: string) => {
    const colors = {
      Regular: 'primary',
      PartTime: 'secondary',
      Temporary: 'warning',
      Designee: 'info',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getRatingColor = (rating?: string) => {
    if (!rating) return 'default';
    const colors = {
      Outstanding: 'success',
      'Very Satisfactory': 'info',
      Satisfactory: 'warning',
      Fair: 'warning',
      Poor: 'error',
    };
    return colors[rating as keyof typeof colors] || 'default';
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
          Faculty Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Faculty
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Faculty List" icon={<ListIcon />} />
        <Tab label="Faculty Schedule" icon={<ScheduleIcon />} />
      </Tabs>

      {activeTab === 0 && (
        <>
          {/* Faculty Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PersonIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{faculty.length}</Typography>
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
                <SchoolIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {faculty.filter(f => f.type === 'Regular').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Regular Faculty
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
                <AssessmentIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {faculty.filter(f => f.consecutiveLowRatings >= 2).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Load Restricted
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
                <PersonIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {faculty.filter(f => f.isActive).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Faculty
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Faculty Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Current Load</TableCell>
              <TableCell>ITEES Rating</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faculty.map((member) => {
              const loadLimit = getLoadLimitForType(member.type);
              const totalLoad = member.currentRegularLoad + member.currentExtraLoad;
              const maxLoad = loadLimit.regular + loadLimit.extra;
              
              return (
                <TableRow key={member.id}>
                  <TableCell>{member.employeeId}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {member.firstName} {member.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={member.type}
                      color={getTypeColor(member.type) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{member.department}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {totalLoad}/{maxLoad} hrs
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      R: {member.currentRegularLoad} | E: {member.currentExtraLoad}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {member.latestITEESRating ? (
                      <Chip
                        label={member.latestITEESRating}
                        color={getRatingColor(member.latestITEESRating) as any}
                        size="small"
                      />
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        No rating
                      </Typography>
                    )}
                    {member.consecutiveLowRatings >= 2 && (
                      <Chip
                        label="Restricted"
                        color="error"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.isActive ? 'Active' : 'Inactive'}
                      color={member.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(member)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteFaculty(member.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
        </>
      )}

      {activeTab === 1 && (
        <FacultyScheduleTab
          faculty={faculty}
          selectedFacultyId={selectedFacultyId}
          setSelectedFacultyId={setSelectedFacultyId}
          facultySections={facultySections}
        />
      )}

      {/* Add/Edit Faculty Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="employeeId"
                  control={control}
                  rules={{ required: 'Employee ID is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Employee ID"
                      error={!!errors.employeeId}
                      helperText={errors.employeeId?.message}
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: 'Faculty type is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Faculty Type"
                      error={!!errors.type}
                      helperText={errors.type?.message}
                      margin="normal"
                    >
                      {facultyTypes.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: 'First name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="First Name"
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: 'Last name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Last Name"
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      margin="normal"
                    />
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
                      {departments.map((dept) => (
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
                  name="college"
                  control={control}
                  rules={{ required: 'College is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="College"
                      error={!!errors.college}
                      helperText={errors.college?.message}
                      margin="normal"
                      disabled
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingFaculty ? 'Update' : 'Add'} Faculty
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Faculty;