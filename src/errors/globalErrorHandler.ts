import { Request, Response, NextFunction } from "express";
import AppError from "./AppError";

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).send({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProduction = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).send({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);

    res.status(500).send({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const handleJWTError = () => {
  return new AppError("Invalid token. Please log in again", 401);
};

const handleJWTExpiredError = () => {
  return new AppError("Your token has expired. Please log in again", 401);
};

export default (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    let error = Object.assign(err);

    if (error.code === "22P02") error = new AppError(error.message, 400);
    if (error.code === "23505") {
      error = new AppError(error.message, 400);
    }
    if (error.code === "23503") {
      error = new AppError(error.message, 404);
    }

    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = Object.assign(err);

    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (error.code === "22P02") error = new AppError("Invalid input", 400);
    if (error.code === "23505") {
      error = new AppError(
        "You cannot have duplicate values in unique columns",
        400
      );
    }
    if (error.code === "23503") {
      error = new AppError("Properties referenced does not exist", 404);
    }

    sendErrorProduction(error, res);
  }
};
