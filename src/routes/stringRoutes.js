const express = require('express');
const router = express.Router();
const stringController = require('../controllers/stringController');
const { 
  validateCreateString, 
  validateQueryFilters, 
  validateNLQuery 
} = require('../middleware/validator');

/**
 * String Routes
 */

// Natural language filtering (must come before /:string_value to avoid route conflict)
router.get(
  '/filter-by-natural-language',
  validateNLQuery,
  stringController.filterByNaturalLanguage
);

// Get all strings with optional filtering
router.get(
  '/',
  validateQueryFilters,
  stringController.getAllStrings
);

// Create/Analyze a new string
router.post(
  '/',
  validateCreateString,
  stringController.createString
);

// Get a specific string by value
router.get(
  '/:string_value',
  stringController.getStringByValue
);

// Delete a string by value
router.delete(
  '/:string_value',
  stringController.deleteString
);

module.exports = router;