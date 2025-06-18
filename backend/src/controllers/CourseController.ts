import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Course } from '../entities/Course';

export class CourseController {
  private courseRepo = AppDataSource.getRepository(Course);

  getAll = async (req: Request, res: Response) => {
    try {
      const courses = await this.courseRepo.find();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const course = await this.courseRepo.findOne({
        where: { id: req.params.id },
      });
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch course' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const course = this.courseRepo.create(req.body);
      const saved = await this.courseRepo.save(course);
      res.status(201).json(saved);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create course' });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const result = await this.courseRepo.update(req.params.id, req.body);
      if (result.affected === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }
      const updated = await this.courseRepo.findOne({ where: { id: req.params.id } });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update course' });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const result = await this.courseRepo.delete(req.params.id);
      if (result.affected === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Failed to delete course' });
    }
  };

  getByDepartment = async (req: Request, res: Response) => {
    try {
      const courses = await this.courseRepo.find({
        where: { department: req.params.department },
      });
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch courses by department' });
    }
  };

  getBySemester = async (req: Request, res: Response) => {
    try {
      const courses = await this.courseRepo.find({
        where: {
          semester: req.params.semester,
          academicYear: req.params.year,
        },
      });
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch courses by semester' });
    }
  };
}