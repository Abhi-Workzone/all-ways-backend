import { AppError } from '../utils/errors.js';
export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
    return;
  }
  console.error('❌ Unexpected error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};