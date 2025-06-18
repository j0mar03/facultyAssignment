import { Router } from 'express';
import { ScheduleController } from '../controllers/ScheduleController';

const router = Router();
const controller = new ScheduleController();

router.get('/calendar', controller.getCalendar);
router.post('/generate', controller.generateSchedule);
router.get('/conflicts', controller.checkConflicts);
router.post('/optimize', controller.optimizeSchedule);
router.get('/faculty/:facultyId/calendar', controller.getFacultyCalendar);
router.get('/room/:room/calendar', controller.getRoomCalendar);

export default router;