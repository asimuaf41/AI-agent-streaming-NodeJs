import { Router } from 'express';
import {
  chatStreamController,
  chatToolStreamController
} from '../controllers/chat.controller.js';
import { weatherStreamController } from '../controllers/weather.controller.js';
import { webSearchStreamController } from '../controllers/webSearch.controller.js';

const router = Router();

router.post('/chat', chatStreamController);
router.post('/chat/tool', chatToolStreamController);
router.post('/chat/weather', weatherStreamController);
router.post('/chat/web-search', webSearchStreamController);

export { router as chatRouter };
