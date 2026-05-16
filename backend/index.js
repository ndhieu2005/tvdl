require('dotenv').config();
const express = require('express');
const cors = require('cors');

const publicRoutes = require('./src/routes/public');
const adminRoutes = require('./src/routes/admin');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', publicRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
