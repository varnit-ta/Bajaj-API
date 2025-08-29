const express = require('express');
const bodyParser = require('body-parser');
const bfhlRouter = require('./routes/bfhl');

const app = express();
app.use(bodyParser.json());

app.use('/bfhl', bfhlRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    is_success: false,
    error: 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
