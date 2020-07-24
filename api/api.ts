import express from 'express';
import authRouter from './authentication';
import meRouter from './me';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/me', meRouter);

router.all('/*', (req, res) => {
    res.status(404).send();
})

export default router;