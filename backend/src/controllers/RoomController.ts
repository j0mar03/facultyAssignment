import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Room } from '../entities/Room';

export class RoomController {
  private roomRepo = AppDataSource.getRepository(Room);

  // Get all rooms (optionally filter by isActive)
  getAllRooms = async (req: Request, res: Response) => {
    try {
      const { includeInactive } = req.query;

      const where: any = {};
      if (!includeInactive || includeInactive === 'false') {
        where.isActive = true;
      }

      const rooms = await this.roomRepo.find({
        where,
        order: { code: 'ASC' },
      });

      res.json(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      res.status(500).json({ error: 'Failed to fetch rooms' });
    }
  };

  // Get single room
  getRoomById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const room = await this.roomRepo.findOne({ where: { id } });

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      res.json(room);
    } catch (error) {
      console.error('Error fetching room:', error);
      res.status(500).json({ error: 'Failed to fetch room' });
    }
  };

  // Create room
  createRoom = async (req: Request, res: Response) => {
    try {
      const { code, name, building, type, capacity } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Room code is required' });
      }

      const existing = await this.roomRepo.findOne({ where: { code } });
      if (existing) {
        return res.status(400).json({ error: 'Room code already exists' });
      }

      const room = this.roomRepo.create({
        code: code.trim(),
        name: name?.trim() || null,
        building: building?.trim() || null,
        type: type || 'Lecture',
        capacity: capacity ?? 40,
        isActive: true,
      });

      const saved = await this.roomRepo.save(room);
      res.status(201).json(saved);
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({ error: 'Failed to create room' });
    }
  };

  // Update room
  updateRoom = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { code, name, building, type, capacity, isActive } = req.body;

      const room = await this.roomRepo.findOne({ where: { id } });
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      if (code && code !== room.code) {
        const existing = await this.roomRepo.findOne({ where: { code } });
        if (existing) {
          return res.status(400).json({ error: 'Room code already exists' });
        }
        room.code = code.trim();
      }

      if (name !== undefined) room.name = name?.trim() || null;
      if (building !== undefined) room.building = building?.trim() || null;
      if (type !== undefined) room.type = type;
      if (capacity !== undefined) room.capacity = capacity;
      if (isActive !== undefined) room.isActive = isActive;

      const saved = await this.roomRepo.save(room);
      res.json(saved);
    } catch (error) {
      console.error('Error updating room:', error);
      res.status(500).json({ error: 'Failed to update room' });
    }
  };

  // Soft-delete / deactivate room
  deleteRoom = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const room = await this.roomRepo.findOne({ where: { id } });

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      room.isActive = false;
      await this.roomRepo.save(room);

      res.json({ message: 'Room deactivated successfully' });
    } catch (error) {
      console.error('Error deleting room:', error);
      res.status(500).json({ error: 'Failed to delete room' });
    }
  };
}


