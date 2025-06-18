import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

export class AuthController {
  private userRepo = AppDataSource.getRepository(User);

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Find user in database
      const user = await this.userRepo.findOne({ where: { email, isActive: true } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'secret-key',
        { expiresIn: '7d' }
      );
      
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          department: user.department,
          college: user.college,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      // Implementation for user registration
      res.status(501).json({ error: 'Registration not implemented' });
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      // Implementation for token refresh
      res.status(501).json({ error: 'Token refresh not implemented' });
    } catch (error) {
      res.status(500).json({ error: 'Token refresh failed' });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      // Implementation for logout
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Logout failed' });
    }
  };
}