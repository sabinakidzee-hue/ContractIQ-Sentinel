'use strict';
const { validationResult } = require('express-validator');

/**
 * Runs express-validator checks and returns a 422 response
 * if any validation errors are present.
 *
 * Usage — place after the validator chains in a route:
 *   router.post('/path', [body('field').notEmpty()], validate, controller);
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        details: errors.array().map((e) => ({
          field:   e.path ?? e.param,
          message: e.msg,
          value:   e.value,
        })),
      },
    });
  }
  next();
}

module.exports = validate;
