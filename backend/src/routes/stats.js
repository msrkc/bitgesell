const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
let statsCache = null;
let lastCacheTime = 0;

// Helper to calculate stats
function calculateStats(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { total: 0, averagePrice: 0 };
  }
  const total = items.length;
  const averagePrice = items.reduce((acc, cur) => acc + (cur.price || 0), 0) / total;
  return { total, averagePrice };
}

// Helper to update cache
async function updateCache() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  const items = JSON.parse(raw);
  statsCache = calculateStats(items);
  lastCacheTime = Date.now();
}

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const now = Date.now();
    if (!statsCache || now - lastCacheTime > CACHE_TTL) {
      await updateCache();
    }
    res.json(statsCache);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
