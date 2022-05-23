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
const cookieOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionsSuccessStatus: 200,
};

app.use(cors(cookieOptions));
app.use(express.json({ limit: "40mb" }));
app.use(cookieParser());

//Data sanitization for XSS and parameter pollution

//TODO: sanitize-html | DOMPurify ---- remove xss-clean(old)
// app.use(xss());
app.use(
  hpp({
    whitelist: ["tag"], //whitelist parameters allowed for duplication
  })
);

app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// app.use(function (req: Request, res: Response, next: NextFunction) {
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // Update to match the domain you will make the request from
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

app.use("/api", apiRouter);

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
