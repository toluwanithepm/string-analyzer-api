const crypto = require('crypto');

/**
 * Analyzes a string and returns all computed properties
 */
class StringAnalyzer {
  /**
   * Calculate the length of the string
   */
  static calculateLength(str) {
    return str.length;
  }

  /**
   * Check if string is a palindrome (case-insensitive)
   */
  static isPalindrome(str) {
    const cleaned = str.toLowerCase().replace(/\s/g, '');
    return cleaned === cleaned.split('').reverse().join('');
  }

  /**
   * Count unique characters in the string
   */
  static countUniqueCharacters(str) {
    return new Set(str).size;
  }

  /**
   * Count words separated by whitespace
   */
  static countWords(str) {
    const trimmed = str.trim();
    if (trimmed === '') return 0;
    return trimmed.split(/\s+/).length;
  }

  /**
   * Generate SHA-256 hash of the string
   */
  static generateSHA256(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  /**
   * Create character frequency map
   */
  static createCharacterFrequencyMap(str) {
    const frequencyMap = {};
    for (const char of str) {
      frequencyMap[char] = (frequencyMap[char] || 0) + 1;
    }
    return frequencyMap;
  }

  /**
   * Analyze string and return all properties
   */
  static analyze(str) {
    const sha256Hash = this.generateSHA256(str);
    
    return {
      id: sha256Hash,
      value: str,
      properties: {
        length: this.calculateLength(str),
        is_palindrome: this.isPalindrome(str),
        unique_characters: this.countUniqueCharacters(str),
        word_count: this.countWords(str),
        sha256_hash: sha256Hash,
        character_frequency_map: this.createCharacterFrequencyMap(str)
      },
      created_at: new Date().toISOString()
    };
  }
}

module.exports = StringAnalyzer;