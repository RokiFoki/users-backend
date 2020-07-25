import express from 'express';
import asyncHandler from 'express-async-handler';
import db from '../database';
import { UsersController } from './controllers/users';

const usersController = new UsersController(db);

const router = express.Router();

router.get('', asyncHandler(async (req, res) => {
    const result = await usersController.getMostLiked();

    res.send(result);
}));

export default router;