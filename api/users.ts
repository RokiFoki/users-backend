import express from 'express';
import asyncHandler from 'express-async-handler';
import HTTP from 'http-status-codes';
import db from '../database';
import { UsersController } from './controllers/users';
import { authenticate } from '../middlewares/credentials';

const controller = new UsersController(db);

const router = express.Router();

router.get('/:id', asyncHandler(async (req, res) => {
    const userId = +req.params.id;

    const response = await controller.get(userId);

    if (!response.success) {
        if (response.status) {
            res.status(response.status);
        } else {
            res.status(HTTP.BAD_REQUEST);        
        }
    }

    res.send(response);
}));


router.post('/:id/like', authenticate, asyncHandler(async (req, res) => {
    const userId = req.credentials?.userId;
    const userToLike = +req.params.id;

    const response = await controller.addLike(userId, userToLike);

    if (!response.success) {
        res.status(HTTP.BAD_REQUEST);        
    }

    res.send(response);
}));

router.delete('/:id/like', authenticate, asyncHandler(async (req, res) => {
    const userId = req.credentials?.userId;
    const userToLike = +req.params.id;

    const response = await controller.deleteLike(userId, userToLike);
    
    if (!response.success) {
        res.status(HTTP.BAD_REQUEST);        
    }

    res.send(response);
}));

export default router;