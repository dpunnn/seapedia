import { Response } from 'express';

export const successResponse = (
  res: Response,
  data: unknown,
  message = 'Success',
  statusCode = 200
) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown
) => {
  return res.status(statusCode).json({ success: false, message, errors });
};
