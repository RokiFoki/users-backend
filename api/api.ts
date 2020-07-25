import express from 'express';
import authRouter from './authentication';
import meRouter from './me';
import usersRouter from './users';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/me', meRouter);
router.use('/user', usersRouter);

router.all('/*', (req, res) => {
    res.status(404).send();
})

export default router;