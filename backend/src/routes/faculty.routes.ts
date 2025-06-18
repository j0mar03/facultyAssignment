import { Router } from 'express';
import { FacultyController } from '../controllers/FacultyController';

const router = Router();
const controller = new FacultyController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.get('/:id/load-summary', controller.getLoadSummary);
router.get('/:id/itees-history', controller.getITEESHistory);
router.post('/:id/itees-record', controller.addITEESRecord);

export default router;