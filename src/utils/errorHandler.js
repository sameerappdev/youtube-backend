import { ApiError } from "./ApiError.js";

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  } else {
    console.error(err); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export { errorHandler };