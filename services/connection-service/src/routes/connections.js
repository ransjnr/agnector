const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const connections = new Map();

router.get('/', authMiddleware, (req, res) => {
  const userConnections = [...connections.values()].filter(
    (c) => c.userId === req.user.userId
  );
  res.json({ connections: userConnections, total: userConnections.length });
});

router.get('/stats', authMiddleware, (req, res) => {
  const userConnections = [...connections.values()].filter(
    (c) => c.userId === req.user.userId
  );
  const active = userConnections.filter((c) => c.isActive).length;
  const withAgents = userConnections.filter((c) => c.agentId !== null && c.isActive).length;
  const total = userConnections.length;
  res.json({ total, active, withAgents, inactive: total - active });
});

router.get('/:id', authMiddleware, (req, res) => {
  const conn = connections.get(req.params.id);
  if (!conn) return res.status(404).json({ error: 'Connection not found' });
  if (conn.userId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
  res.json({ connection: conn });
});

router.post('/', authMiddleware, (req, res) => {
  const { integrationId, agentId, permissions } = req.body;
  if (!integrationId) {
    return res.status(400).json({ error: 'integrationId is required' });
  }
  const existing = [...connections.values()].find(
    (c) => c.userId === req.user.userId && c.integrationId === integrationId
  );
  if (existing) {
    return res.status(409).json({ error: 'Connection already exists for this integration', connection: existing });
  }
  const conn = {
    id: uuidv4(),
    userId: req.user.userId,
    integrationId,
    agentId: agentId || null,
    isActive: true,
    status: 'connected',
    permissions: permissions || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  connections.set(conn.id, conn);
  res.status(201).json({ connection: conn });
});

router.put('/:id', authMiddleware, (req, res) => {
  const conn = connections.get(req.params.id);
  if (!conn) return res.status(404).json({ error: 'Connection not found' });
  if (conn.userId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

  const { isActive, agentId, permissions, status } = req.body;
  if (isActive !== undefined) conn.isActive = isActive;
  if (agentId !== undefined) conn.agentId = agentId;
  if (permissions !== undefined) conn.permissions = permissions;
  if (status !== undefined) conn.status = status;
  conn.updatedAt = new Date().toISOString();
  connections.set(conn.id, conn);
  res.json({ connection: conn });
});

router.patch('/:id/toggle', authMiddleware, (req, res) => {
  const conn = connections.get(req.params.id);
  if (!conn) return res.status(404).json({ error: 'Connection not found' });
  if (conn.userId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
  conn.isActive = !conn.isActive;
  conn.status = conn.isActive ? 'connected' : 'disconnected';
  conn.updatedAt = new Date().toISOString();
  connections.set(conn.id, conn);
  res.json({ connection: conn });
});

router.delete('/:id', authMiddleware, (req, res) => {
  const conn = connections.get(req.params.id);
  if (!conn) return res.status(404).json({ error: 'Connection not found' });
  if (conn.userId !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });
  connections.delete(req.params.id);
  res.json({ message: 'Connection deleted' });
});

module.exports = router;
