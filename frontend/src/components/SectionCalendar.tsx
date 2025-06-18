import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Avatar,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { sectionService } from '../services/sectionService';
import { facultyService } from '../services/facultyService';

// Drag and drop item types
const ItemTypes = {
  SECTION: 'section'
};

interface Section {
  id: string;
  sectionCode: string;
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
  hasConflicts?: boolean;
  conflicts?: any[];
}

interface Faculty {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  type: string;
  department: string;
  currentRegularLoad: number;
  currentExtraLoad: number;
}

interface SectionCalendarProps {
  sections: Section[];
  onSectionClick?: (section: Section) => void;
  onSectionAssign?: (section: Section) => void;
  onSectionUpdate?: () => void;
}

const SectionCalendar: React.FC<SectionCalendarProps> = ({
  sections,
  onSectionClick,
  onSectionAssign,
  onSectionUpdate
}) => {
  const theme = useTheme();
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [roomInput, setRoomInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Drag and drop states
  const [hoveredTimeSlot, setHoveredTimeSlot] = useState<{day: number, hour: number} | null>(null);
  
  // Time editing states
  const [timeEditDialogOpen, setTimeEditDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Time slots from 7:00 AM to 9:00 PM
  const timeSlots = useMemo(() => {
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

  // Get unique section codes for filter dropdown
  const uniqueSectionCodes = useMemo(() => {
    const sectionCodes = new Set<string>();
    sections.forEach(section => {
      sectionCodes.add(section.sectionCode);
    });
    return Array.from(sectionCodes).sort();
  }, [sections]);

  // Filter sections based on selected section filter
  const filteredSections = useMemo(() => {
    if (sectionFilter === 'all') {
      return sections;
    }
    return sections.filter(section => section.sectionCode === sectionFilter);
  }, [sections, sectionFilter]);

  // Convert time string to minutes from midnight
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Get sections for a specific day
  const getSectionsForDay = (dayOfWeek: number) => {
    return filteredSections.filter(section => {
      if (!section.timeSlots) return false;
      return section.timeSlots.some(timeSlot => timeSlot.dayOfWeek === dayOfWeek);
    });
  };

  // Get the starting hour index for a section
  const getSectionStartHour = (section: Section, dayOfWeek: number): number => {
    if (!section.timeSlots) return -1;
    
    const timeSlot = section.timeSlots.find(slot => slot.dayOfWeek === dayOfWeek);
    if (!timeSlot) return -1;
    
    const startMinutes = timeToMinutes(timeSlot.startTime);
    return Math.floor(startMinutes / 60);
  };

  // Calculate section width based on duration
  const getSectionWidth = (section: Section, dayOfWeek: number): number => {
    if (!section.timeSlots) return 80;
    
    const timeSlot = section.timeSlots.find(slot => slot.dayOfWeek === dayOfWeek);
    if (!timeSlot) return 80;
    
    const duration = timeToMinutes(timeSlot.endTime) - timeToMinutes(timeSlot.startTime);
    const hours = Math.ceil(duration / 60);
    return hours * 80; // 80px per hour column
  };

  // Get section position offset
  const getSectionLeft = (section: Section, dayOfWeek: number): number => {
    const startHour = getSectionStartHour(section, dayOfWeek);
    if (startHour === -1) return 0;
    
    const hourIndex = timeSlots.findIndex(slot => slot.hour === startHour);
    return hourIndex * 80;
  };

  // Get section color based on status and assignment
  const getSectionColor = (section: Section) => {
    if (section.hasConflicts) {
      return {
        background: theme.palette.error.light,
        color: theme.palette.error.contrastText,
        border: `2px solid ${theme.palette.error.main}`
      };
    }
    
    if (!section.faculty) {
      return {
        background: theme.palette.warning.light,
        color: theme.palette.warning.contrastText,
        border: `2px solid ${theme.palette.warning.main}`
      };
    }

    if (section.isNightSection) {
      return {
        background: theme.palette.secondary.light,
        color: theme.palette.secondary.contrastText,
        border: `2px solid ${theme.palette.secondary.main}`
      };
    }

    return {
      background: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      border: `2px solid ${theme.palette.primary.main}`
    };
  };


  const handleSectionClick = (section: Section) => {
    setSelectedSection(section);
    
    // If section is not assigned, open faculty assignment dialog directly
    if (!section.faculty) {
      handleAssignClick(section);
    } else {
      // If section is already assigned, show details dialog
      setDialogOpen(true);
    }
    
    if (onSectionClick) {
      onSectionClick(section);
    }
  };


  // Load faculty when assign dialog opens
  const loadFaculty = async () => {
    try {
      const facultyData = await facultyService.getAllFaculty();
      // Sort faculty by full name for easier selection
      const sortedFaculty = facultyData.sort((a, b) => {
        const nameA = a.fullName || `${a.firstName} ${a.lastName}`;
        const nameB = b.fullName || `${b.firstName} ${b.lastName}`;
        return nameA.localeCompare(nameB);
      });
      setFaculty(sortedFaculty);
    } catch (error) {
      console.error('Error loading faculty:', error);
      setError('Failed to load faculty list');
    }
  };

  const handleAssignClick = (section: Section) => {
    setSelectedSection(section);
    setSelectedFaculty('');
    setRoomInput(section.room || '');
    setError('');
    loadFaculty();
    setAssignDialogOpen(true);
  };

  const handleAssignFaculty = async () => {
    if (!selectedSection || !selectedFaculty) return;

    setLoading(true);
    setError('');

    try {
      await sectionService.assignFacultyToSection(
        selectedSection.id,
        selectedFaculty,
        roomInput || undefined
      );
      
      setAssignDialogOpen(false);
      setDialogOpen(false);
      
      // Refresh the sections data
      if (onSectionUpdate) {
        onSectionUpdate();
      }
    } catch (error: any) {
      console.error('Error assigning faculty:', error);
      setError(error.response?.data?.error || 'Failed to assign faculty');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignFaculty = async () => {
    if (!selectedSection) {
      console.log('No section selected for unassignment');
      return;
    }

    console.log('Starting unassignment for section:', selectedSection.id);
    setLoading(true);
    setError('');

    try {
      const result = await sectionService.unassignFacultyFromSection(selectedSection.id);
      console.log('Unassignment successful:', result);
      
      // Refresh the sections data first
      if (onSectionUpdate) {
        console.log('Calling onSectionUpdate to refresh data');
        await onSectionUpdate();
      } else {
        console.log('onSectionUpdate callback not available');
      }
      
      // Close dialog after successful update
      setDialogOpen(false);
      
    } catch (error: any) {
      console.error('Error unassigning faculty:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.error || 'Failed to unassign faculty');
    } finally {
      setLoading(false);
    }
  };

  const formatFacultyName = (faculty?: { fullName?: string; firstName?: string; lastName?: string }) => {
    if (!faculty) return 'Unassigned';
    return faculty.fullName || `${faculty.firstName || ''} ${faculty.lastName || ''}`.trim();
  };

  // Drag and drop handlers
  const handleSectionDrop = useCallback(async (sectionId: string, targetDay: number, targetHour: number) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !section.timeSlots) return;

    console.log('Dropping section', sectionId, 'to day', targetDay, 'hour', targetHour);

    // Calculate new time slots based on the original duration
    const originalSlot = section.timeSlots[0]; // Assuming single time slot for simplicity
    const duration = timeToMinutes(originalSlot.endTime) - timeToMinutes(originalSlot.startTime);
    
    const newStartTime = `${targetHour.toString().padStart(2, '0')}:00`;
    const newEndMinutes = targetHour * 60 + duration;
    const newEndHour = Math.floor(newEndMinutes / 60);
    const newEndMinute = newEndMinutes % 60;
    const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;

    const updatedTimeSlots = [{
      dayOfWeek: targetDay,
      startTime: newStartTime,
      endTime: newEndTime
    }];

    try {
      setLoading(true);
      await sectionService.updateSection(sectionId, {
        timeSlots: updatedTimeSlots
      });
      
      if (onSectionUpdate) {
        await onSectionUpdate();
      }
    } catch (error) {
      console.error('Error updating section time:', error);
      setError('Failed to update section schedule');
    } finally {
      setLoading(false);
    }
  }, [sections, onSectionUpdate]);

  // Time editing handlers
  const handleEditTime = (section: Section) => {
    setEditingSection(section);
    if (section.timeSlots && section.timeSlots.length > 0) {
      const timeSlot = section.timeSlots[0];
      setSelectedDay(timeSlot.dayOfWeek);
      setNewStartTime(timeSlot.startTime);
      setNewEndTime(timeSlot.endTime);
    }
    setTimeEditDialogOpen(true);
  };

  const handleSaveTimeEdit = async () => {
    if (!editingSection) return;

    const updatedTimeSlots = [{
      dayOfWeek: selectedDay,
      startTime: newStartTime,
      endTime: newEndTime
    }];

    try {
      setLoading(true);
      await sectionService.updateSection(editingSection.id, {
        timeSlots: updatedTimeSlots
      });
      
      setTimeEditDialogOpen(false);
      setEditingSection(null);
      
      if (onSectionUpdate) {
        await onSectionUpdate();
      }
    } catch (error) {
      console.error('Error updating section time:', error);
      setError('Failed to update section schedule');
    } finally {
      setLoading(false);
    }
  };

  // Draggable Section Component
  const DraggableSection: React.FC<{
    section: Section;
    colors: any;
    width: number;
    left: number;
    timeSlot: any;
  }> = ({ section, colors, width, left, timeSlot }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.SECTION,
      item: { id: section.id, section },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }), [section]);

    const handleSectionRightClick = (e: React.MouseEvent) => {
      e.preventDefault();
      handleEditTime(section);
    };

    return (
      <div ref={drag}>
        <Tooltip
          title={
            <Box>
              <Typography variant="subtitle2">{section.course.code}</Typography>
              <Typography variant="body2">{section.course.name}</Typography>
              <Typography variant="body2">Section: {section.sectionCode}</Typography>
              <Typography variant="body2">Faculty: {formatFacultyName(section.faculty)}</Typography>
              <Typography variant="body2">Room: {section.room || 'TBA'}</Typography>
              <Typography variant="body2">Time: {timeSlot?.startTime} - {timeSlot?.endTime}</Typography>
              <Typography variant="body2">Students: {section.enrolledStudents}/{section.maxStudents}</Typography>
              <Typography variant="caption" sx={{ fontStyle: 'italic', mt: 1, display: 'block' }}>
                Drag to reschedule • Right-click to edit time
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
              ...colors,
              cursor: isDragging ? 'grabbing' : 'grab',
              zIndex: isDragging ? 10 : 1,
              opacity: isDragging ? 0.5 : 1,
              '&:hover': {
                transform: isDragging ? 'none' : 'scale(1.02)',
                zIndex: isDragging ? 10 : 2,
                boxShadow: 4,
              },
              transition: 'all 0.2s ease-in-out',
              overflow: 'hidden',
              border: `2px solid ${colors.border || 'transparent'}`,
            }}
            onClick={() => handleSectionClick(section)}
            onContextMenu={handleSectionRightClick}
          >
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                  {section.course.code}
                </Typography>
                <DragIcon sx={{ fontSize: 12, opacity: 0.7 }} />
              </Box>
              
              <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1.1 }}>
                {section.sectionCode}
              </Typography>
              
              <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1, mt: 0.25, color: 'text.secondary' }}>
                {timeSlot?.startTime} - {timeSlot?.endTime}
              </Typography>
              
              {section.faculty && (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1, mt: 0.5, fontWeight: 500 }}>
                  {formatFacultyName(section.faculty)}
                </Typography>
              )}
              
              <Typography variant="caption" sx={{ fontSize: '0.6rem', mt: 0.25, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationIcon sx={{ fontSize: 10 }} />
                {section.room || 'TBA'}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                {section.hasConflicts && (
                  <Chip label="Conflict" size="small" color="error" sx={{ height: 16, fontSize: '0.6rem' }} icon={<WarningIcon sx={{ fontSize: 10 }} />} />
                )}
                {!section.faculty && (
                  <Chip label="Unassigned" size="small" color="warning" sx={{ height: 16, fontSize: '0.6rem' }} icon={<AssignmentIcon sx={{ fontSize: 10 }} />} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Tooltip>
      </div>
    );
  };

  // Droppable Time Slot Component
  const DroppableTimeSlot: React.FC<{
    day: number;
    hour: number;
    children?: React.ReactNode;
  }> = ({ day, hour, children }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
      accept: ItemTypes.SECTION,
      drop: (item: { id: string; section: Section }) => {
        handleSectionDrop(item.id, day, hour);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }), [day, hour, handleSectionDrop]);

    const isHighlighted = isOver && canDrop;

    return (
      <div ref={drop}>
        <Box
          sx={{
            width: 80,
            minHeight: 80,
            borderRight: `1px solid ${theme.palette.divider}`,
            '&:last-child': { borderRight: 'none' },
            backgroundColor: isHighlighted 
              ? theme.palette.primary.light 
              : hoveredTimeSlot?.day === day && hoveredTimeSlot?.hour === hour 
                ? theme.palette.action.hover 
                : 'transparent',
            '&:hover': {
              backgroundColor: isHighlighted 
                ? theme.palette.primary.light 
                : theme.palette.action.hover
            },
            transition: 'background-color 0.2s ease-in-out',
            position: 'relative',
            border: isHighlighted ? `2px dashed ${theme.palette.primary.main}` : 'none',
          }}
          onMouseEnter={() => setHoveredTimeSlot({ day, hour })}
          onMouseLeave={() => setHoveredTimeSlot(null)}
        >
          {children}
          {isHighlighted && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                borderRadius: 1,
                px: 1,
                py: 0.5,
                fontSize: '0.7rem',
                fontWeight: 'bold',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            >
              Drop here
            </Box>
          )}
        </Box>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box>
      {/* Section Filter */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
          Schedule View
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Section</InputLabel>
          <Select
            value={sectionFilter}
            label="Filter by Section"
            onChange={(e) => setSectionFilter(e.target.value)}
          >
            <MenuItem value="all">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" fontWeight="bold">All Sections</Typography>
                <Chip size="small" label={`${sections.length} total`} color="primary" />
              </Box>
            </MenuItem>
            {uniqueSectionCodes.map(sectionCode => {
              const sectionsWithThisCode = sections.filter(s => s.sectionCode === sectionCode);
              const courseCodes = [...new Set(sectionsWithThisCode.map(s => s.course.code))];
              return (
                <MenuItem key={sectionCode} value={sectionCode}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="bold">{sectionCode}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({courseCodes.join(', ')})
                    </Typography>
                    <Chip size="small" label={sectionsWithThisCode.length} />
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        
        {sectionFilter !== 'all' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredSections.length} course{filteredSections.length !== 1 ? 's' : ''} for section {sectionFilter}
            </Typography>
            <Button 
              size="small" 
              onClick={() => setSectionFilter('all')}
              variant="outlined"
            >
              Show All
            </Button>
          </Box>
        )}
      </Box>

      {/* Section Summary Card (when filtered) */}
      {sectionFilter !== 'all' && filteredSections.length > 0 && (
        <Card sx={{ mb: 3, backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.primary.main}` }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Section {sectionFilter} Summary
            </Typography>
            <Grid container spacing={2}>
              {filteredSections.map(section => (
                <Grid item xs={12} sm={6} md={4} key={section.id}>
                  <Box sx={{ 
                    p: 2, 
                    border: `1px solid ${theme.palette.divider}`, 
                    borderRadius: 1,
                    backgroundColor: section.faculty ? theme.palette.success.light : theme.palette.warning.light,
                    color: section.faculty ? theme.palette.success.contrastText : theme.palette.warning.contrastText
                  }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {section.course.code} - {section.course.name}
                    </Typography>
                    <Typography variant="body2">
                      Faculty: {formatFacultyName(section.faculty)}
                    </Typography>
                    <Typography variant="body2">
                      Room: {section.room || 'TBA'}
                    </Typography>
                    <Typography variant="body2">
                      Students: {section.enrolledStudents}/{section.maxStudents}
                    </Typography>
                    <Typography variant="body2">
                      Type: {section.classType} {section.isNightSection && '(Night)'}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* No Sections Found Message */}
      {sectionFilter !== 'all' && filteredSections.length === 0 && (
        <Card sx={{ mb: 3, backgroundColor: theme.palette.warning.light }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <WarningIcon sx={{ fontSize: 48, color: theme.palette.warning.main, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No sections found for "{sectionFilter}"
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This section code doesn't exist in the current semester/academic year.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setSectionFilter('all')}
              sx={{ mt: 2 }}
            >
              View All Sections
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Color Legend */}
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
          Legend:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ 
            width: 16, 
            height: 16, 
            backgroundColor: theme.palette.primary.main, 
            borderRadius: 1 
          }} />
          <Typography variant="caption">Assigned</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ 
            width: 16, 
            height: 16, 
            backgroundColor: theme.palette.warning.main, 
            borderRadius: 1 
          }} />
          <Typography variant="caption">Unassigned</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ 
            width: 16, 
            height: 16, 
            backgroundColor: theme.palette.secondary.main, 
            borderRadius: 1 
          }} />
          <Typography variant="caption">Night Section</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ 
            width: 16, 
            height: 16, 
            backgroundColor: theme.palette.error.main, 
            borderRadius: 1 
          }} />
          <Typography variant="caption">Conflicts</Typography>
        </Box>
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
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontWeight: 'bold',
              borderRight: `1px solid ${theme.palette.divider}`,
              '&:last-child': { borderRight: 'none' }
            }}
          >
            <Typography variant="caption">{timeSlot.displayTime}</Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
        {weekDays.map(day => (
          <Box
            key={day.day}
            sx={{
              display: 'flex',
              minHeight: 80,
              borderBottom: `1px solid ${theme.palette.divider}`,
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
                backgroundColor: theme.palette.grey[50],
                borderRight: `1px solid ${theme.palette.divider}`,
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
              {/* Droppable time slot cells */}
              {timeSlots.map(timeSlot => (
                <DroppableTimeSlot
                  key={`${day.day}-${timeSlot.hour}`}
                  day={day.day}
                  hour={timeSlot.hour}
                />
              ))}
              
              {/* Draggable sections positioned absolutely */}
              {getSectionsForDay(day.day).map((section) => {
                const colors = getSectionColor(section);
                const width = getSectionWidth(section, day.day);
                const left = getSectionLeft(section, day.day);
                const timeSlot = section.timeSlots?.find(slot => slot.dayOfWeek === day.day);

                return (
                  <DraggableSection
                    key={section.id}
                    section={section}
                    colors={colors}
                    width={width}
                    left={left}
                    timeSlot={timeSlot}
                  />
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Section Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedSection && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Typography variant="h6">
                    {selectedSection.course.code} - {selectedSection.sectionCode}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {selectedSection.course.name}
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <Chip
                    label={selectedSection.status}
                    color={selectedSection.faculty ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Course Information</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2"><strong>Credits:</strong> {selectedSection.course.credits}</Typography>
                    <Typography variant="body2"><strong>Type:</strong> {selectedSection.classType}</Typography>
                    <Typography variant="body2"><strong>Night Section:</strong> {selectedSection.isNightSection ? 'Yes' : 'No'}</Typography>
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>Enrollment</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Students:</strong> {selectedSection.enrolledStudents}/{selectedSection.maxStudents} 
                      ({Math.round((selectedSection.enrolledStudents / selectedSection.maxStudents) * 100)}% full)
                    </Typography>
                    <Typography variant="body2"><strong>Room:</strong> {selectedSection.room || 'TBA'}</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Faculty Assignment</Typography>
                  <Box sx={{ mb: 2 }}>
                    {selectedSection.faculty ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <PersonIcon />
                        </Avatar>
                        <Typography variant="body2">
                          {formatFacultyName(selectedSection.faculty)}
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentIcon color="warning" />
                        <Typography variant="body2" color="warning.main">
                          No faculty assigned
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>Schedule</Typography>
                  <Box>
                    {selectedSection.timeSlots?.map((slot, index) => (
                      <Typography key={index} variant="body2">
                        {weekDays.find(d => d.day === slot.dayOfWeek)?.name}: {slot.startTime} - {slot.endTime}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
              </Grid>
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {selectedSection.hasConflicts && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: theme.palette.error.light, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="error" />
                    <Typography variant="subtitle2" color="error">
                      Schedule Conflicts Detected
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="error">
                    This section has scheduling conflicts that need to be resolved.
                  </Typography>
                </Box>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              {!selectedSection.faculty ? (
                <Button variant="contained" onClick={() => handleAssignClick(selectedSection)} startIcon={<SchoolIcon />}>
                  Assign Faculty
                </Button>
              ) : (
                <Button variant="outlined" color="warning" onClick={handleUnassignFaculty} disabled={loading}>
                  {loading ? <CircularProgress size={20} /> : 'Unassign Faculty'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Faculty Assignment Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" />
            <Typography variant="h6">
              Assign Faculty to {selectedSection?.course.code} - {selectedSection?.sectionCode}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Faculty</InputLabel>
                  <Select
                    value={selectedFaculty}
                    label="Select Faculty"
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                    disabled={loading}
                  >
                    <MenuItem value="">
                      <em>Choose a faculty member</em>
                    </MenuItem>
                    {faculty.map((f) => (
                      <MenuItem key={f.id} value={f.id} sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                          <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                            {f.fullName || `${f.firstName} ${f.lastName}`}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                            <Typography variant="caption" sx={{ 
                              backgroundColor: 'primary.light', 
                              color: 'primary.contrastText',
                              px: 1, 
                              py: 0.25, 
                              borderRadius: 1,
                              fontSize: '0.75rem'
                            }}>
                              {f.type}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {f.department}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
                            Current Load: {f.currentRegularLoad}h regular + {f.currentExtraLoad}h extra
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Room (Optional)"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder="e.g., ITECH 204"
                  disabled={loading}
                  helperText="Enter room assignment for this section"
                />
              </Grid>

              {selectedSection && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: theme.palette.background.default, borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Section Details:
                    </Typography>
                    <Typography variant="body2">
                      <strong>Course:</strong> {selectedSection.course.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Credits:</strong> {selectedSection.course.credits}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Type:</strong> {selectedSection.classType}
                      {selectedSection.isNightSection && ' (Night Section)'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Schedule:</strong>{' '}
                      {selectedSection.timeSlots?.map((slot, index) => (
                        <span key={index}>
                          {weekDays.find(d => d.day === slot.dayOfWeek)?.name}: {slot.startTime} - {slot.endTime}
                          {index < selectedSection.timeSlots!.length - 1 && ', '}
                        </span>
                      ))}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAssignFaculty}
            disabled={!selectedFaculty || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SchoolIcon />}
          >
            {loading ? 'Assigning...' : 'Assign Faculty'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Time Editing Dialog */}
      <Dialog
        open={timeEditDialogOpen}
        onClose={() => setTimeEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon color="primary" />
            <Typography variant="h6">
              Edit Schedule - {editingSection?.course.code} ({editingSection?.sectionCode})
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Day of Week</InputLabel>
                  <Select
                    value={selectedDay}
                    label="Day of Week"
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                    disabled={loading}
                  >
                    {weekDays.map((day) => (
                      <MenuItem key={day.day} value={day.day}>
                        {day.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  disabled={loading}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 minute steps
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  disabled={loading}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 minute steps
                  }}
                />
              </Grid>

              {editingSection && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: theme.palette.background.default, borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Current Schedule:
                    </Typography>
                    <Typography variant="body2">
                      <strong>Day:</strong> {weekDays.find(d => d.day === (editingSection.timeSlots?.[0]?.dayOfWeek || 1))?.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Time:</strong> {editingSection.timeSlots?.[0]?.startTime} - {editingSection.timeSlots?.[0]?.endTime}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Duration:</strong> {
                        editingSection.timeSlots?.[0] 
                          ? Math.round((timeToMinutes(editingSection.timeSlots[0].endTime) - timeToMinutes(editingSection.timeSlots[0].startTime)) / 60 * 10) / 10
                          : 0
                      } hours
                    </Typography>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Tips:</strong>
                  </Typography>
                  <Typography variant="body2">
                    • Drag sections on the calendar for quick rescheduling
                  </Typography>
                  <Typography variant="body2">
                    • Right-click sections to edit detailed timing
                  </Typography>
                  <Typography variant="body2">
                    • Changes will be validated for conflicts
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setTimeEditDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveTimeEdit}
            disabled={!newStartTime || !newEndTime || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <EditIcon />}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </DndProvider>
  );
};

export default SectionCalendar;