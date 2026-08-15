import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));

const DB_FILE = path.join(__dirname, 'db.json');

// Initialize DB if it doesn't exist
async function initDB() {
  try {
    await fs.access(DB_FILE);
  } catch (err) {
    await fs.writeFile(DB_FILE, JSON.stringify({}), 'utf8');
  }
}

// Get collection
app.get('/api/store/:collection', async (req, res) => {
  const { collection } = req.params;
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    const db = JSON.parse(data);
    res.json(db[collection] || null);
  } catch (error) {
    console.error('Error reading collection:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Update collection
app.post('/api/store/:collection', async (req, res) => {
  const { collection } = req.params;
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    const db = JSON.parse(data);
    db[collection] = req.body;
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving collection:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

const PORT = process.env.PORT || 3001;
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
  });
});
