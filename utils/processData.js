function processData(data) {
  const even_numbers = [];
  const odd_numbers = [];
  const alphabets = [];
  const special_characters = [];
  let sum = 0;
  let alphaConcat = '';

  data.forEach(item => {
    if (typeof item !== 'string') return;

    if (/^-?\d+$/.test(item)) {
      const num = Number(item);
      if (num % 2 === 0) {
        even_numbers.push(item);
      } else {
        odd_numbers.push(item);
      }
      sum += num;
    } 
    else if (/^[a-zA-Z]+$/.test(item)) {
      alphabets.push(item.toUpperCase());
      alphaConcat += item;
    } 
    else {
      for (const char of item) {
        if (!/[a-zA-Z0-9]/.test(char)) {
          special_characters.push(char);
        }
      }
    }
  });

  let concat_string = '';
  const reversedChars = alphaConcat.split('').reverse();
  for (let i = 0; i < reversedChars.length; i++) {
    concat_string += i % 2 === 0 ? reversedChars[i].toUpperCase() : reversedChars[i].toLowerCase();
  }

  return {
    even_numbers,
    odd_numbers,
    alphabets,
    special_characters,
    sum: sum.toString(),
    concat_string
  };
}

module.exports = processData;
