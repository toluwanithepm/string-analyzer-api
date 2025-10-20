/**
 * Natural Language Parser for converting plain English queries to filters
 */
class NLPParser {
  /**
   * Parse natural language query and extract filters
   */
  static parse(query) {
    const lowerQuery = query.toLowerCase();
    const filters = {};

    // Check for palindrome keywords
    if (lowerQuery.includes('palindrome') || lowerQuery.includes('palindromic')) {
      filters.is_palindrome = true;
    }

    // Check for word count
    const singleWordPatterns = ['single word', 'one word', '1 word'];
    if (singleWordPatterns.some(pattern => lowerQuery.includes(pattern))) {
      filters.word_count = 1;
    }

    const twoWordPatterns = ['two word', '2 word'];
    if (twoWordPatterns.some(pattern => lowerQuery.includes(pattern))) {
      filters.word_count = 2;
    }

    const threeWordPatterns = ['three word', '3 word'];
    if (threeWordPatterns.some(pattern => lowerQuery.includes(pattern))) {
      filters.word_count = 3;
    }

    // Check for length constraints
    const longerThanMatch = lowerQuery.match(/longer than (\d+)/);
    if (longerThanMatch) {
      filters.min_length = parseInt(longerThanMatch[1]) + 1;
    }

    const shorterThanMatch = lowerQuery.match(/shorter than (\d+)/);
    if (shorterThanMatch) {
      filters.max_length = parseInt(shorterThanMatch[1]) - 1;
    }

    const atLeastMatch = lowerQuery.match(/at least (\d+) character/);
    if (atLeastMatch) {
      filters.min_length = parseInt(atLeastMatch[1]);
    }

    const atMostMatch = lowerQuery.match(/at most (\d+) character/);
    if (atMostMatch) {
      filters.max_length = parseInt(atMostMatch[1]);
    }

    const exactLengthMatch = lowerQuery.match(/exactly (\d+) character/);
    if (exactLengthMatch) {
      const exactLength = parseInt(exactLengthMatch[1]);
      filters.min_length = exactLength;
      filters.max_length = exactLength;
    }

    // Check for character contains
    const letterMatch = lowerQuery.match(/(?:containing|contains|with) (?:the )?letter ([a-z])/);
    if (letterMatch) {
      filters.contains_character = letterMatch[1];
    }

    const characterMatch = lowerQuery.match(/(?:containing|contains|with) (?:the )?character ([a-z])/);
    if (characterMatch) {
      filters.contains_character = characterMatch[1];
    }

    // Special case for vowels
    if (lowerQuery.includes('first vowel')) {
      filters.contains_character = 'a';
    } else if (lowerQuery.includes('second vowel')) {
      filters.contains_character = 'e';
    } else if (lowerQuery.includes('third vowel')) {
      filters.contains_character = 'i';
    } else if (lowerQuery.includes('fourth vowel')) {
      filters.contains_character = 'o';
    } else if (lowerQuery.includes('fifth vowel')) {
      filters.contains_character = 'u';
    }

    // Check for conflicting filters
    if (filters.min_length && filters.max_length && filters.min_length > filters.max_length) {
      throw new Error('Conflicting length filters: min_length cannot be greater than max_length');
    }

    return filters;
  }

  /**
   * Validate that the parsed query has at least some filters
   */
  static validate(filters) {
    if (Object.keys(filters).length === 0) {
      throw new Error('Unable to parse natural language query into valid filters');
    }
    return true;
  }
}

module.exports = NLPParser;