import express from 'express';
import asyncHandler from 'express-async-handler';
import HTTP from 'http-status-codes';
import db from '../database';
import { AuthenticationController } from './controllers/authentication';

const authController = new AuthenticationController(db);

const router = express.Router();

router.get('', asyncHandler(async (req, res) => {
    res.send(req.credentials);
}));

router.patch('/update-password', asyncHandler(async (req, res) => {
    const userId = req.credentials?.userId;
    const password = req.body.password;

    const response = await authController.changePassword(userId, password);

    if (!response.success) {
        res.status(HTTP.BAD_REQUEST);
    }

    res.send(response);
}));

export default router;