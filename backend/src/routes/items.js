const express = require('express');
const fs = require('fs').promises; // use async/await
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data asynchronously (alternatively we could use callbacks)
async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    throw error;
  }
}

// Utility to write data asynchronously
async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/items with offset and limit
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { limit = 10, offset = 0, q = '' } = req.query;

    // Convert and validate parameters
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offsetNum = Math.max(0, parseInt(offset) || 0);

    let results = data;

    // Apply search filter
    if (q && q.trim()) {
      const searchTerm = q.toLowerCase().trim();
      // Simple substring search (i would use a proper search library for production)
      results = results.filter((item) => (item.name && item.name.toLowerCase().includes(searchTerm)) || (item.category && item.category.toLowerCase().includes(searchTerm)));
    }

    // Apply offset and limit
    const paginatedResults = results.slice(offsetNum, offsetNum + limitNum);

    // Return simple response
    res.json(paginatedResults);
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      const err = new Error('Invalid ID format');
      err.status = 400;
      throw err;
    }

    const item = data.find((i) => i.id === id);
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // Basic validation
    const { name, category, price, ...otherFields } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      const err = new Error('Name is required and must be a non-empty string');
      err.status = 400;
      throw err;
    }

    const data = await readData();
    const item = {
      id: Date.now(),
      name: name.trim(),
      category: category || 'uncategorized',
      price: parseFloat(price) || 0,
      ...otherFields,
      createdAt: new Date().toISOString(),
    };

    data.push(item);
    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
