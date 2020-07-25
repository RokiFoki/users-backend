import HTTP from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

export interface Token {
    userId: number;
    username: string;
}

export function credentials(req: Request, res: Response, next: NextFunction) {
    if (req.cookies["token"]) {
        try {
            req.credentials = jwt.verify(req.cookies["token"], config.secret) as Token | undefined;
        } catch { }
    }
    
    next();
};

export function authenticate(req: Request, res: Response, next: NextFunction) {
    if (req.credentials && req.credentials.userId) {
        next();
        return;
    }

    res.status(HTTP.UNAUTHORIZED).send("Please login first.");
}