export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode ?? 500;
  let message = error.message ?? "Internal server error";
  let details = error.details ?? null;

  // Mongoose Duplicate Key Error
  if (error.code === 11000) {
    statusCode = 409;
    message = "A record with the provided unique value already exists.";
  }

  // Mongoose Validation Error
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors).map(val => val.message).join(", ");
  }

  // Mongoose Cast Error (Invalid ID)
  if (error.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${error.path}: ${error.value}`;
  }

  if (error instanceof SyntaxError && error.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON payload.";
  }

  const payload = {
    success: false,
    message,
  };

  if (details) {
    payload.details = details;
  }

  if (statusCode >= 500 && process.env.NODE_ENV !== "production") {
    payload.stack = error.stack;
  }

  return res.status(statusCode).json(payload);
}
