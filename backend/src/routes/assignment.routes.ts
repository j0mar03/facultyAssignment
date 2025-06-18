import { Router } from 'express';
import { AssignmentController } from '../controllers/AssignmentController';

const router = Router();
const controller = new AssignmentController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.post('/:id/approve', controller.approve);
router.get('/faculty/:facultyId', controller.getByFaculty);
router.get('/course/:courseId', controller.getByCourse);
router.post('/validate', controller.validateAssignment);

export default router;