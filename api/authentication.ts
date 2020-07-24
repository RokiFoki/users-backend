import express from 'express';
import asyncHandler from 'express-async-handler';
import HTTP from 'http-status-codes';
import jwt from 'jsonwebtoken';
import config from '../config';
import db from '../database';

import { AuthenticationController } from './controllers/authentication';

const controller = new AuthenticationController(db);

const router = express.Router();

router.post('/signup', asyncHandler(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const response = await controller.tryRegister(username, password);

    if (response.token) {
        res.cookie('token', jwt.sign(response.token, config.secret), { httpOnly: true });
    }

    if (!response.success) {
        res.status(HTTP.BAD_REQUEST);
    }

    res.send(response); 
}));

router.post('/login', asyncHandler(async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const response = await controller.tryLogin(username, password);
    if (response.token) {
        const options = { httpOnly: true };

        res.cookie('token', jwt.sign(response.token, config.secret), options);
    }

    if (!response.success) {
        res.status(HTTP.BAD_REQUEST);
    }
    
    res.send(response);
}));

export default router;