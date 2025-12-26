import api from './api';

export interface Room {
  id: string;
  code: string;
  name?: string;
  building?: string;
  type: 'Lecture' | 'Laboratory' | 'Multi-purpose' | 'Other';
  capacity: number;
  isActive: boolean;
}

class RoomService {
  async getAllRooms(includeInactive = false): Promise<Room[]> {
    const params = new URLSearchParams();
    if (includeInactive) {
      params.append('includeInactive', 'true');
    }
    const response = await api.get(`/rooms?${params.toString()}`);
    return response.data;
  }

  async createRoom(data: Partial<Room>): Promise<Room> {
    const response = await api.post('/rooms', data);
    return response.data;
  }

  async updateRoom(id: string, data: Partial<Room>): Promise<Room> {
    const response = await api.put(`/rooms/${id}`, data);
    return response.data;
  }

  async deleteRoom(id: string): Promise<void> {
    await api.delete(`/rooms/${id}`);
  }
}

export const roomService = new RoomService();


