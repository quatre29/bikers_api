import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import apiRouter from "./routes/apiRoutes";
import * as dotenv from "dotenv";
import globalErrorHandler from "./errors/globalErrorHandler";
import AppError from "./errors/AppError";

dotenv.config();

const app = express();

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
console.log(process.env.NODE_ENV, "/app.ts");

app.use(express.json());

app.use("/api", apiRouter);

app.use("/", (_, res: Response) => {
  res.status(200).send({ msg: "Api documentation" });
});

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
