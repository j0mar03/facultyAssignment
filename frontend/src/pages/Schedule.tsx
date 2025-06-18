import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
import { useForm, Controller } from 'react-hook-form';
import { generateSchedule, validateAssignment, getScheduleCalendar, getFaculty, getCourses, createAssignment } from '../services/api';

interface ScheduleEvent extends EventInput {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
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
  };
}

const Schedule: React.FC = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadScheduleData();
    loadFacultyAndCourses();
  }, []);

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
        },
      }));
      
      setEvents(formattedEvents);
      setError('');
    } catch (err: any) {
      console.error('Schedule load error:', err);
      setError(err.response?.data?.error || 'Failed to load schedule data');
    } finally {
      setLoading(false);
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
    
    const details = `
      Course: ${props.courseCode}
      Section: ${props.sectionCode || 'N/A'}
      Faculty: ${props.facultyName}
      Type: ${props.type}
      Room: ${props.room || 'TBA'}
      Time: ${clickInfo.event.start?.toLocaleTimeString()} - ${clickInfo.event.end?.toLocaleTimeString()}
      Students: ${props.enrolledStudents || 0}/${props.maxStudents || 0}
      ${props.isNightSection ? 'Night Section: Yes' : ''}
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
      } else {
        setError(`Failed to assign ${result.unassignedCourses?.length || 0} courses`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate schedule');
    }
  };

  const onSubmitAssignment = async (data: any) => {
    try {
      // Convert selected date to time slot format
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
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create assignment');
    }
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
        <Typography variant="h4">Schedule Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateSchedule}
        >
          Generate Optimal Schedule
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
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
            events={events}
            select={handleDateSelect}
            eventClick={handleEventClick}
            slotMinTime="07:30:00"
            slotMaxTime="21:00:00"
            weekends={true}
            height="auto"
          />
        </CardContent>
      </Card>

      <Box mt={3}>
        <Grid container spacing={2}>
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
        </Grid>
      </Box>

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
    </Box>
  );
};

export default Schedule;