import { Router, type IRouter } from "express";
import healthRouter from "./health";
import playersRouter from "./players";
import gamemodesRouter from "./gamemodes";
import adminRouter from "./admin";
import backupRouter from "./backup";

const router: IRouter = Router();

router.use(healthRouter);
router.use(playersRouter);
router.use(gamemodesRouter);
router.use(adminRouter);
router.use(backupRouter);

export default router;
