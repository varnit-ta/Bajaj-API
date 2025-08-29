const request = require('supertest');
const express = require('express');

const bfhlRouter = express.Router();

bfhlRouter.post('/', (req, res) => {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ is_success: false, error: "Invalid input: 'data' must be an array." });
    }

    const even_numbers = [];
    const odd_numbers = [];
    const alphabets = [];
    const special_characters = [];
    let sum = 0;
    let alpha_chars = '';

    try {
        data.forEach(item => {
            if (typeof item !== 'string') {
                return;
            }
            if (!isNaN(item) && item.trim() !== '' && !/[a-zA-Z]/.test(item)) {
                const num = Number(item);
                if (num % 2 === 0) {
                    even_numbers.push(item);
                } else {
                    odd_numbers.push(item);
                }
                sum += num;
            } else if (/[a-zA-Z]/.test(item) && !/[^a-zA-Z]/.test(item)) {
                alphabets.push(item.toUpperCase());
                alpha_chars += item;
            } else {
                 if (item.trim() !== '' || item.length > 0) {
                     for (const char of item) {
                         if (!/[a-zA-Z0-9]/.test(char) && char.trim() !== '') {
                             special_characters.push(char);
                         }
                     }
                 }
            }
        });

        // As per the pdf, create the alternating caps reverse string
        let concat_string = '';
        const reversed_alpha = alpha_chars.split('').reverse().join('');
        for(let i = 0; i < reversed_alpha.length; i++) {
            concat_string += i % 2 !== 0 ? reversed_alpha[i].toUpperCase() : reversed_alpha[i].toLowerCase();
        }


        res.status(200).json({
            is_success: true,
            user_id: "test_user_01012000",
            email: "test@example.com",
            roll_number: "TEST1234",
            even_numbers,
            odd_numbers,
            alphabets,
            special_characters,
            sum: String(sum),
            concat_string
        });
    } catch (error) {
        res.status(500).json({ is_success: false, error: "An internal error occurred." });
    }
});


const app = express();
app.use(express.json());
app.use('/bfhl', bfhlRouter);

