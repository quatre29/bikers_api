import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import apiRouter from "./routes/apiRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.use("/", (_, res: Response) => {
  res.status(200).send({ msg: "Api documentation" });
});

app.use("*", (_, res: Response) => {
  res.status(404).send({ msg: "Path not found" });
});

export default app;
