import { Router } from 'express';
import { RoomController } from '../controllers/RoomController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const roomController = new RoomController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /api/rooms - Get all rooms
router.get('/', roomController.getAllRooms);

// GET /api/rooms/:id - Get room by ID
router.get('/:id', roomController.getRoomById);

// POST /api/rooms - Create new room
router.post('/', roomController.createRoom);

// PUT /api/rooms/:id - Update room
router.put('/:id', roomController.updateRoom);

// DELETE /api/rooms/:id - Deactivate room
router.delete('/:id', roomController.deleteRoom);

export default router;


