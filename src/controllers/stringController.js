const supabase = require('../config/supabase');
const StringAnalyzer = require('../services/stringAnalyzer');
const NLPParser = require('../services/nlpParser');

/**
 * Controller for handling string-related operations
 */

/**
 * Create/Analyze a new string
 * POST /strings
 */
const createString = async (req, res, next) => {
  try {
    const { value } = req.body;

    // Analyze the string
    const analyzed = StringAnalyzer.analyze(value);

    // Check if string already exists
    const { data: existing, error: fetchError } = await supabase
      .from('strings')
      .select('*')
      .eq('id', analyzed.id)
      .single();

    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'String already exists in the system'
      });
    }

    // Insert into database
    const { data, error } = await supabase
      .from('strings')
      .insert([{
        id: analyzed.id,
        value: analyzed.value,
        length: analyzed.properties.length,
        is_palindrome: analyzed.properties.is_palindrome,
        unique_characters: analyzed.properties.unique_characters,
        word_count: analyzed.properties.word_count,
        sha256_hash: analyzed.properties.sha256_hash,
        character_frequency_map: analyzed.properties.character_frequency_map,
        created_at: analyzed.created_at
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to store string in database');
    }

    // Format response
    const response = {
      id: data.id,
      value: data.value,
      properties: {
        length: data.length,
        is_palindrome: data.is_palindrome,
        unique_characters: data.unique_characters,
        word_count: data.word_count,
        sha256_hash: data.sha256_hash,
        character_frequency_map: data.character_frequency_map
      },
      created_at: data.created_at
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific string by its value
 * GET /strings/:string_value
 */
const getStringByValue = async (req, res, next) => {
  try {
    const stringValue = decodeURIComponent(req.params.string_value);
    
    // TEMPORARY LOG: Check what value the server is searching for
    console.log('Attempting to fetch string:', stringValue);

    // Query database by value
    const { data, error } = await supabase
      .from('strings')
      .select('*')
      .eq('value', stringValue)
      .single();

    if (error || !data) {
      // Log the specific Supabase error if one occurred, otherwise assume Not Found.
      if (error) {
        console.error('Supabase fetch error (GET /strings/:value):', error);
      }
      return res.status(404).json({
        error: 'Not Found',
        message: 'String does not exist in the system'
      });
    }

    // Format response: This section correctly matches your required schema.
    const response = {
      id: data.id, // e.g., "sha256_hash_value"
      value: data.value, // e.g., "requested string"
      properties: { // Matches the nested properties object
        length: data.length,
        is_palindrome: data.is_palindrome,
        unique_characters: data.unique_characters,
        word_count: data.word_count,
        sha256_hash: data.sha256_hash,
        character_frequency_map: data.character_frequency_map
      },
      created_at: data.created_at // e.g., "2025-08-27T10:00:00Z"
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all strings with optional filtering
 * GET /strings
 */
const getAllStrings = async (req, res, next) => {
  try {
    const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;

    // Build query
    let query = supabase.from('strings').select('*');

    const appliedFilters = {};

    // Apply filters
    if (is_palindrome !== undefined) {
      const isPalindromeValue = is_palindrome === 'true';
      query = query.eq('is_palindrome', isPalindromeValue);
      appliedFilters.is_palindrome = isPalindromeValue;
    }

    if (min_length !== undefined) {
      const minLengthNum = parseInt(min_length);
      query = query.gte('length', minLengthNum);
      appliedFilters.min_length = minLengthNum;
    }

    if (max_length !== undefined) {
      const maxLengthNum = parseInt(max_length);
      query = query.lte('length', maxLengthNum);
      appliedFilters.max_length = maxLengthNum;
    }

    if (word_count !== undefined) {
      const wordCountNum = parseInt(word_count);
      query = query.eq('word_count', wordCountNum);
      appliedFilters.word_count = wordCountNum;
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      throw new Error('Failed to fetch strings from database');
    }

    // Filter for contains_character (client-side filtering due to JSONB complexity)
    let filteredData = data;
    if (contains_character !== undefined) {
      filteredData = data.filter(item => item.value.includes(contains_character));
      appliedFilters.contains_character = contains_character;
    }

    // Format response
    const formattedData = filteredData.map(item => ({
      id: item.id,
      value: item.value,
      properties: {
        length: item.length,
        is_palindrome: item.is_palindrome,
        unique_characters: item.unique_characters,
        word_count: item.word_count,
        sha256_hash: item.sha256_hash,
        character_frequency_map: item.character_frequency_map
      },
      created_at: item.created_at
    }));

    res.status(200).json({
      data: formattedData,
      count: formattedData.length,
      filters_applied: appliedFilters
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Filter strings by natural language query
 * GET /strings/filter-by-natural-language
 */
const filterByNaturalLanguage = async (req, res, next) => {
  try {
    const { query: nlQuery } = req.query;
    const originalQuery = nlQuery;

    // Parse natural language query
    let parsedFilters;
    try {
      parsedFilters = NLPParser.parse(nlQuery);
      NLPParser.validate(parsedFilters);
    } catch (parseError) {
      if (parseError.message.includes('Conflicting')) {
        return res.status(422).json({
          error: 'Unprocessable Entity',
          message: parseError.message
        });
      }
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Unable to parse natural language query'
      });
    }

    // Build database query based on parsed filters
    let query = supabase.from('strings').select('*');

    if (parsedFilters.is_palindrome !== undefined) {
      query = query.eq('is_palindrome', parsedFilters.is_palindrome);
    }

    if (parsedFilters.min_length !== undefined) {
      query = query.gte('length', parsedFilters.min_length);
    }

    if (parsedFilters.max_length !== undefined) {
      query = query.lte('length', parsedFilters.max_length);
    }

    if (parsedFilters.word_count !== undefined) {
      query = query.eq('word_count', parsedFilters.word_count);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      throw new Error('Failed to fetch strings from database');
    }

    // Filter for contains_character (client-side filtering)
    let filteredData = data;
    if (parsedFilters.contains_character !== undefined) {
      filteredData = data.filter(item => 
        item.value.toLowerCase().includes(parsedFilters.contains_character.toLowerCase())
      );
    }

    // Format response
    const formattedData = filteredData.map(item => ({
      id: item.id,
      value: item.value,
      properties: {
        length: item.length,
        is_palindrome: item.is_palindrome,
        unique_characters: item.unique_characters,
        word_count: item.word_count,
        sha256_hash: item.sha256_hash,
        character_frequency_map: item.character_frequency_map
      },
      created_at: item.created_at
    }));

    res.status(200).json({
      data: formattedData,
      count: formattedData.length,
      interpreted_query: {
        original: originalQuery,
        parsed_filters: parsedFilters
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a string by its value
 * DELETE /strings/:string_value
 */
const deleteString = async (req, res, next) => {
  try {
    const stringValue = decodeURIComponent(req.params.string_value);

    // Check if string exists first
    const { data: existing } = await supabase
      .from('strings')
      .select('id')
      .eq('value', stringValue)
      .single();

    if (!existing) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'String does not exist in the system'
      });
    }

    // Delete the string
    const { error } = await supabase
      .from('strings')
      .delete()
      .eq('value', stringValue);

    if (error) {
      throw new Error('Failed to delete string from database');
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createString,
  getStringByValue,
  getAllStrings,
  filterByNaturalLanguage,
  deleteString
};
