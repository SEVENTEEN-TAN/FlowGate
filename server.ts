import express from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(express.json());

const dbPath = path.join(process.cwd(), 'data.db');
const db = new Database(dbPath);

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS card_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_string TEXT UNIQUE,
    status TEXT DEFAULT 'unused',
    used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    remark TEXT
  );
  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    enabled INTEGER DEFAULT 1,
    frequency TEXT DEFAULT 'always',
    style TEXT DEFAULT 'top-right',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS apps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    ui_schema TEXT DEFAULT '[]',
    status TEXT DEFAULT 'enabled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    trigger_id TEXT DEFAULT '',
    nodes TEXT DEFAULT '[]',
    edges TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workflow_id INTEGER NOT NULL,
    user_key_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    context TEXT DEFAULT '{}',
    logs TEXT DEFAULT '',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id),
    FOREIGN KEY (user_key_id) REFERENCES card_keys(id)
  );
  CREATE TABLE IF NOT EXISTS key_pools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS pool_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pool_id INTEGER NOT NULL,
    key_value TEXT NOT NULL,
    status TEXT DEFAULT 'unused',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_at DATETIME,
    used_by_execution INTEGER,
    FOREIGN KEY (pool_id) REFERENCES key_pools(id) ON DELETE CASCADE
  );
`);

try {
  db.exec(`ALTER TABLE card_keys ADD COLUMN remark TEXT;`);
} catch (e) {
  // Ignore if column already exists
}

try {
  db.exec(`ALTER TABLE card_keys ADD COLUMN duration_hours INTEGER DEFAULT 24;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE card_keys ADD COLUMN expires_at DATETIME;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE card_keys ADD COLUMN app_id INTEGER DEFAULT NULL;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE pool_keys ADD COLUMN used_by_key_string TEXT;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE card_keys ADD COLUMN execution_mode TEXT DEFAULT 'unlimited';`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE card_keys ADD COLUMN valid_from DATETIME;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE card_keys ADD COLUMN valid_until DATETIME;`);
} catch (e) {}

// Export db for engine use
(globalThis as any).__db = db;

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

// --- API Routes ---

// Check if admin is initialized
app.get('/api/status', (req, res) => {
  const adminSetup = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_setup');
  res.json({ initialized: !!adminSetup });
});

