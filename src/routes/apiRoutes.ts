import express from "express";
import usersRouter from "./users.routes";
import authRouter from "./auth.routes";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);

export default apiRouter;
