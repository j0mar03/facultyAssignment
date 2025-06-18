import { Router } from 'express';
import { CourseController } from '../controllers/CourseController';

const router = Router();
const controller = new CourseController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.get('/department/:department', controller.getByDepartment);
router.get('/semester/:semester/:year', controller.getBySemester);

export default router;