// Setup admin account
app.post('/api/setup', (req, res) => {
  const { username, password } = req.body;
  const adminSetup = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_setup');
  if (adminSetup) {
    return res.status(400).json({ error: 'Already initialized' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('admin_username', username);
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('admin_password', hashedPassword);
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('admin_setup', 'true');
  res.json({ success: true });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const storedUsername = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_username') as any;
  const storedPassword = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password') as any;
  
  if (!storedUsername || !storedPassword || storedUsername.value !== username || !bcrypt.compareSync(password, storedPassword.value)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '3h' });
  res.json({ token });
});

// Middleware for admin
const adminAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Change admin password
app.post('/api/admin/change-password', adminAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const storedPassword = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password') as any;
  
  if (!bcrypt.compareSync(oldPassword, storedPassword.value)) {
    return res.status(400).json({ error: 'Incorrect old password' });
  }
  
  const hashedNew = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE settings SET value = ? WHERE key = ?').run('admin_password', hashedNew);
  res.json({ success: true });
});

// Get announcements (public)
app.get('/api/announcements', (req, res) => {
  const announcements = db.prepare('SELECT * FROM announcements WHERE enabled = 1 ORDER BY created_at DESC').all();
  res.json(announcements);
});

// Get announcements (admin)
app.get('/api/admin/announcements', adminAuth, (req, res) => {
  const announcements = db.prepare('SELECT * FROM announcements ORDER BY created_at DESC').all();
  res.json(announcements);
});

// Create announcement (admin)
app.post('/api/admin/announcements', adminAuth, (req, res) => {
  const { title, content, enabled, frequency, style } = req.body;
  const stmt = db.prepare('INSERT INTO announcements (title, content, enabled, frequency, style) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(title || '无标题', content || '', enabled ? 1 : 0, frequency || 'always', style || 'top-right');
  res.json({ success: true, id: result.lastInsertRowid });
});

// Update announcement (admin)
app.put('/api/admin/announcements/:id', adminAuth, (req, res) => {
  const { title, content, enabled, frequency, style } = req.body;
  const stmt = db.prepare('UPDATE announcements SET title = ?, content = ?, enabled = ?, frequency = ?, style = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(title || '无标题', content || '', enabled ? 1 : 0, frequency || 'always', style || 'top-right', req.params.id);
  res.json({ success: true });
});

// Delete announcement (admin)
app.delete('/api/admin/announcements/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- Apps CRUD ---
app.get('/api/admin/apps', adminAuth, (req, res) => {
  const apps = db.prepare('SELECT * FROM apps ORDER BY created_at DESC').all();
  res.json(apps);
});

app.post('/api/admin/apps', adminAuth, (req, res) => {
  const { name, description = '', status = 'enabled' } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = db.prepare('INSERT INTO apps (name, description, status) VALUES (?, ?, ?)').run(name, description, status);
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/admin/apps/:id', adminAuth, (req, res) => {
  const { name, description, status, ui_schema } = req.body;
  const existing = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: 'App not found' });
  db.prepare('UPDATE apps SET name = ?, description = ?, status = ?, ui_schema = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(name ?? existing.name, description ?? existing.description, status ?? existing.status, ui_schema ?? existing.ui_schema, req.params.id);
  res.json({ success: true });
});

// Preview what deleting an app will affect
app.get('/api/admin/apps/:id/delete-preview', adminAuth, (req, res) => {
  const appId = req.params.id;
  const appRow = db.prepare('SELECT * FROM apps WHERE id = ?').get(appId) as any;
  if (!appRow) return res.status(404).json({ error: 'App not found' });

  const workflowCount = (db.prepare('SELECT COUNT(*) as count FROM workflows WHERE app_id = ?').get(appId) as any).count;
  const keyCount = (db.prepare('SELECT COUNT(*) as count FROM card_keys WHERE app_id = ?').get(appId) as any).count;
  const unusedKeyCount = (db.prepare("SELECT COUNT(*) as count FROM card_keys WHERE app_id = ? AND status = 'unused'").get(appId) as any).count;
  const hasUiSchema = !!(appRow.ui_schema && appRow.ui_schema !== '[]');

  res.json({ appName: appRow.name, workflowCount, keyCount, unusedKeyCount, hasUiSchema });
});

app.delete('/api/admin/apps/:id', adminAuth, (req, res) => {
  const appId = req.params.id;
  const appRow = db.prepare('SELECT * FROM apps WHERE id = ?').get(appId) as any;
  if (!appRow) return res.status(404).json({ error: 'App not found' });

  // Transaction: cascade delete
  const cascade = db.transaction(() => {
    // 1. Delete executions for all workflows of this app
    const workflows = db.prepare('SELECT id FROM workflows WHERE app_id = ?').all(appId) as any[];
    for (const wf of workflows) {
      db.prepare('DELETE FROM executions WHERE workflow_id = ?').run(wf.id);
    }
    // 2. Delete all workflows
    db.prepare('DELETE FROM workflows WHERE app_id = ?').run(appId);
    
    // 3. Delete executions of card keys bound to this app, then delete the keys
    const keys = db.prepare('SELECT id FROM card_keys WHERE app_id = ?').all(appId) as any[];
    for (const k of keys) {
      db.prepare('DELETE FROM executions WHERE user_key_id = ?').run(k.id);
    }
    db.prepare('DELETE FROM card_keys WHERE app_id = ?').run(appId);
    
    // 4. Delete the app itself (ui_schema goes with it)
    db.prepare('DELETE FROM apps WHERE id = ?').run(appId);
  });

  cascade();
  res.json({ success: true });
});

// Get app detail (for client, requires auth)
app.get('/api/client/apps/:id', (req, res) => {
  const appRow = db.prepare('SELECT * FROM apps WHERE id = ? AND status = ?').get(req.params.id, 'enabled') as any;
  if (!appRow) return res.status(404).json({ error: 'App not found' });
  res.json(appRow);
});

// --- Workflows ---
app.get('/api/admin/apps/:id/workflows', adminAuth, (req, res) => {
  const workflows = db.prepare('SELECT * FROM workflows WHERE app_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(workflows);
});

app.post('/api/admin/apps/:id/workflows', adminAuth, (req, res) => {
  const { name, trigger_id = '', nodes = '[]', edges = '[]' } = req.body;
  const appId = req.params.id;
  const result = db.prepare('INSERT INTO workflows (app_id, name, trigger_id, nodes, edges) VALUES (?, ?, ?, ?, ?)')
    .run(appId, name || 'Untitled', trigger_id, typeof nodes === 'string' ? nodes : JSON.stringify(nodes), typeof edges === 'string' ? edges : JSON.stringify(edges));
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/admin/workflows/:id', adminAuth, (req, res) => {
  const { name, trigger_id, nodes, edges } = req.body;
  const existing = db.prepare('SELECT * FROM workflows WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: 'Workflow not found' });
  db.prepare('UPDATE workflows SET name = ?, trigger_id = ?, nodes = ?, edges = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(
      name ?? existing.name,
      trigger_id ?? existing.trigger_id,
      nodes ? (typeof nodes === 'string' ? nodes : JSON.stringify(nodes)) : existing.nodes,
      edges ? (typeof edges === 'string' ? edges : JSON.stringify(edges)) : existing.edges,
      req.params.id
    );
  res.json({ success: true });
});

app.delete('/api/admin/workflows/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM workflows WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- Key Pools ---
app.get('/api/admin/pools', adminAuth, (req, res) => {
  const pools = db.prepare('SELECT * FROM key_pools ORDER BY created_at DESC').all() as any[];
  // Attach stats
  const result = pools.map(p => {
    const total = (db.prepare('SELECT COUNT(*) as c FROM pool_keys WHERE pool_id = ?').get(p.id) as any).c;
    const unused = (db.prepare('SELECT COUNT(*) as c FROM pool_keys WHERE pool_id = ? AND status = ?').get(p.id, 'unused') as any).c;
    const used = (db.prepare('SELECT COUNT(*) as c FROM pool_keys WHERE pool_id = ? AND status = ?').get(p.id, 'used') as any).c;
    return { ...p, total, unused, used };
  });
  res.json(result);
});

app.post('/api/admin/pools', adminAuth, (req, res) => {
  const { name, description = '' } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const result = db.prepare('INSERT INTO key_pools (name, description) VALUES (?, ?)').run(name.trim(), description);
  res.json({ success: true, id: result.lastInsertRowid });
});

app.delete('/api/admin/pools/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM pool_keys WHERE pool_id = ?').run(req.params.id);
  db.prepare('DELETE FROM key_pools WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Pool keys management
app.get('/api/admin/pools/:id/keys', adminAuth, (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const statusFilter = req.query.status as string;
  const search = (req.query.search as string || '').trim();
  
  let countSql = 'SELECT COUNT(*) as total FROM pool_keys WHERE pool_id = ?';
  let dataSql = 'SELECT * FROM pool_keys WHERE pool_id = ?';
  const params: any[] = [req.params.id];
  
  if (statusFilter && ['unused', 'used'].includes(statusFilter)) {
    countSql += ' AND status = ?';
    dataSql += ' AND status = ?';
    params.push(statusFilter);
  }

  if (search) {
    countSql += ' AND (key_value LIKE ? OR used_by_key_string LIKE ?)';
    dataSql += ' AND (key_value LIKE ? OR used_by_key_string LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  const total = (db.prepare(countSql).get(...params) as any).total;
  dataSql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const data = db.prepare(dataSql).all(...params, limit, offset);
  res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
});

app.post('/api/admin/pools/:id/keys', adminAuth, (req, res) => {
  const { keys } = req.body; // string with newline-separated keys
  if (!keys?.trim()) return res.status(400).json({ error: 'Keys required' });
  const poolId = req.params.id;
  const pool = db.prepare('SELECT * FROM key_pools WHERE id = ?').get(poolId);
  if (!pool) return res.status(404).json({ error: 'Pool not found' });
  
  const lines = keys.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
  const insert = db.prepare('INSERT OR IGNORE INTO pool_keys (pool_id, key_value) VALUES (?, ?)');
  const insertMany = db.transaction((items: string[]) => {
    let added = 0;
    for (const key of items) {
      const r = insert.run(poolId, key);
      if (r.changes > 0) added++;
    }
    return added;
  });
  const added = insertMany(lines);
  res.json({ success: true, added, total: lines.length });
});

// Get Dashboard Metrics
app.get('/api/admin/dashboard/metrics', adminAuth, (req, res) => {
  // 1. Inventory for Apps (Card Keys) — INNER JOIN excludes orphaned keys from deleted apps
  const appKeysCount = db.prepare(`
    SELECT apps.name as target_name, COUNT(*) as unused_count 
    FROM card_keys 
    INNER JOIN apps ON card_keys.app_id = apps.id 
    WHERE card_keys.status = 'unused' 
    GROUP BY card_keys.app_id
  `).all();

  // 2. Inventory for Pools (Pool Keys) — INNER JOIN excludes orphaned keys from deleted pools
  const poolKeysCount = db.prepare(`
    SELECT key_pools.name as target_name, COUNT(*) as unused_count 
    FROM pool_keys 
    INNER JOIN key_pools ON pool_keys.pool_id = key_pools.id 
    WHERE pool_keys.status = 'unused' 
    GROUP BY pool_keys.pool_id
  `).all();

  // 3. Traffic points based on period filter
  const period = req.query.period as string || 'today';
  let trafficQuery = '';
  switch (period) {
    case 'yesterday':
      trafficQuery = `SELECT status, datetime(started_at, 'localtime') as time FROM executions WHERE date(started_at, 'localtime') = date('now', '-1 day', 'localtime') ORDER BY started_at ASC LIMIT 2000`;
      break;
    case 'week':
      trafficQuery = `SELECT status, datetime(started_at, 'localtime') as time FROM executions WHERE started_at >= datetime('now', '-7 days', 'localtime') ORDER BY started_at ASC LIMIT 3000`;
      break;
    case 'month':
      trafficQuery = `SELECT status, datetime(started_at, 'localtime') as time FROM executions WHERE started_at >= datetime('now', '-30 days', 'localtime') ORDER BY started_at ASC LIMIT 5000`;
      break;
    case 'today':
    default:
      trafficQuery = `SELECT status, datetime(started_at, 'localtime') as time FROM executions WHERE date(started_at, 'localtime') = date('now', 'localtime') ORDER BY started_at ASC LIMIT 2000`;
      break;
  }
  const traffic = db.prepare(trafficQuery).all();

  // 4. Overarching general stats
  const totalApps = (db.prepare('SELECT COUNT(*) as c FROM apps').get() as any).c;
  const totalWorkflows = (db.prepare('SELECT COUNT(*) as c FROM workflows').get() as any).c;
  const totalKeys = (db.prepare('SELECT COUNT(*) as c FROM card_keys').get() as any).c;
  const totalExecutions = (db.prepare('SELECT COUNT(*) as c FROM executions').get() as any).c;

  // 5. Recent 10 Executions
  const recentExecutions = db.prepare(`
    SELECT e.id, e.status, e.started_at, w.name as workflow_name, a.name as app_name, c.key_string
    FROM executions e
    LEFT JOIN workflows w ON e.workflow_id = w.id
    LEFT JOIN apps a ON w.app_id = a.id
    LEFT JOIN card_keys c ON e.user_key_id = c.id
    ORDER BY e.started_at DESC LIMIT 10
  `).all();

  // 6. Configured Alert Threshold
  const thresholdSetting = db.prepare("SELECT value FROM settings WHERE key = 'inventory_alert_threshold'").get() as any;
  const inventoryThreshold = thresholdSetting ? parseInt(thresholdSetting.value) || 20 : 20;

  res.json({
    inventory_apps: appKeysCount,
    inventory_pools: poolKeysCount,
    traffic: traffic,
    stats: {
      apps: totalApps,
      workflows: totalWorkflows,
      keys: totalKeys,
      executions: totalExecutions
    },
    recent_executions: recentExecutions,
    inventory_threshold: inventoryThreshold
  });
});

app.delete('/api/admin/pool-keys/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM pool_keys WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Consume a key from pool (used by engine)
app.post('/api/internal/pools/:id/consume', (req, res) => {
  const poolId = req.params.id;
  const key = db.prepare('SELECT * FROM pool_keys WHERE pool_id = ? AND status = ? LIMIT 1').get(poolId, 'unused') as any;
  if (!key) return res.status(404).json({ error: 'No available keys in pool' });
  db.prepare('UPDATE pool_keys SET status = ?, used_at = CURRENT_TIMESTAMP, used_by_execution = ?, used_by_key_string = ? WHERE id = ?')
    .run('used', req.body.execution_id || null, req.body.key_string || null, key.id);
  res.json({ key_value: key.key_value, key_id: key.id });
});

// Get keys
app.get('/api/admin/keys', adminAuth, (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';
  const appIdFilter = req.query.app_id as string || '';
  const offset = (page - 1) * limit;

  let query = 'SELECT card_keys.*, apps.name as app_name FROM card_keys LEFT JOIN apps ON card_keys.app_id = apps.id';
  let countQuery = 'SELECT COUNT(*) as total FROM card_keys';
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    conditions.push('(key_string LIKE ? OR remark LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (appIdFilter) {
    conditions.push('card_keys.app_id = ?');
    params.push(appIdFilter);
  }

  if (conditions.length > 0) {
    const where = ' WHERE ' + conditions.join(' AND ');
    query += where;
    countQuery += where;
  }

  query += ' ORDER BY card_keys.created_at DESC LIMIT ? OFFSET ?';
  
  const totalRow = db.prepare(countQuery).get(...params) as { total: number };
  const keys = db.prepare(query).all(...params, limit, offset);

  res.json({
    data: keys,
    total: totalRow.total,
    page,
    limit
  });
});

// Batch delete keys
app.post('/api/admin/keys/batch-delete', adminAuth, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No ids provided' });
  }
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM executions WHERE user_key_id IN (${placeholders})`).run(...ids);
  db.prepare(`DELETE FROM card_keys WHERE id IN (${placeholders})`).run(...ids);
  res.json({ success: true });
});

// Update key execution mode
app.patch('/api/admin/keys/:id', adminAuth, (req, res) => {
  const { execution_mode, valid_from, valid_until } = req.body;
  const key = db.prepare('SELECT * FROM card_keys WHERE id = ?').get(req.params.id) as any;
  if (!key) return res.status(404).json({ error: 'Key not found' });
  
  if (execution_mode) {
    db.prepare('UPDATE card_keys SET execution_mode = ?, valid_from = ?, valid_until = ? WHERE id = ?')
      .run(execution_mode, valid_from || null, valid_until || null, req.params.id);
  }
  res.json({ success: true });
});

// Generate keys
app.post('/api/admin/keys/generate', adminAuth, (req, res) => {
  const { count, prefix = '', remark = '', expires_at, app_id, execution_mode = 'unlimited', valid_from, valid_until } = req.body;
  if (!app_id) {
    return res.status(400).json({ error: 'Must select an app to bind' });
  }
  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 18; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const formatted = result.match(/.{1,6}/g)!.join('-');
    return prefix ? `${prefix}${formatted}` : formatted;
  };

  const insert = db.prepare('INSERT INTO card_keys (key_string, remark, expires_at, app_id, execution_mode, valid_from, valid_until) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const generatedKeys: string[] = [];
  const generateMany = db.transaction((count: number) => {
    for (let i = 0; i < count; i++) {
      try {
        const key = generateKey();
        const formattedExpiresAt = expires_at ? new Date(expires_at).toISOString().slice(0, 19).replace('T', ' ') : null;
        insert.run(key, remark, formattedExpiresAt, app_id, execution_mode, valid_from || null, valid_until || null);
        generatedKeys.push(key);
      } catch (e) {
        // Ignore unique constraint violations
      }
    }
  });
  
  generateMany(count);
  res.json({ success: true, count: generatedKeys.length, keys: generatedKeys });
});

// Delete key
app.delete('/api/admin/keys/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM executions WHERE user_key_id = ?').run(req.params.id);
  db.prepare('DELETE FROM card_keys WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Verify and use key
app.post('/api/client/verify', (req, res) => {
  const { key } = req.body;
  const cardKey = db.prepare('SELECT * FROM card_keys WHERE key_string = ?').get(key) as any;
  
  if (!cardKey) {
    return res.status(400).json({ error: '无效的卡密' });
  }

  // Pre-flight execution checks on login
  if (cardKey.execution_mode === 'one_success' && cardKey.status === 'used') {
    return res.status(400).json({ error: '该口令已执行成功过，不可再次使用' });
  }

  if (cardKey.execution_mode === 'time_period') {
    // time_period strings are stored as local datetime strings 'YYYY-MM-DDTHH:mm:SS'
    const nowLocal = new Date().toLocaleString('sv').replace(' ', 'T');
    if (cardKey.valid_from && nowLocal < cardKey.valid_from) {
      return res.status(400).json({ error: '该口令尚未到可使用时间' });
    }
    if (cardKey.valid_until && nowLocal > cardKey.valid_until) {
      return res.status(400).json({ error: '该口令已过可使用时间' });
    }
  }
  
  if (cardKey.expires_at) {
    const isExpired = db.prepare(`SELECT 1 FROM card_keys WHERE id = ? AND expires_at < CURRENT_TIMESTAMP`).get(cardKey.id);
    if (isExpired) {
      if (cardKey.status !== 'expired') {
        db.prepare('UPDATE card_keys SET status = ? WHERE id = ?').run('expired', cardKey.id);
      }
      return res.status(400).json({ error: '卡密已过期' });
    }
  }

  if (cardKey.status === 'unused') {
    // First time use, set expires_at if not already set (fallback for old duration_hours logic)
    db.prepare(`UPDATE card_keys SET status = ?, used_at = CURRENT_TIMESTAMP, expires_at = COALESCE(expires_at, datetime('now', '+' || COALESCE(duration_hours, 24) || ' hours')) WHERE id = ?`)
      .run('active', cardKey.id);
      
    const updatedKey = db.prepare('SELECT * FROM card_keys WHERE id = ?').get(cardKey.id) as any;
    const expiresDate = new Date(updatedKey.expires_at + 'Z');
    const remainingHours = (expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    const token = jwt.sign({ role: 'client', keyId: cardKey.id }, JWT_SECRET, { expiresIn: `${Math.max(1, Math.floor(remainingHours))}h` });
    return res.json({ token, success: true, expires_at: expiresDate.toISOString(), app_id: cardKey.app_id });
  } else if (cardKey.status === 'active' || cardKey.status === 'used') {
    // Still valid
    const expiresDate = cardKey.expires_at ? new Date(cardKey.expires_at + 'Z') : new Date(new Date(cardKey.used_at + 'Z').getTime() + 24 * 60 * 60 * 1000); // fallback for old keys
    const remainingHours = (expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    
    if (remainingHours <= 0) {
      db.prepare('UPDATE card_keys SET status = ? WHERE id = ?').run('expired', cardKey.id);
      return res.status(400).json({ error: '卡密已过期' });
    }

    const token = jwt.sign({ role: 'client', keyId: cardKey.id }, JWT_SECRET, { expiresIn: `${Math.max(1, Math.floor(remainingHours))}h` });
    return res.json({ token, success: true, expires_at: expiresDate.toISOString(), app_id: cardKey.app_id });
  } else if (cardKey.status === 'expired') {
    return res.status(400).json({ error: '卡密已过期' });
  } else {
    return res.status(400).json({ error: '卡密状态异常' });
  }
});

// --- Client Auth Middleware ---
function clientAuth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'client') return res.status(403).json({ error: 'Forbidden' });
    req.clientKeyId = decoded.keyId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token expired' });
  }
}

// --- Workflow Execution Endpoints ---
// Import execution engine dynamically to avoid circular deps
import { executeWorkflow } from './engine';

// Map to store active execution logs for SSE/polling
const executionLogs = new Map<number, string[]>();

app.post('/api/client/workflow/:id/run', clientAuth, async (req: any, res) => {
  const workflowId = req.params.id;
  const userParams = req.body.params || {};
  const clientKeyId = req.clientKeyId;

  // Load workflow
  const workflow = db.prepare('SELECT * FROM workflows WHERE id = ?').get(workflowId) as any;
  if (!workflow) return res.status(404).json({ error: 'Workflow not found' });

  // Verify card key is bound to this app
  const cardKey = db.prepare('SELECT * FROM card_keys WHERE id = ?').get(clientKeyId) as any;
  if (!cardKey || String(cardKey.app_id) !== String(workflow.app_id)) {
    return res.status(403).json({ error: 'No access to this workflow' });
  }

  // Check execution mode restrictions
  if (cardKey.execution_mode === 'one_success' && cardKey.status === 'used') {
    return res.status(403).json({ error: '该口令已执行成功过，不可再次使用' });
  }
  if (cardKey.execution_mode === 'time_period') {
    const now = new Date();
    if (cardKey.valid_from && new Date(cardKey.valid_from + 'Z') > now) {
      return res.status(403).json({ error: '该口令尚未到有效期' });
    }
    if (cardKey.valid_until && new Date(cardKey.valid_until + 'Z') < now) {
      return res.status(403).json({ error: '该口令已过有效期' });
    }
  }

  // Create execution record
  const execResult = db.prepare('INSERT INTO executions (workflow_id, user_key_id, status) VALUES (?, ?, ?)').run(workflowId, clientKeyId, 'running');
  const executionId = execResult.lastInsertRowid as number;
  executionLogs.set(executionId, []);

  // Return execution ID immediately, run async
  res.json({ success: true, execution_id: executionId });

  // Execute workflow asynchronously
  try {
    const nodes = JSON.parse(workflow.nodes || '[]');
    const edges = JSON.parse(workflow.edges || '[]');

    const result = await executeWorkflow(nodes, edges, { ...userParams, __key_string: cardKey.key_string }, (log) => {
      const logs = executionLogs.get(executionId) || [];
      logs.push(log);
      executionLogs.set(executionId, logs);
    });

    db.prepare('UPDATE executions SET status = ?, context = ?, logs = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(result.status, JSON.stringify(result.context), result.logs.join('\n'), executionId);

    // If execution_mode is 'one_success' and workflow succeeded, disable the key
    if (result.status === 'success' && cardKey.execution_mode === 'one_success') {
      db.prepare('UPDATE card_keys SET status = ?, used_at = CURRENT_TIMESTAMP WHERE id = ?').run('used', clientKeyId);
    }
  } catch (err: any) {
    db.prepare('UPDATE executions SET status = ?, logs = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('failed', `Fatal error: ${err.message}`, executionId);
  }
});

app.get('/api/client/executions/:id', clientAuth, (req: any, res) => {
  const executionId = parseInt(req.params.id);
  
  // Check DB first
  const execution = db.prepare('SELECT * FROM executions WHERE id = ? AND user_key_id = ?').get(executionId, req.clientKeyId) as any;
  if (!execution) return res.status(404).json({ error: 'Execution not found' });

  // If still running, get live logs from memory
  const liveLogs = executionLogs.get(executionId);
  
  if (execution.status === 'running' && liveLogs) {
    return res.json({
      id: execution.id,
      status: 'running',
      logs: liveLogs,
    });
  }

  // Clean up memory logs when done
  if (execution.status !== 'running') {
    executionLogs.delete(executionId);
  }

  return res.json({
    id: execution.id,
    status: execution.status,
    logs: execution.logs ? execution.logs.split('\n') : [],
    context: execution.context ? JSON.parse(execution.context) : {},
    started_at: execution.started_at,
    finished_at: execution.finished_at,
  });
});

// Get all workflows for a given app (client-side)
app.get('/api/client/apps/:id/workflows', clientAuth, (req: any, res) => {
  const appId = req.params.id;
  // Verify card key is bound to this app
  const cardKey = db.prepare('SELECT * FROM card_keys WHERE id = ?').get(req.clientKeyId) as any;
  if (!cardKey || String(cardKey.app_id) !== String(appId)) {
    return res.status(403).json({ error: 'No access' });
  }
  const workflows = db.prepare('SELECT id, name, trigger_id FROM workflows WHERE app_id = ?').all(appId);
  res.json(workflows);
});

// --- Settings CRUD ---
const AI_SETTINGS_KEYS = ['ai_api_url', 'ai_api_key', 'ai_model_id', 'ai_system_prompt', 'inventory_alert_threshold'];

app.get('/api/admin/settings', adminAuth, (req, res) => {
  const result: Record<string, string> = {};
  for (const key of AI_SETTINGS_KEYS) {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as any;
    if (row) {
      // Mask the API key for security
      if (key === 'ai_api_key' && row.value) {
        result[key] = row.value.length > 8
          ? row.value.slice(0, 4) + '****' + row.value.slice(-4)
          : '****';
      } else {
        result[key] = row.value;
      }
    }
  }
  res.json(result);
});

app.post('/api/admin/settings', adminAuth, (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Invalid settings' });
  }
  const upsert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  const saveMany = db.transaction((entries: [string, string][]) => {
    for (const [key, value] of entries) {
      if (AI_SETTINGS_KEYS.includes(key)) {
        upsert.run(key, value);
      }
    }
  });
  saveMany(Object.entries(settings));
  res.json({ success: true });
});

// --- AI Chat Proxy ---
app.post('/api/admin/ai/chat', adminAuth, async (req, res) => {
  const { messages, node_context } = req.body;

  // Load AI settings
  const getVal = (key: string) => {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as any;
    return row?.value || '';
  };

  const apiUrl = getVal('ai_api_url');
  const apiKey = getVal('ai_api_key');
  const modelId = getVal('ai_model_id');
  const systemPrompt = getVal('ai_system_prompt');

  if (!apiUrl || !apiKey || !modelId) {
    return res.status(400).json({ error: '请先在系统设置中配置 AI API（URL、Key、模型）' });
  }

  // Build messages array with system prompt
  const fullMessages: any[] = [];

  if (systemPrompt) {
    let enrichedPrompt = systemPrompt;
    // Append current workflow context if provided
    if (node_context) {
      enrichedPrompt += `\n\n## 当前工作流上下文\n${node_context}`;
    }
    fullMessages.push({ role: 'system', content: enrichedPrompt });
  }

  if (Array.isArray(messages)) {
    fullMessages.push(...messages);
  }

  try {
    let endpoint = apiUrl.replace(/\/+$/, '');
    if (!endpoint.endsWith('/chat/completions')) {
      if (endpoint.match(/\/v\d+$/)) {
        endpoint += '/chat/completions';
      } else {
        endpoint += '/v1/chat/completions';
      }
    }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `AI API 错误 (${response.status}): ${errText.slice(0, 200)}` });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';
    res.json({ reply, usage: data.usage });
  } catch (err: any) {
    res.status(500).json({ error: `AI API 请求失败: ${err.message}` });
  }
});

// AI connection test
app.post('/api/admin/ai/test', adminAuth, async (req, res) => {
  const { api_url, api_key, model_id } = req.body;
  if (!api_url || !api_key || !model_id) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  try {
    let endpoint = api_url.replace(/\/+$/, '');
    if (!endpoint.endsWith('/chat/completions')) {
      if (endpoint.match(/\/v\d+$/)) {
        endpoint += '/chat/completions';
      } else {
        endpoint += '/v1/chat/completions';
      }
    }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`,
      },
      body: JSON.stringify({
        model: model_id,
        messages: [{ role: 'user', content: 'Hi, respond with "OK" only.' }],
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(400).json({ error: `连接失败 (${response.status}): ${errText.slice(0, 200)}` });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';
    res.json({ success: true, reply });
  } catch (err: any) {
    res.status(500).json({ error: `连接失败: ${err.message}` });
  }
});

// --- Vite Middleware ---
async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
