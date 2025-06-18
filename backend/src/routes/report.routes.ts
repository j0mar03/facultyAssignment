import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';

const router = Router();
const controller = new ReportController();

router.get('/dashboard', controller.getDashboardData);
router.get('/load-distribution', controller.getLoadDistribution);
router.get('/compliance', controller.getComplianceReport);
router.get('/itees-summary', controller.getITEESSummary);
router.get('/night-classes', controller.getNightClassesReport);
router.get('/department/:department/summary', controller.getDepartmentSummary);
router.get('/export/monitoring-sheet', controller.exportMonitoringSheet);

export default router;