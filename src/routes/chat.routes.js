import { Router } from 'express';
import {
  chatStreamController,
  chatToolStreamController
} from '../controllers/chat.controller.js';
import { weatherStreamController } from '../controllers/weather.controller.js';

const router = Router();

router.post('/chat', chatStreamController);
router.post('/chat/tool', chatToolStreamController);
router.post('/chat/weather', weatherStreamController);

export { router as chatRouter };
