import express from 'express';
import { likeEvent } from '../controllers/likeController.js';

const router = express.Router();

router.post('/', likeEvent);

export default router;