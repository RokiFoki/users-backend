import express from 'express';
import asyncHandler from 'express-async-handler';
import db from '../database';
import { UsersController } from './controllers/users';

const usersController = new UsersController(db);

const router = express.Router();

router.get('', asyncHandler(async (req, res) => {
    const take = req.query.take ? +req.query.take : undefined;
    const page = req.query.page ? +req.query.page : undefined;;

    const result = await usersController.getMostLiked(take, page);

    res.send(result);
}));

export default router;