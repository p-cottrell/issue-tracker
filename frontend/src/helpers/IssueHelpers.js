const seedrandom = require('seedrandom');

/**
 * Generate a "nice" reference ID in the format of "ABC-1234"
 * @param {Object} data - The data object to generate the reference ID from
 * @returns {String} - The generated reference ID
 * @example
 * const data = { _id: '5f3f8d3b4f2d8b1f4c3f8d3b' };
 * const niceReferenceId = generateNiceReferenceId(data);
 * console.log(niceReferenceId); // "ABC-1234"
 */
export function generateNiceReferenceId(data) {
    // use seeded rng to get three random letters, then four random numbers
    let id = data._id || data;
    const rng = seedrandom(id);
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const randomLetter = () => letters[Math.floor(rng() * letters.length)];
    const randomNumber = () => numbers[Math.floor(rng() * numbers.length)];
    const niceReferenceId = `${randomLetter()}${randomLetter()}${randomLetter()}-${randomNumber()}${randomNumber()}${randomNumber()}${randomNumber()}`;
    return niceReferenceId;
}

export const charmOptions = [
    '⚠️', '🚀', '🐞', '💻', '📅', '🌐', '🏆', '🏠', '🐈', '🐕', '⏱️', '🎵',
    '⭐', '🔎', '📸', '💾', '❤️', '🎬', '📖', '🎂', '🖥️', '🔥', '🎫', '🔧',
    '🚫', '💥', '🎓', '📚'
];