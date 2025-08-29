const request = require('supertest');
const express = require('express');

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

  const concat_string = alphaConcat
    .split('')
    .reverse()
    .map((char, index) => 
        index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
    )
    .join('');

  return {
    even_numbers,
    odd_numbers,
    alphabets,
    special_characters,
    sum: sum.toString(),
    concat_string
  };
}

const app = express();
app.use(express.json());

const bfhlRouter = express.Router();

bfhlRouter.post('/', (req, res) => {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ is_success: false, error: "Invalid input: 'data' must be an array." });
    }

    try {
        const result = processData(data);
        res.status(200).json({
            is_success: true,
            user_id: "test_user_01012000",
            email: "test@example.com",
            roll_number: "TEST1234",
            ...result
        });
    } catch (error) {
        res.status(500).json({ is_success: false, error: "An internal error occurred." });
    }
});

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
        concat_string: 'YzEoDdcBaRa' 
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
        concat_string: 'PoNmZyXeDcBa'
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

  test('Handles array with null, undefined, and non-string types', async () => {
    const res = await request(app)
      .post('/bfhl')
      .send({ data: [null, undefined, 123, {}, [], true, false, 'A', '1', '$'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.even_numbers).toEqual([]);
    expect(res.body.odd_numbers).toEqual(['1']);
    expect(res.body.alphabets).toEqual(['A']);
    expect(res.body.special_characters).toEqual(['$']);
  });

  test('Handles alphanumeric strings (which are ignored)', async () => {
    const res = await request(app)
      .post('/bfhl')
      .send({ data: ['abc123', '123xyz', 'a1b2c3'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.even_numbers).toEqual([]);
    expect(res.body.odd_numbers).toEqual([]);
    expect(res.body.alphabets).toEqual([]);
    expect(res.body.special_characters).toEqual([]);
  });
  
  test('Handles unicode and emoji characters as special characters', async () => {
    const res = await request(app)
      .post('/bfhl')
      .send({ data: ['😂', '你好', '❤', '1', 'a'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.odd_numbers).toEqual(['1']);
    expect(res.body.alphabets).toEqual(['A']);
    expect(res.body.special_characters).toEqual(['😂', '你', '好', '❤']);
  });
  
  test('Handles floating point numbers (which are not integers)', async () => {
    const res = await request(app)
      .post('/bfhl')
      .send({ data: ['1.5', '2.0', '3.14'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.even_numbers).toEqual([]);
    expect(res.body.odd_numbers).toEqual([]);
    expect(res.body.special_characters).toEqual(['.', '.', '.']);
    expect(res.body.sum).toBe('0');
  });

});
