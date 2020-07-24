import express from 'express';
import authRouter from './authentication';

const router = express.Router();

router.use('/auth', authRouter);

router.all('/*', (req, res) => {
    console.log('was here');
    res.status(404).send();
})

export default router;