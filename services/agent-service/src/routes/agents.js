const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const seedAgents = require('../data/seedAgents');

const router = express.Router();

const agents = new Map(seedAgents.map((a) => [a.id, a]));

router.get('/', (req, res) => {
  const { category, search } = req.query;
  let list = [...agents.values()].filter((a) => a.isPublic);
  if (category && category !== 'all') {
    list = list.filter((a) => a.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.capabilities.some((c) => c.includes(q))
    );
  }
  res.json({ agents: list, total: list.length });
});

router.get('/categories', (req, res) => {
  const cats = [...new Set([...agents.values()].map((a) => a.category))];
  res.json({ categories: cats });
});

router.get('/:id', (req, res) => {
  const agent = agents.get(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json({ agent });
});

router.post('/', authMiddleware, (req, res) => {
  const { name, description, capabilities, category, icon, color } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'name and description are required' });
  }
  const agent = {
    id: uuidv4(),
    name,
    description,
    capabilities: capabilities || [],
    category: category || 'custom',
    icon: icon || '🤖',
    color: color || '#6366F1',
    isPublic: false,
    model: 'claude-sonnet-4-6',
    createdBy: req.user.userId,
    usageCount: 0,
    rating: 0,
    createdAt: new Date().toISOString(),
  };
  agents.set(agent.id, agent);
  res.status(201).json({ agent });
});

router.put('/:id', authMiddleware, (req, res) => {
  const agent = agents.get(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  if (agent.createdBy !== req.user.userId && agent.createdBy !== 'system') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const updates = req.body;
  const updated = { ...agent, ...updates, id: agent.id, updatedAt: new Date().toISOString() };
  agents.set(agent.id, updated);
  res.json({ agent: updated });
});

router.delete('/:id', authMiddleware, (req, res) => {
  const agent = agents.get(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  if (agent.createdBy !== req.user.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  agents.delete(req.params.id);
  res.json({ message: 'Agent deleted' });
});

module.exports = router;
