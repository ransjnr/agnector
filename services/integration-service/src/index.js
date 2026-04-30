require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const integrationRoutes = require('./routes/integrations');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'integration-service' });
});

app.use('/integrations', integrationRoutes);

app.use((err, req, res, next) => {
  console.error('[Integration Service] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[Integration Service] Running on port ${PORT}`);
});
