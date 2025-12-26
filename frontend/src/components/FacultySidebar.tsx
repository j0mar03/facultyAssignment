import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  List,
  ListItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tooltip,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useDrag } from 'react-dnd';
import { facultyService } from '../services/facultyService';

// Drag item types
export const ItemTypes = {
  FACULTY: 'faculty'
};

interface Faculty {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  type: 'Regular' | 'Part-Time' | 'Temporary' | 'Designee';
  department: string;
  college: string;
  currentRegularLoad: number;
  currentExtraLoad: number;
  maxRegularLoad: number;
  maxExtraLoad: number;
  hasITEESRestriction: boolean;
  isActive: boolean;
  profilePicture?: string;
  specialization?: string;
}

interface FacultySidebarProps {
  onFacultySelect?: (faculty: Faculty) => void;
  selectedFacultyId?: string;
  filterByDepartment?: string;
}

// Draggable Faculty Card Component
const DraggableFacultyCard: React.FC<{
  faculty: Faculty;
  isSelected: boolean;
  onClick: () => void;
}> = ({ faculty, isSelected, onClick }) => {
  const theme = useTheme();
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FACULTY,
    item: { 
      id: faculty.id,
      faculty: faculty
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [faculty]);

  const getLoadPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const getLoadColor = (percentage: number) => {
    if (percentage >= 90) return theme.palette.error.main;
    if (percentage >= 70) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getFacultyTypeColor = (type: string) => {
    switch (type) {
      case 'Regular': return theme.palette.primary.main;
      case 'Part-Time': return theme.palette.secondary.main;
      case 'Temporary': return theme.palette.info.main;
      case 'Designee': return theme.palette.success.main;
      case 'AdminFaculty': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  const regularLoadPercentage = getLoadPercentage(faculty.currentRegularLoad, faculty.maxRegularLoad);
  const extraLoadPercentage = getLoadPercentage(faculty.currentExtraLoad, faculty.maxExtraLoad);

  return (
    <div ref={drag}>
      <Card
        sx={{
          mb: 1,
          cursor: isDragging ? 'grabbing' : 'grab',
          opacity: isDragging ? 0.5 : 1,
          transform: isDragging ? 'rotate(5deg)' : 'none',
          transition: 'all 0.2s ease-in-out',
          border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
          borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
          backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
          '&:hover': {
            transform: isDragging ? 'rotate(5deg)' : 'translateY(-2px)',
            boxShadow: theme.shadows[4],
            borderColor: theme.palette.primary.light,
          }
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            {/* Avatar */}
            <Avatar
              src={faculty.profilePicture}
              sx={{
                bgcolor: getFacultyTypeColor(faculty.type),
                width: 40,
                height: 40,
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}
            >
              {faculty.firstName.charAt(0)}{faculty.lastName.charAt(0)}
            </Avatar>

            {/* Faculty Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                  {faculty.fullName}
                </Typography>
                <DragIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              </Box>

              {/* Faculty Type & Department */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <Chip
                  label={faculty.type}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.75rem',
                    backgroundColor: alpha(getFacultyTypeColor(faculty.type), 0.1),
                    color: getFacultyTypeColor(faculty.type),
                    border: `1px solid ${alpha(getFacultyTypeColor(faculty.type), 0.3)}`
                  }}
                />
                <Typography variant="caption" color="text.secondary" noWrap>
                  {faculty.department}
                </Typography>
              </Box>

              {/* Load Information */}
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Regular Load
                  </Typography>
                  <Typography variant="caption" fontWeight="medium">
                    {faculty.currentRegularLoad}/{faculty.maxRegularLoad}h
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={regularLoadPercentage}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: alpha(getLoadColor(regularLoadPercentage), 0.2),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getLoadColor(regularLoadPercentage),
                      borderRadius: 2
                    }
                  }}
                />
              </Box>

              {/* Extra Load */}
              {faculty.maxExtraLoad > 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Extra Load
                    </Typography>
                    <Typography variant="caption" fontWeight="medium">
                      {faculty.currentExtraLoad}/{faculty.maxExtraLoad}h
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={extraLoadPercentage}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: alpha(getLoadColor(extraLoadPercentage), 0.2),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getLoadColor(extraLoadPercentage),
                        borderRadius: 2
                      }
                    }}
                  />
                </Box>
              )}

              {/* Warning Icons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {faculty.hasITEESRestriction && (
                  <Tooltip title="ITEES Restriction - Cannot take extra load">
                    <WarningIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                  </Tooltip>
                )}
                {regularLoadPercentage >= 100 && (
                  <Tooltip title="Regular load at capacity">
                    <Badge color="error" variant="dot">
                      <SchoolIcon sx={{ fontSize: 16, color: 'error.main' }} />
                    </Badge>
                  </Tooltip>
                )}
                {faculty.specialization && (
                  <Tooltip title={`Specialization: ${faculty.specialization}`}>
                    <StarIcon sx={{ fontSize: 16, color: 'info.main' }} />
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

const FacultySidebar: React.FC<FacultySidebarProps> = ({
  onFacultySelect,
  selectedFacultyId,
  filterByDepartment
}) => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<string[]>(['Regular', 'Designee']);

  useEffect(() => {
    loadFaculty();
  }, []);

  useEffect(() => {
    filterFaculty();
  }, [faculty, searchTerm, filterByDepartment]);

  const loadFaculty = async () => {
    try {
      setLoading(true);
      const data = await facultyService.getAllFaculty();
      setFaculty(data);
    } catch (error) {
      console.error('Failed to load faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFaculty = () => {
    let filtered = faculty.filter(f => f.isActive);

    if (filterByDepartment) {
      filtered = filtered.filter(f => f.department === filterByDepartment);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.fullName.toLowerCase().includes(term) ||
        f.department.toLowerCase().includes(term) ||
        f.type.toLowerCase().includes(term)
      );
    }

    setFilteredFaculty(filtered);
  };

  const groupedFaculty = filteredFaculty.reduce((groups, faculty) => {
    const type = faculty.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(faculty);
    return groups;
  }, {} as Record<string, Faculty[]>);

  const handleTypeToggle = (type: string) => {
    setExpandedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleFacultyClick = (faculty: Faculty) => {
    if (onFacultySelect) {
      onFacultySelect(faculty);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Typography variant="h6" sx={{ p: 2, pb: 1, fontWeight: 'bold' }}>
        Faculty Members
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, mb: 2 }}>
        Drag faculty to calendar slots to assign
      </Typography>

      {/* Search */}
      <Box sx={{ px: 2, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search faculty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Faculty Groups */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2 }}>
        {loading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Loading faculty...
            </Typography>
          </Box>
        ) : (
          Object.entries(groupedFaculty).map(([type, facultyList]) => (
            <Accordion
              key={type}
              expanded={expandedTypes.includes(type)}
              onChange={() => handleTypeToggle(type)}
              sx={{ mb: 1, '&:before': { display: 'none' } }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  minHeight: 40,
                  '& .MuiAccordionSummary-content': { margin: '8px 0' }
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {type} Faculty ({facultyList.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 1 }}>
                <List sx={{ p: 0 }}>
                  {facultyList.map((facultyMember) => (
                    <ListItem key={facultyMember.id} sx={{ p: 0, mb: 1 }}>
                      <DraggableFacultyCard
                        faculty={facultyMember}
                        isSelected={selectedFacultyId === facultyMember.id}
                        onClick={() => handleFacultyClick(facultyMember)}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        )}
        
        {!loading && filteredFaculty.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No faculty found
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FacultySidebar;