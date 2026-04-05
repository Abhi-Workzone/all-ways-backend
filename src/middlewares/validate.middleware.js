import { z } from 'zod';
export const validate = schema => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
        return;
      }
      next(error);
    }
  };
};