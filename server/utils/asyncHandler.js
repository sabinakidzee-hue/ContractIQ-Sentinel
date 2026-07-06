'use strict';

/**
 * Wraps an async route handler so unhandled rejections are forwarded
 * to Express's next(err) error handler automatically.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => { … }));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