describe('BFHL API Tests', () => {

  const cases = [
    {
      name: 'Handles mixed input with all types',
      data: ['a', '1', '334', '4', 'R', '$', 'ABcD', 'DOE', '0', '999999999', '!', '@', 'Z', 'y', '5', 'AB12', ' ', '', '  ', '123abc', 'abc123', 'A!B@C#'],
      expected: {
        even_numbers: ['334', '4', '0'],
        odd_numbers: ['1', '999999999', '5'],
        alphabets: ['A', 'R', 'ABCD', 'DOE', 'Z', 'Y'],
        special_characters: ['$', '!', '@', '!', '@', '#'],
        sum: '1000000343',
        concat_string: 'YeZdOeDcBaRa'
      }
    },
    {
      name: 'Handles only special characters',
      data: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
      expected: {
        even_numbers: [],
        odd_numbers: [],
        alphabets: [],
        special_characters: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
        sum: '0',
        concat_string: ''
      }
    },
    {
      name: 'Handles only numbers (even/odd, large, zero)',
      data: ['0', '2', '3', '999999999', '1000000000'],
      expected: {
        even_numbers: ['0', '2', '1000000000'],
        odd_numbers: ['3', '999999999'],
        alphabets: [],
        special_characters: [],
        sum: '2000000004',
        concat_string: ''
      }
    },
    {
      name: 'Handles only alphabets (single, multi, mixed case)',
      data: ['a', 'B', 'cDe', 'XYZ', 'mnop'],
      expected: {
        even_numbers: [],
        odd_numbers: [],
        alphabets: ['A', 'B', 'CDE', 'XYZ', 'MNOP'],
        special_characters: [],
        sum: '0',
        concat_string: 'pOnMyZxEeDcBa'
      }
    },
    {
      name: 'Handles empty array',
      data: [],
      expected: {
        even_numbers: [],
        odd_numbers: [],
        alphabets: [],
        special_characters: [],
        sum: '0',
        concat_string: ''
      }
    },
  ];

  cases.forEach(({ name, data, expected }) => {
    test(name, async () => {
      const res = await request(app)
        .post('/bfhl')
        .send({ data });
      expect(res.statusCode).toBe(200);
      expect(res.body.is_success).toBe(true);
      expect(res.body.even_numbers).toEqual(expected.even_numbers);
      expect(res.body.odd_numbers).toEqual(expected.odd_numbers);
      expect(res.body.alphabets).toEqual(expected.alphabets);
      expect(res.body.special_characters).toEqual(expected.special_characters);
      expect(res.body.sum).toBe(expected.sum);
      expect(res.body.concat_string).toBe(expected.concat_string);
    });
  });

  test('Handles invalid input (not array)', async () => {
    const res = await request(app)
      .post('/bfhl')
      .send({ data: 'not-an-array' });
    expect(res.statusCode).toBe(400);
    expect(res.body.is_success).toBe(false);
  });

  test('Handles missing data field', async () => {
    const res = await request(app)
      .post('/bfhl')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.is_success).toBe(false);
  });

  test('Handles array with null, undefined, non-string', async () => {
    const res = await request(app)
      .post('/bfhl')
      .send({ data: [null, undefined, 123, {}, [], true, false, 'A', '1', '$'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.even_numbers).toEqual([]);
    expect(res.body.odd_numbers).toEqual(['1']);
    expect(res.body.alphabets).toEqual(['A']);
    expect(res.body.special_characters).toEqual(['$']);
  });

  test('Handles numbers that are larger than JavaScripts MAX_SAFE_INTEGER', async () => {
    const largeNumber = '9007199254740992';
    const evenLargerNumber = '900719925474099999999999999999999999999999999999999999';
    const res = await request(app)
      .post('/bfhl')
      .send({ data: [largeNumber, '1', evenLargerNumber] });
    expect(res.statusCode).toBe(200);
    expect(res.body.is_success).toBe(true);
    expect(res.body.even_numbers).toEqual([largeNumber]);
    expect(res.body.odd_numbers).toEqual(['1', evenLargerNumber]);
  });

  test('Handles alphanumeric strings which are neither numbers nor alphabets', async () => {
    const res = await request(app)
      .post('/bfhl')
      .send({ data: ['abc123', '123xyz', 'a1b2c3'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.is_success).toBe(true);
    expect(res.body.even_numbers).toEqual([]);
    expect(res.body.odd_numbers).toEqual([]);
    expect(res.body.alphabets).toEqual([]);
    expect(res.body.special_characters).toEqual([]);
  });

  test('Handles strings containing only whitespace', async () => {
    const res = await request(app)
      .post('/bfhl')
      .send({ data: [' ', '  ', '\t', '\n'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.is_success).toBe(true);
    expect(res.body.even_numbers).toEqual([]);
    expect(res.body.odd_numbers).toEqual([]);
    expect(res.body.alphabets).toEqual([]);
    expect(res.body.special_characters).toEqual([]);
    expect(res.body.sum).toBe('0');
    expect(res.body.concat_string).toBe('');
  });
  
  test('Handles unicode and emoji characters', async () => {
    const res = await request(app)
      .post('/bfhl')
      .send({ data: ['😂', '你好', '❤', '1', 'a'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.is_success).toBe(true);
    expect(res.body.odd_numbers).toEqual(['1']);
    expect(res.body.alphabets).toEqual(['A']);
    expect(res.body.special_characters).toEqual(['😂', '你', '好', '❤']);
  });

  test('Handles numbers with leading/trailing spaces', async () => {
    const res = await request(app)
      .post('/bfhl')
      .send({ data: [' 12 ', '  33', '44  '] });
    expect(res.statusCode).toBe(200);
    expect(res.body.is_success).toBe(true);
    expect(res.body.even_numbers).toEqual([' 12 ', '44  ']);
    expect(res.body.odd_numbers).toEqual(['  33']);
    expect(res.body.sum).toBe('89');
  });
  
  test('Handles negative numbers', async () => {
    const res = await request(app)
      .post('/bfhl')
      .send({ data: ['-1', '-2', '-99'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.is_success).toBe(true);
    expect(res.body.even_numbers).toEqual(['-2']);
    expect(res.body.odd_numbers).toEqual(['-1', '-99']);
    expect(res.body.sum).toBe('-102');
  });
  
  test('Handles floating point numbers', async () => {
    const res = await request(app)
      .post('/bfhl')
      .send({ data: ['1.5', '2.0', '3.14'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.is_success).toBe(true);
    expect(res.body.even_numbers).toEqual([]);
    expect(res.body.odd_numbers).toEqual([]);
    expect(res.body.special_characters).toEqual(['.', '.']);
    expect(res.body.sum).toBe(6.64);
  });

});
