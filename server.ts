import express from 'express'
import HTTP from 'http-status-codes';

import config from './config';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import apiRouter from './api/api';
import { credentials } from './middlewares/credentials';

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(credentials);
app.use('/api', apiRouter)

app.use(function (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    const response = {status: "Error occrued.", error: config.type !== 'production' ? err: undefined};
    
    console.error(err);
    res.status(HTTP.INTERNAL_SERVER_ERROR).send(response);
});

app.listen(config.PORT, function() {
    console.log(`Listening on port ${config.PORT}`);
})