require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const agentRoutes = require('./routes/agents');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'agent-service' });
});

app.use('/agents', agentRoutes);

app.use((err, req, res, next) => {
  console.error('[Agent Service] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[Agent Service] Running on port ${PORT}`);
});
