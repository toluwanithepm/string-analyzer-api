const crypto = require('crypto');

const MAX_LENGTH = parseInt(process.env.MAX_STRING_LENGTH || '10000', 10);

function generateSha256(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function calculateLength(value) {
  return [...value].length; // counts codepoints (includes spaces)
}

function isPalindrome(value) {
  // ignore case and spaces for palindrome check (documented behaviour)
  const cleaned = value.toLowerCase().replace(/\s+/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}

function countUniqueCharacters(value) {
  // Exclude spaces from unique character count
  const set = new Set([...value.replace(/\s+/g, '')]);
  return set.size;
}

function countWords(value) {
  if (!value.trim()) return 0;
  return value.trim().split(/\s+/).length;
}

function characterFrequencyMap(value) {
  const freq = {};
  for (const ch of value) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  return freq;
}

function analyzeString(value) {
  if (typeof value !== 'string') throw new TypeError('value must be string');
  if (value.length > MAX_LENGTH) throw new Error(`value exceeds max length ${MAX_LENGTH}`);

  const sha256_hash = generateSha256(value);
  const length = calculateLength(value);
  const palindrome = isPalindrome(value);
  const unique_characters = countUniqueCharacters(value);
  const word_count = countWords(value);
  const character_frequency_map = characterFrequencyMap(value);

  return {
    id: sha256_hash,
    value,
    properties: {
      length,
      is_palindrome: palindrome,
      unique_characters,
      word_count,
      sha256_hash,
      character_frequency_map
    }
  };
}

module.exports = { analyzeString, generateSha256 };
