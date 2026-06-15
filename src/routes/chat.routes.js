import { Router } from 'express';
import {
  chatStreamController,
  chatToolStreamController
} from '../controllers/chat.controller.js';
import { weatherStreamController } from '../controllers/weather.controller.js';

import {
  deleteMemoryController,
  getMemoriesController,
  webSearchStreamController
} from '../controllers/webSearch.controller.js';

const router = Router();

router.post('/chat', chatStreamController);
router.post('/chat/tool', chatToolStreamController);
router.post('/chat/weather', weatherStreamController);
router.post('/chat/web-search', webSearchStreamController);
router.get('/chat/web-search/memories', getMemoriesController);
router.delete('/chat/web-search/memories/:id', deleteMemoryController);

export { router as chatRouter };

