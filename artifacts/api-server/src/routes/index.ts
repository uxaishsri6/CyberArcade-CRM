import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactsRouter from "./contacts";
import segmentsRouter from "./segments";
import campaignsRouter from "./campaigns";
import dashboardRouter from "./dashboard";
import conversionsRouter from "./conversions";
import searchRouter from "./search";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/contacts", contactsRouter);
router.use("/segments", segmentsRouter);
router.use("/campaigns", campaignsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/conversions", conversionsRouter);
router.use("/search", searchRouter);

export default router;
