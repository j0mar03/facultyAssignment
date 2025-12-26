import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { roomService, Room } from '../services/roomService';
import { sectionService } from '../services/sectionService';
import SectionCalendar from '../components/SectionCalendar';

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters for schedule-based usage
  const [selectedSemester, setSelectedSemester] = useState<string>('Second');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2025-2026');

  // Usage summary per room based on sections schedule
  const [roomUsage, setRoomUsage] = useState<Record<string, { sectionCount: number; totalHours: number }>>({});
  const [allSections, setAllSections] = useState<any[]>([]);
  const [selectedRoomCode, setSelectedRoomCode] = useState<string>('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    building: '',
    type: 'Lecture' as Room['type'],
    capacity: 40,
    isActive: true,
  });

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await roomService.getAllRooms(includeInactive);
      setRooms(data);
      setError('');
    } catch (err: any) {
      console.error('Error loading rooms:', err);
      setError(err.response?.data?.error || 'Failed to load rooms');
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

  const loadRoomUsage = async () => {
    try {
      const sections = await sectionService.getAllSections({
        semester: selectedSemester,
        academicYear: selectedAcademicYear,
      });

      setAllSections(sections);

      const usageMap: Record<string, { sectionCount: number; totalHours: number }> = {};

      sections.forEach((section: any) => {
        if (!section.room) return;
        const code = String(section.room).trim();
        if (!code) return;

        if (!usageMap[code]) {
          usageMap[code] = { sectionCount: 0, totalHours: 0 };
        }

        usageMap[code].sectionCount += 1;
        usageMap[code].totalHours += computeSectionHours(section);
      });

      setRoomUsage(usageMap);
      // Default selected room to first active room that has usage or first active room
      if (!selectedRoomCode) {
        const roomWithUsage = rooms.find((r) => usageMap[r.code]);
        const fallbackRoom = rooms.find((r) => r.isActive);
        const initial = roomWithUsage?.code || fallbackRoom?.code || '';
        setSelectedRoomCode(initial);
      }
    } catch (err) {
      console.error('Error loading room usage:', err);
      // Keep existing usage on error
    }
  };

  useEffect(() => {
    // Load rooms and usage whenever filters change
    loadRooms();
    loadRoomUsage();
  }, [includeInactive, selectedSemester, selectedAcademicYear]);

  const handleOpenDialog = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        code: room.code,
        name: room.name || '',
        building: room.building || '',
        type: room.type,
        capacity: room.capacity,
        isActive: room.isActive,
      });
    } else {
      setEditingRoom(null);
      setFormData({
        code: '',
        name: '',
        building: '',
        type: 'Lecture',
        capacity: 40,
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRoom(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim() || undefined,
        building: formData.building.trim() || undefined,
        type: formData.type,
        capacity: formData.capacity,
        isActive: formData.isActive,
      };

      if (!payload.code) {
        setError('Room code is required');
        setLoading(false);
        return;
      }

      if (editingRoom) {
        await roomService.updateRoom(editingRoom.id, payload);
      } else {
        await roomService.createRoom(payload);
      }

      handleCloseDialog();
      await loadRooms();
    } catch (err: any) {
      console.error('Error saving room:', err);
      setError(err.response?.data?.error || 'Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (room: Room) => {
    if (!window.confirm(`Deactivate room ${room.code}?`)) return;
    try {
      setLoading(true);
      setError('');
      await roomService.deleteRoom(room.id);
      await loadRooms();
    } catch (err: any) {
      console.error('Error deactivating room:', err);
      setError(err.response?.data?.error || 'Failed to deactivate room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Room Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Room
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Summary
          </Typography>
          <Box display="flex" gap={3} flexWrap="wrap" alignItems="center">
            <Chip
              label={`Active Rooms: ${rooms.filter((r) => r.isActive).length}`}
              color="success"
            />
            <Chip
              label={`Inactive Rooms: ${rooms.filter((r) => !r.isActive).length}`}
              color="default"
            />
            <Chip
              label={`Rooms In Use (current sem): ${
                Object.keys(roomUsage).filter((code) => roomUsage[code]?.sectionCount > 0).length
              }`}
              color="info"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={includeInactive}
                  onChange={(e) => setIncludeInactive(e.target.checked)}
                  color="primary"
                />
              }
              label="Show inactive rooms"
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Semester</InputLabel>
              <Select
                value={selectedSemester}
                label="Semester"
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <MenuItem value="First">First Semester</MenuItem>
                <MenuItem value="Second">Second Semester</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={selectedAcademicYear}
                label="Academic Year"
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
              >
                <MenuItem value="2024-2025">2024-2025</MenuItem>
                <MenuItem value="2025-2026">2025-2026</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Building</TableCell>
              <TableCell align="center">Type</TableCell>
              <TableCell align="center">Capacity</TableCell>
               <TableCell align="center">Sections (Current Sem)</TableCell>
               <TableCell align="center">Total Hours (Current Sem)</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                {(() => {
                  const usage = roomUsage[room.code] || { sectionCount: 0, totalHours: 0 };
                  return (
                    <>
                      <TableCell>{room.code}</TableCell>
                      <TableCell>{room.name}</TableCell>
                      <TableCell>{room.building}</TableCell>
                      <TableCell align="center">
                        <Chip label={room.type} size="small" />
                      </TableCell>
                      <TableCell align="center">{room.capacity}</TableCell>
                      <TableCell align="center">
                        {usage.sectionCount > 0 ? (
                          <Chip
                            label={`${usage.sectionCount} section${usage.sectionCount > 1 ? 's' : ''}`}
                            color="primary"
                            size="small"
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            None
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {usage.totalHours.toFixed(1)}
                      </TableCell>
                    </>
                  );
                })()}
                <TableCell align="center">
                  <Chip
                    label={room.isActive ? 'Active' : 'Inactive'}
                    color={room.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleOpenDialog(room)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {room.isActive && (
                    <Tooltip title="Deactivate">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeactivate(room)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rooms.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No rooms found. Click &quot;Add Room&quot; to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Weekly Room Utilization Calendar */}
      {selectedRoomCode && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Weekly Room Schedule - {selectedRoomCode}
          </Typography>

          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Room</InputLabel>
              <Select
                value={selectedRoomCode}
                label="Room"
                onChange={(e) => setSelectedRoomCode(e.target.value)}
              >
                {rooms
                  .filter((r) => r.isActive)
                  .map((room) => (
                    <MenuItem key={room.id} value={room.code}>
                      {room.code} {room.name ? `- ${room.name}` : ''}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              Showing all scheduled sections in this room for {selectedSemester} {selectedAcademicYear}
            </Typography>
          </Box>

          <SectionCalendar
            sections={allSections.filter((s) => s.room && String(s.room).trim() === selectedRoomCode)}
            onSectionUpdate={loadRoomUsage}
          />
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRoom ? 'Edit Room' : 'Add Room'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Room Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., IT204"
              fullWidth
            />
            <TextField
              label="Name (optional)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Computer Lab 1"
              fullWidth
            />
            <TextField
              label="Building (optional)"
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              placeholder="e.g., IT Building"
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as Room['type'] })
                }
              >
                <MenuItem value="Lecture">Lecture</MenuItem>
                <MenuItem value="Laboratory">Laboratory</MenuItem>
                <MenuItem value="Multi-purpose">Multi-purpose</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: parseInt(e.target.value || '0', 10) })
              }
              inputProps={{ min: 1 }}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {editingRoom ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Rooms;


