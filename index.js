const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'TVDL Backend is running!' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
