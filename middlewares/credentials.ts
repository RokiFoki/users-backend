import HTTP from 'http-status-codes';
import express from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

export interface Token {
    userId: number;
    username: string;
}

export function credentials(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.cookies["token"])
        req.credentials = jwt.verify(req.cookies["token"], config.secret) as Token | undefined;
    
    next();
};