import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const controller = new AuthController();

router.post('/login', controller.login);
router.post('/register', controller.register);
router.post('/refresh', controller.refreshToken);
router.post('/logout', controller.logout);

export default router;