const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const stringRoutes = require('./routes/stringRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/strings', stringRoutes);

// health
app.get('/', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;
