import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import apiRouter from "./routes/apiRoutes";
import globalErrorHandler from "./errors/globalErrorHandler";
import AppError from "./errors/AppError";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import "./config";

const app = express();

//300 req/h from the same ip
const limiter = rateLimit({
  max: 300,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again in an hour.",
});

//Http headers
app.use(helmet());
app.use("/api", limiter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//body parser
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

//Data sanitization for XSS and parameter pollution
app.use(xss());
app.use(
  hpp({
    whitelist: [], //whitelist parameters allowed for duplication
  })
);

app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

app.use("/api", apiRouter);

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
