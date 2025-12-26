import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  CircularProgress,
  Autocomplete,
  Drawer,
  IconButton,
  Divider,
  Chip,
  Tooltip,
  Paper,
  InputAdornment,
  Collapse,
  Badge,
  Tabs,
  Tab,
} from '@mui/material';
import {
  MenuOpen as MenuOpenIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
import { useForm, Controller } from 'react-hook-form';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  generateSchedule, 
  validateAssignment, 
  getScheduleCalendar, 
  getFaculty, 
  getCourses, 
  createAssignment,
  checkScheduleConflicts 
} from '../services/api';
import FacultySidebar from '../components/FacultySidebar';

interface ScheduleEvent extends EventInput {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    facultyId: string;
    facultyName: string;
    courseId: string;
    courseCode: string;
    type: string;
    room?: string;
    sectionCode?: string;
    sectionId?: string;
    isNightSection?: boolean;
    enrolledStudents?: number;
    maxStudents?: number;
    classType?: string;
    hasConflict?: boolean;
    conflictType?: 'faculty' | 'room';
  };
}

interface Conflict {
  faculty: string;
  course1: string;
  course2: string;
  day: number;
  time1: string;
  time2: string;
}

const Schedule: React.FC = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [allEvents, setAllEvents] = useState<ScheduleEvent[]>([]); // Store all events for filtering
  const [faculty, setFaculty] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [conflictsLoading, setConflictsLoading] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [statsTab, setStatsTab] = useState(0);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFaculty, setFilterFaculty] = useState<string>('');
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('');
  const [filterRoom, setFilterRoom] = useState<string>('');
  const [filterLoadType, setFilterLoadType] = useState<string>('');
  const [showConflictsOnly, setShowConflictsOnly] = useState(false);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadScheduleData();
    loadFacultyAndCourses();
  }, []);

  useEffect(() => {
    if (allEvents.length > 0) {
      loadConflicts();
    }
  }, [allEvents.length]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterFaculty, filterCourse, filterSection, filterRoom, filterLoadType, showConflictsOnly, allEvents]);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      const data = await getScheduleCalendar();
      
      const formattedEvents: ScheduleEvent[] = data.map((item: any) => ({
        id: item.id,
        title: item.title || `${item.courseCode} (${item.section}) - ${item.facultyName}`,
        start: item.start,
        end: item.end,
        backgroundColor: item.backgroundColor || getEventColor(item.type),
        extendedProps: {
          facultyId: item.facultyId,
          facultyName: item.facultyName,
          courseId: item.courseId,
          courseCode: item.courseCode,
          type: item.type,
          room: item.room,
          sectionCode: item.section,
          sectionId: item.sectionId,
          isNightSection: item.extendedProps?.isNightSection,
          enrolledStudents: item.extendedProps?.enrolledStudents,
          maxStudents: item.extendedProps?.maxStudents,
          classType: item.extendedProps?.classType,
          hasConflict: false,
        },
      }));
      
      setAllEvents(formattedEvents);
      setEvents(formattedEvents);
      setError('');
    } catch (err: any) {
      console.error('Schedule load error:', err);
      setError(err.response?.data?.error || 'Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const loadConflicts = async () => {
    try {
      setConflictsLoading(true);
      const data = await checkScheduleConflicts();
      const conflictsList = data.conflicts || [];
      setConflicts(conflictsList);
      
      // Mark events with conflicts
      if (conflictsList.length > 0) {
        setAllEvents(prev => prev.map(event => {
          const props = event.extendedProps;
          if (!props) return event;
          
          // Check if this event matches any conflict
          const hasConflict = conflictsList.some((conflict: any) => {
            // Match by faculty name and course code
            const matchesCourse1 = props.facultyName === conflict.faculty && props.courseCode === conflict.course1;
            const matchesCourse2 = props.facultyName === conflict.faculty && props.courseCode === conflict.course2;
            // Also match by section code if available
            const matchesSection1 = conflict.section1 && props.sectionCode === conflict.section1;
            const matchesSection2 = conflict.section2 && props.sectionCode === conflict.section2;
            
            return (matchesCourse1 || matchesCourse2) || (matchesSection1 || matchesSection2);
          });
          
          return {
            ...event,
            borderColor: hasConflict ? '#d32f2f' : undefined,
            extendedProps: {
              ...props,
              hasConflict,
              conflictType: hasConflict ? 'faculty' : undefined,
            },
          };
        }));
      }
    } catch (err: any) {
      console.error('Failed to load conflicts:', err);
      // Don't fail the whole page if conflicts can't be loaded
    } finally {
      setConflictsLoading(false);
    }
  };

  const loadFacultyAndCourses = async () => {
    try {
      const [facultyData, coursesData] = await Promise.all([
        getFaculty(),
        getCourses(),
      ]);
      setFaculty(facultyData);
      setCourses(coursesData);
    } catch (err: any) {
      console.error('Failed to load faculty and courses:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...allEvents];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => {
        const props = event.extendedProps;
        return (
          props?.courseCode?.toLowerCase().includes(query) ||
          props?.facultyName?.toLowerCase().includes(query) ||
          props?.sectionCode?.toLowerCase().includes(query) ||
          props?.room?.toLowerCase().includes(query)
        );
      });
    }

    // Faculty filter
    if (filterFaculty) {
      filtered = filtered.filter(event => event.extendedProps?.facultyId === filterFaculty);
    }

    // Course filter
    if (filterCourse) {
      filtered = filtered.filter(event => event.extendedProps?.courseId === filterCourse);
    }

    // Section filter
    if (filterSection) {
      filtered = filtered.filter(event => event.extendedProps?.sectionCode === filterSection);
    }

    // Room filter
    if (filterRoom) {
      filtered = filtered.filter(event => event.extendedProps?.room === filterRoom);
    }

    // Load type filter
    if (filterLoadType) {
      filtered = filtered.filter(event => event.extendedProps?.type === filterLoadType);
    }

    // Conflicts only filter
    if (showConflictsOnly) {
      filtered = filtered.filter(event => event.extendedProps?.hasConflict === true);
    }

    setEvents(filtered);
  };

  const getEventColor = (type: string): string => {
    switch (type) {
      case 'Regular':
        return '#1976d2';
      case 'Extra':
        return '#ff9800';
      case 'OJT':
        return '#4caf50';
      case 'Seminar':
        return '#9c27b0';
      default:
        return '#757575';
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo);
    setOpenDialog(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo);
    const props = clickInfo.event.extendedProps;
    const start = clickInfo.event.start;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = start ? dayNames[start.getDay()] : 'Unknown';
    
    const details = `
      Course: ${props?.courseCode}
      Section: ${props?.sectionCode || 'N/A'}
      Faculty: ${props?.facultyName}
      Type: ${props?.type}
      Room: ${props?.room || 'TBA'}
      Day: ${dayName} (Weekly Recurring)
      Time: ${clickInfo.event.start?.toLocaleTimeString()} - ${clickInfo.event.end?.toLocaleTimeString()}
      Students: ${props?.enrolledStudents || 0}/${props?.maxStudents || 0}
      ${props?.isNightSection ? 'Night Section: Yes' : ''}
      ${props?.hasConflict ? '⚠️ CONFLICT DETECTED' : ''}
      
      Note: This schedule repeats every week. The date shown is for display purposes only.
    `;
    
    alert(details);
  };

  const handleGenerateSchedule = async () => {
    try {
      const result = await generateSchedule({
        semester: 'First',
        academicYear: '2024-2025',
      });
      
      if (result.success) {
        setError('');
        loadScheduleData();
        loadConflicts();
      } else {
        setError(`Failed to assign ${result.unassignedCourses?.length || 0} courses`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate schedule');
    }
  };

  const onSubmitAssignment = async (data: any) => {
    try {
      const timeSlotData = {
        ...data,
        dayOfWeek: selectedDate?.start.getDay() || 1,
        startTime: selectedDate?.start.toTimeString().slice(0, 5) || '09:00',
        endTime: selectedDate?.end?.toTimeString().slice(0, 5) || '12:00',
        semester: 'First',
        academicYear: '2024-2025',
      };

      await createAssignment(timeSlotData);
      
      setOpenDialog(false);
      reset();
      loadScheduleData();
      loadConflicts();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create assignment');
    }
  };

  // Export functions
  const exportToCSV = () => {
    const headers = ['Course', 'Section', 'Faculty', 'Type', 'Room', 'Day', 'Start Time', 'End Time', 'Students'];
    const rows = events.map(event => {
      const props = event.extendedProps;
      const start = new Date(event.start);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return [
        props?.courseCode || '',
        props?.sectionCode || '',
        props?.facultyName || '',
        props?.type || '',
        props?.room || 'TBA',
        dayNames[start.getDay()],
        start.toLocaleTimeString(),
        new Date(event.end).toLocaleTimeString(),
        `${props?.enrolledStudents || 0}/${props?.maxStudents || 0}`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    // For Excel export, we'll use CSV format which Excel can open
    exportToCSV();
  };

  const exportToPDF = () => {
    // Simple PDF export using window.print
    window.print();
  };

  // Statistics calculations
  const stats = useMemo(() => {
    const totalEvents = allEvents.length;
    const totalConflicts = conflicts.length;
    const uniqueFaculty = new Set(allEvents.map(e => e.extendedProps?.facultyId)).size;
    const uniqueCourses = new Set(allEvents.map(e => e.extendedProps?.courseId)).size;
    const uniqueRooms = new Set(allEvents.map(e => e.extendedProps?.room).filter(Boolean)).size;
    const unassignedCount = 0; // Would need to fetch from sections API
    
    const loadTypeCounts = allEvents.reduce((acc, event) => {
      const type = event.extendedProps?.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents,
      totalConflicts,
      uniqueFaculty,
      uniqueCourses,
      uniqueRooms,
      unassignedCount,
      loadTypeCounts,
    };
  }, [allEvents, conflicts]);

  // Get unique values for filters
  const uniqueSections = useMemo(() => {
    return Array.from(new Set(allEvents.map(e => e.extendedProps?.sectionCode).filter(Boolean))).sort();
  }, [allEvents]);

  const uniqueRooms = useMemo(() => {
    return Array.from(new Set(allEvents.map(e => e.extendedProps?.room).filter(Boolean))).sort();
  }, [allEvents]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const drawerWidth = 350;

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Faculty Sidebar Drawer */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              position: 'relative',
            },
          }}
        >
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Faculty Panel
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          
          {selectedFaculty && (
            <Box sx={{ p: 2, backgroundColor: 'primary.light' }}>
              <Typography variant="subtitle2">Selected Faculty</Typography>
              <Chip 
                label={selectedFaculty.fullName} 
                onDelete={() => setSelectedFaculty(null)}
                sx={{ mt: 1 }}
              />
            </Box>
          )}
          
          <FacultySidebar 
            onFacultySelect={setSelectedFaculty}
            selectedFacultyId={selectedFaculty?.id}
          />
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            transition: (theme) => theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: drawerOpen ? 0 : `-${drawerWidth}px`,
            p: 3,
            overflow: 'auto'
          }}
        >
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              {!drawerOpen && (
                <IconButton onClick={() => setDrawerOpen(true)}>
                  <MenuOpenIcon />
                </IconButton>
              )}
              <Typography variant="h4">Schedule Management</Typography>
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  // Simple menu for export options
                  const menu = document.createElement('div');
                  menu.style.position = 'absolute';
                  menu.style.zIndex = '1000';
                  // For now, just trigger CSV export
                  exportToCSV();
                }}
              >
                Export
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateSchedule}
              >
                Generate Optimal Schedule
              </Button>
            </Box>
          </Box>

          {/* Statistics Dashboard */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Assignments
                  </Typography>
                  <Typography variant="h5">{stats.totalEvents}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Conflicts
                  </Typography>
                  <Typography variant="h5" color={stats.totalConflicts > 0 ? 'error' : 'success'}>
                    {stats.totalConflicts}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Faculty
                  </Typography>
                  <Typography variant="h5">{stats.uniqueFaculty}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Courses
                  </Typography>
                  <Typography variant="h5">{stats.uniqueCourses}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Rooms Used
                  </Typography>
                  <Typography variant="h5">{stats.uniqueRooms}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Showing
                  </Typography>
                  <Typography variant="h5">{events.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <FilterListIcon />
                  <Typography variant="h6">Filters</Typography>
                  {conflicts.length > 0 && (
                    <Badge badgeContent={conflicts.length} color="error">
                      <WarningIcon color="error" />
                    </Badge>
                  )}
                </Box>
                <IconButton onClick={() => setFilterExpanded(!filterExpanded)}>
                  {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              {/* Quick Search */}
              <TextField
                fullWidth
                placeholder="Search by course, faculty, section, or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <Collapse in={filterExpanded}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Faculty</InputLabel>
                      <Select
                        value={filterFaculty}
                        label="Faculty"
                        onChange={(e) => setFilterFaculty(e.target.value)}
                      >
                        <MenuItem value="">All Faculty</MenuItem>
                        {faculty.map((f) => (
                          <MenuItem key={f.id} value={f.id}>
                            {f.fullName || `${f.firstName} ${f.lastName}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Course</InputLabel>
                      <Select
                        value={filterCourse}
                        label="Course"
                        onChange={(e) => setFilterCourse(e.target.value)}
                      >
                        <MenuItem value="">All Courses</MenuItem>
                        {courses.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.code} - {c.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Section</InputLabel>
                      <Select
                        value={filterSection}
                        label="Section"
                        onChange={(e) => setFilterSection(e.target.value)}
                      >
                        <MenuItem value="">All Sections</MenuItem>
                        {uniqueSections.map((section) => (
                          <MenuItem key={section} value={section}>
                            {section}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Room</InputLabel>
                      <Select
                        value={filterRoom}
                        label="Room"
                        onChange={(e) => setFilterRoom(e.target.value)}
                      >
                        <MenuItem value="">All Rooms</MenuItem>
                        {uniqueRooms.map((room) => (
                          <MenuItem key={room} value={room}>
                            {room}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Load Type</InputLabel>
                      <Select
                        value={filterLoadType}
                        label="Load Type"
                        onChange={(e) => setFilterLoadType(e.target.value)}
                      >
                        <MenuItem value="">All Types</MenuItem>
                        <MenuItem value="Regular">Regular</MenuItem>
                        <MenuItem value="Extra">Extra</MenuItem>
                        <MenuItem value="OJT">OJT</MenuItem>
                        <MenuItem value="Seminar">Seminar</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant={showConflictsOnly ? 'contained' : 'outlined'}
                      color={showConflictsOnly ? 'error' : 'primary'}
                      startIcon={<WarningIcon />}
                      onClick={() => setShowConflictsOnly(!showConflictsOnly)}
                    >
                      {showConflictsOnly ? 'Showing Conflicts Only' : 'Show Conflicts Only'}
                    </Button>
                    {(filterFaculty || filterCourse || filterSection || filterRoom || filterLoadType) && (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setFilterFaculty('');
                          setFilterCourse('');
                          setFilterSection('');
                          setFilterRoom('');
                          setFilterLoadType('');
                          setSearchQuery('');
                        }}
                        sx={{ ml: 2 }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Collapse>
            </CardContent>
          </Card>

          {/* Conflicts Alert */}
          {conflicts.length > 0 && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => setShowConflictsOnly(true)}>
                  View Conflicts
                </Button>
              }
            >
              <Typography variant="body2">
                <strong>{conflicts.length} scheduling conflict(s) detected!</strong> Click "View Conflicts" to see details.
              </Typography>
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Schedule Calendar */}
          <Card>
            <CardContent>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  Drag faculty from the left panel onto calendar time slots to assign them to courses.
                  {conflicts.length > 0 && ' Conflicts are highlighted in red.'}
                </Typography>
                <Chip 
                  label="📅 Weekly Recurring Schedule" 
                  color="info" 
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Note: Dates shown are for display only. Schedules repeat weekly.
                </Typography>
              </Box>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                initialView="timeGridWeek"
                editable={true}
                selectable={true}
                selectMirror={true}
                events={events.map(event => ({
                  ...event,
                  borderColor: event.extendedProps?.hasConflict ? '#d32f2f' : undefined,
                  borderWidth: event.extendedProps?.hasConflict ? 3 : 1,
                  // Add recurring indicator to title
                  title: event.title ? `${event.title} (Weekly)` : event.title,
                }))}
                select={handleDateSelect}
                eventClick={handleEventClick}
                slotMinTime="07:30:00"
                slotMaxTime="21:00:00"
                weekends={true}
                height="auto"
                // Customize date display to emphasize day names
                dayHeaderFormat={{ weekday: 'long' }}
                slotLabelFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                }}
                eventContent={(eventInfo) => {
                  const props = eventInfo.event.extendedProps;
                  return (
                    <Tooltip
                      title={
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {props?.courseCode} - {props?.sectionCode}
                          </Typography>
                          <Typography variant="body2">Faculty: {props?.facultyName}</Typography>
                          <Typography variant="body2">Room: {props?.room || 'TBA'}</Typography>
                          <Typography variant="body2">
                            Students: {props?.enrolledStudents || 0}/{props?.maxStudents || 0}
                          </Typography>
                          <Typography variant="body2">Type: {props?.type}</Typography>
                          {props?.hasConflict && (
                            <Typography variant="body2" color="error" fontWeight="bold">
                              ⚠️ CONFLICT DETECTED
                            </Typography>
                          )}
                        </Box>
                      }
                      arrow
                    >
                      <Box sx={{ p: 0.5, fontSize: '0.75rem' }}>
                        <Typography variant="caption" fontWeight="bold" noWrap>
                          {props?.courseCode}
                        </Typography>
                        <Typography variant="caption" display="block" noWrap>
                          {props?.sectionCode}
                        </Typography>
                        <Typography variant="caption" display="block" noWrap>
                          {props?.facultyName?.split(' ').pop()}
                        </Typography>
                        {props?.hasConflict && (
                          <WarningIcon sx={{ fontSize: 12, color: 'error.main', mt: 0.5 }} />
                        )}
                      </Box>
                    </Tooltip>
                  );
                }}
              />
            </CardContent>
          </Card>

          {/* Legend */}
          <Box mt={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                  Legend:
                </Typography>
              </Grid>
              <Grid item>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: '#1976d2',
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2">Regular Load</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: '#ff9800',
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2">Extra Load</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: '#4caf50',
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2">OJT/Practicum</Typography>
                </Box>
              </Grid>
              <Grid item>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: '#9c27b0',
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2">Seminar</Typography>
                </Box>
              </Grid>
              {conflicts.length > 0 && (
                <Grid item>
                  <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        border: '3px solid #d32f2f',
                        backgroundColor: 'transparent',
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2" color="error">Conflict</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Dialog outside the main layout */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmitAssignment)}>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="facultyId"
                  control={control}
                  rules={{ required: 'Faculty is required' }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={faculty}
                      getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.employeeId})`}
                      onChange={(event, newValue) => {
                        field.onChange(newValue?.id || '');
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
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="courseId"
                  control={control}
                  rules={{ required: 'Course is required' }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={courses}
                      getOptionLabel={(option) => `${option.code} - ${option.name}`}
                      onChange={(event, newValue) => {
                        field.onChange(newValue?.id || '');
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
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: 'Load type is required' }}
                  defaultValue="Regular"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Load Type"
                      error={!!errors.type}
                      helperText={errors.type?.message}
                    >
                      <MenuItem value="Regular">Regular</MenuItem>
                      <MenuItem value="Extra">Extra</MenuItem>
                      <MenuItem value="OJT">OJT/Practicum</MenuItem>
                      <MenuItem value="Seminar">Seminar</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Create Assignment
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </DndProvider>
  );
};

export default Schedule;
