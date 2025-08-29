const express = require('express');
const router = express.Router();
const processData = require('../utils/processData');


const FULL_NAME = 'varnit singh';
const EMAIL = 'varnit.singh2022@vitstudent.ac.in';
const ROLL_NUMBER = '22BIT0221';

function getUserId() {
  const name = FULL_NAME.trim().replace(/\s+/g, '_').toLowerCase();
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${name}_${dd}${mm}${yyyy}`;
}

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
      user_id: getUserId(),
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
