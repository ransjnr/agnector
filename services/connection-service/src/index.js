require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectionRoutes = require('./routes/connections');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'connection-service' });
});

app.use('/connections', connectionRoutes);

app.use((err, req, res, next) => {
  console.error('[Connection Service] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[Connection Service] Running on port ${PORT}`);
});
