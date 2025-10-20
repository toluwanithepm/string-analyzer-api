/**
 * Middleware for validating requests
 */

/**
 * Validate POST /strings request body
 */
const validateCreateString = (req, res, next) => {
  const { value } = req.body;

  // Check if 'value' field exists
  if (value === undefined) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Missing required field: value'
    });
  }

  // Check if 'value' is a string
  if (typeof value !== 'string') {
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: 'Invalid data type for "value" (must be string)'
    });
  }

  next();
};

/**
 * Validate query parameters for GET /strings
 */
const validateQueryFilters = (req, res, next) => {
  const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;

  try {
    // Validate is_palindrome (should be boolean)
    if (is_palindrome !== undefined) {
      if (is_palindrome !== 'true' && is_palindrome !== 'false') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid value for is_palindrome. Must be true or false'
        });
      }
    }

    // Validate min_length (should be positive integer)
    if (min_length !== undefined) {
      const minLengthNum = parseInt(min_length);
      if (isNaN(minLengthNum) || minLengthNum < 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid value for min_length. Must be a non-negative integer'
        });
      }
    }

    // Validate max_length (should be positive integer)
    if (max_length !== undefined) {
      const maxLengthNum = parseInt(max_length);
      if (isNaN(maxLengthNum) || maxLengthNum < 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid value for max_length. Must be a non-negative integer'
        });
      }
    }

    // Validate word_count (should be positive integer)
    if (word_count !== undefined) {
      const wordCountNum = parseInt(word_count);
      if (isNaN(wordCountNum) || wordCountNum < 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid value for word_count. Must be a non-negative integer'
        });
      }
    }

    // Validate contains_character (should be single character)
    if (contains_character !== undefined) {
      if (typeof contains_character !== 'string' || contains_character.length !== 1) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid value for contains_character. Must be a single character'
        });
      }
    }

    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid query parameter values or types'
    });
  }
};

/**
 * Validate natural language query
 */
const validateNLQuery = (req, res, next) => {
  const { query } = req.query;

  if (!query || typeof query !== 'string' || query.trim() === '') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Missing or invalid query parameter'
    });
  }

  next();
};

module.exports = {
  validateCreateString,
  validateQueryFilters,
  validateNLQuery
};