declare namespace Express {
    export interface Request {
    credentials?: import('./middlewares/credentials').Token
    }
}