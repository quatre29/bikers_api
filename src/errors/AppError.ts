class AppError extends Error {
  status: string;
  statusCode: number;
  message: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.statusCode = statusCode;
    this.message = message;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
