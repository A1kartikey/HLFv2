/**
 * It generates a random integer between 10^(length-1) and 10^length - 1.
 * @param { number } length - The length of the number you want to generate.
 * @returns A random number between 10^(length-1) and 10^(length) - 1
 */
const randomFixedInteger = (length = 7) => {
    return Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1));
}

exports.randomFixedInteger = randomFixedInteger;