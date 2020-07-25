import express from 'express';
import authRouter from './authentication';
import meRouter from './me';
import usersRouter from './users';
import mostLikedRouter from './most-liked';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/me', meRouter);
router.use('/user', usersRouter);
router.use('/most-liked', mostLikedRouter);

router.all('/*', (req, res) => {
    res.status(404).send("Unknown api");
})

export default router;