import { Router } from 'express';
import { SectionController } from '../controllers/SectionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const sectionController = new SectionController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /api/sections - Get all sections with filters
router.get('/', sectionController.getAllSections);

// GET /api/sections/overview - Get sections overview for chairperson
router.get('/overview', sectionController.getSectionsOverview);

// GET /api/sections/:id - Get section by ID
router.get('/:id', sectionController.getSectionById);

// POST /api/sections - Create new section
router.post('/', sectionController.createSection);

// PUT /api/sections/:id - Update section
router.put('/:id', sectionController.updateSection);

// DELETE /api/sections/:id - Delete section
router.delete('/:id', sectionController.deleteSection);

// POST /api/sections/:id/assign-faculty - Assign faculty to section
router.post('/:sectionId/assign-faculty', sectionController.assignFacultyToSection);

// POST /api/sections/:id/unassign-faculty - Unassign faculty from section
router.post('/:sectionId/unassign-faculty', sectionController.unassignFacultyFromSection);

export default router;