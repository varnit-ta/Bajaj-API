const express = require('express');
const router = express.Router();
const processData = require('../utils/processData');

const FULL_NAME = 'john_doe';
const DOB = '17091999';
const EMAIL = 'john@xyz.com';
const ROLL_NUMBER = 'ABCD123';

router.post('/', (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        error: 'Invalid input: data must be an array.'
      });
    }
    const result = processData(data);
    res.status(200).json({
      is_success: true,
      user_id: `${FULL_NAME}_${DOB}`,
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      is_success: false,
      error: error.message || 'Internal Server Error'
    });
  }
});

module.exports = router;
