'use strict';

/**
 * Standardised JSON response helpers.
 * Every API response follows the same envelope:
 *
 *  Success:  { success: true,  data: <payload>, message?: string }
 *  Error:    { success: false, error: { code, message, details? } }
 */

const success = (res, data = null, message = 'OK', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data = null, message = 'Resource created') =>
  success(res, data, message, 201);

const error = (res, message = 'Internal server error', statusCode = 500, code = 'INTERNAL_ERROR', details = null) =>
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  });

const badRequest = (res, message = 'Bad request', details = null) =>
  error(res, message, 400, 'BAD_REQUEST', details);

const notFound = (res, message = 'Resource not found') =>
  error(res, message, 404, 'NOT_FOUND');

const conflict = (res, message = 'Conflict') =>
  error(res, message, 409, 'CONFLICT');

const unprocessable = (res, message = 'Unprocessable entity', details = null) =>
  error(res, message, 422, 'UNPROCESSABLE', details);

module.exports = { success, created, error, badRequest, notFound, conflict, unprocessable };
