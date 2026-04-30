require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(morgan('combined'));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'gateway',
    timestamp: new Date().toISOString(),
    upstreams: {
      auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      agents: process.env.AGENT_SERVICE_URL || 'http://localhost:3002',
      connections: process.env.CONNECTION_SERVICE_URL || 'http://localhost:3003',
      integrations: process.env.INTEGRATION_SERVICE_URL || 'http://localhost:3004',
    },
  });
});

const proxyOpts = (target) => ({
  target,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(502).json({ error: 'Service unavailable', details: err.message });
    },
  },
});

app.use(
  '/api/auth',
  createProxyMiddleware({
    ...proxyOpts(process.env.AUTH_SERVICE_URL || 'http://localhost:3001'),
    pathRewrite: { '^/api/auth': '/auth' },
  })
);

app.use(
  '/api/agents',
  createProxyMiddleware({
    ...proxyOpts(process.env.AGENT_SERVICE_URL || 'http://localhost:3002'),
    pathRewrite: { '^/api/agents': '/agents' },
  })
);

app.use(
  '/api/connections',
  createProxyMiddleware({
    ...proxyOpts(process.env.CONNECTION_SERVICE_URL || 'http://localhost:3003'),
    pathRewrite: { '^/api/connections': '/connections' },
  })
);

app.use(
  '/api/integrations',
  createProxyMiddleware({
    ...proxyOpts(process.env.INTEGRATION_SERVICE_URL || 'http://localhost:3004'),
    pathRewrite: { '^/api/integrations': '/integrations' },
  })
);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`[Gateway] Running on port ${PORT}`);
});
