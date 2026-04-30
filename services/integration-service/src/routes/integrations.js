const express = require('express');
const { v4: uuidv4 } = require('uuid');
const seedIntegrations = require('../data/seedIntegrations');

const router = express.Router();

const integrations = new Map(seedIntegrations.map((i) => [i.id, i]));
const pendingAuthorizations = new Map();

router.get('/', (req, res) => {
  const { category, search } = req.query;
  let list = [...integrations.values()];
  if (category && category !== 'all') {
    list = list.filter((i) => i.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
    );
  }
  res.json({ integrations: list, total: list.length });
});

router.get('/categories', (req, res) => {
  const cats = [...new Set([...integrations.values()].map((i) => i.category))];
  res.json({ categories: cats });
});

router.get('/:id', (req, res) => {
  const integration = integrations.get(req.params.id);
  if (!integration) return res.status(404).json({ error: 'Integration not found' });
  res.json({ integration });
});

router.post('/:id/authorize', (req, res) => {
  const integration = integrations.get(req.params.id);
  if (!integration) return res.status(404).json({ error: 'Integration not found' });
  const authId = uuidv4();
  const mockAuthUrl = `https://oauth.${req.params.id}.com/authorize?client_id=agnector&state=${authId}&scope=${integration.scopes.join(',')}`;
  pendingAuthorizations.set(authId, {
    integrationId: req.params.id,
    createdAt: new Date().toISOString(),
    status: 'pending',
  });
  res.json({
    authUrl: mockAuthUrl,
    authId,
    message: `Redirect user to authUrl to complete ${integration.name} authorization`,
  });
});

router.get('/callback/oauth', (req, res) => {
  const { state, code } = req.query;
  const pending = pendingAuthorizations.get(state);
  if (!pending) return res.status(400).json({ error: 'Invalid state parameter' });
  pending.status = 'authorized';
  pending.code = code;
  pendingAuthorizations.set(state, pending);
  res.json({
    message: 'Authorization successful',
    authId: state,
    integrationId: pending.integrationId,
    accessToken: `mock_access_token_${uuidv4()}`,
  });
});

module.exports = router;
