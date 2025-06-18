import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Faculty } from '../entities/Faculty';
import { ITEESRecord } from '../entities/ITEESRecord';
import { Assignment } from '../entities/Assignment';

export class FacultyController {
  private facultyRepo = AppDataSource.getRepository(Faculty);
  private iteesRepo = AppDataSource.getRepository(ITEESRecord);
  private assignmentRepo = AppDataSource.getRepository(Assignment);

  getAll = async (req: Request, res: Response) => {
    try {
      const faculty = await this.facultyRepo.find({
        relations: ['iteesHistory'],
        order: { lastName: 'ASC', firstName: 'ASC' },
      });
      res.json(faculty);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch faculty' });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const faculty = await this.facultyRepo.findOne({
        where: { id: req.params.id },
        relations: ['iteesHistory', 'assignments'],
      });
      
      if (!faculty) {
        return res.status(404).json({ error: 'Faculty not found' });
      }
      
      res.json(faculty);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch faculty' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const faculty = this.facultyRepo.create(req.body);
      const saved = await this.facultyRepo.save(faculty);
      res.status(201).json(saved);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create faculty' });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const result = await this.facultyRepo.update(req.params.id, req.body);
      if (result.affected === 0) {
        return res.status(404).json({ error: 'Faculty not found' });
      }
      const updated = await this.facultyRepo.findOne({ where: { id: req.params.id } });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update faculty' });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const result = await this.facultyRepo.delete(req.params.id);
      if (result.affected === 0) {
        return res.status(404).json({ error: 'Faculty not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Failed to delete faculty' });
    }
  };

  getLoadSummary = async (req: Request, res: Response) => {
    try {
      const faculty = await this.facultyRepo.findOne({
        where: { id: req.params.id },
        relations: ['assignments', 'assignments.course'],
      });

      if (!faculty) {
        return res.status(404).json({ error: 'Faculty not found' });
      }

      const currentAssignments = faculty.assignments.filter(
        a => a.status === 'Active' || a.status === 'Approved'
      );

      const summary = {
        facultyId: faculty.id,
        name: faculty.fullName,
        regularLoad: currentAssignments
          .filter(a => a.type === 'Regular')
          .reduce((sum, a) => sum + a.creditHours, 0),
        extraLoad: currentAssignments
          .filter(a => a.type === 'Extra')
          .reduce((sum, a) => sum + a.creditHours, 0),
        assignments: currentAssignments.map(a => ({
          courseCode: a.course.code,
          courseName: a.course.name,
          type: a.type,
          creditHours: a.creditHours,
          timeSlot: a.timeSlot,
        })),
      };

      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch load summary' });
    }
  };

  getITEESHistory = async (req: Request, res: Response) => {
    try {
      const history = await this.iteesRepo.find({
        where: { facultyId: req.params.id },
        order: { createdAt: 'DESC' },
      });
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch ITEES history' });
    }
  };

  addITEESRecord = async (req: Request, res: Response) => {
    try {
      const record = this.iteesRepo.create({
        ...req.body,
        facultyId: req.params.id,
      });
      const saved = await this.iteesRepo.save(record);

      // Update consecutive low ratings count
      await this.updateConsecutiveLowRatings(req.params.id);

      res.status(201).json(saved);
    } catch (error) {
      res.status(400).json({ error: 'Failed to add ITEES record' });
    }
  };

  private async updateConsecutiveLowRatings(facultyId: string) {
    const history = await this.iteesRepo.find({
      where: { facultyId },
      order: { createdAt: 'DESC' },
      take: 2,
    });

    const lowRatings = ['Satisfactory', 'Fair', 'Poor'];
    const consecutiveLow = history.filter(r => lowRatings.includes(r.rating)).length;

    await this.facultyRepo.update(facultyId, {
      consecutiveLowRatings: consecutiveLow === 2 ? 2 : 0,
    });
  }
}