// Manual mock setup
const mockReadFile = jest.fn();
const mockWriteFile = jest.fn();

jest.doMock('fs', () => ({
  promises: {
    readFile: mockReadFile,
    writeFile: mockWriteFile,
  },
}));

const request = require('supertest');
const express = require('express');

let itemsRouter;
let statsRouter;
let app;

beforeEach(() => {
  jest.resetModules();
  mockReadFile.mockClear();
  mockWriteFile.mockClear();

  // Re-import after clearing modules
  itemsRouter = require('./items');
  statsRouter = require('./stats');

  app = express();
  app.use(express.json());
  app.use('/api/items', itemsRouter);
  app.use('/api/stats', statsRouter);

  if (typeof statsRouter._resetCache === 'function') {
    statsRouter._resetCache();
  }
});

describe('API: /api/items', () => {
  it('GET /api/items returns all items', async () => {
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify([
        { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
        { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
        { id: 3, name: 'Ultra‑Wide Monitor', category: 'Electronics', price: 999 },
        { id: 4, name: 'Ergonomic Chair', category: 'Furniture', price: 799 },
        { id: 5, name: 'Standing Desk', category: 'Furniture', price: 1199 },
        { id: 6, name: 'Mockphone Pro', category: 'Electronics', price: 999 },
      ])
    );

    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(6);
    expect(res.body[0].name).toBe('Laptop Pro');
  });

  it('GET /api/items supports query and limit', async () => {
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify([
        { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
        { id: 3, name: 'Ultra‑Wide Monitor', category: 'Electronics', price: 999 },
      ])
    );

    const res = await request(app).get('/api/items?q=monitor&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Ultra‑Wide Monitor');
  });

  it('GET /api/items/:id returns correct item', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify([{ id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 }]));

    const res = await request(app).get('/api/items/1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Laptop Pro');
  });

  it('POST /api/items creates new item', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify([]));
    mockWriteFile.mockResolvedValueOnce();

    const res = await request(app).post('/api/items').send({ name: 'Mockphone Pro', category: 'Electronics', price: 999 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Mockphone Pro');
    expect(res.body).toHaveProperty('id');
  });

  it('GET /api/items/:id returns 404 if not found', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify([]));
    const res = await request(app).get('/api/items/999');
    expect(res.status).toBe(404);
  });
});

describe('API: /api/stats', () => {
  let originalNow;
  let now;

  beforeEach(() => {
    originalNow = Date.now;
    now = 1000000;
    global.Date.now = jest.fn(() => now);
  });

  afterEach(() => {
    global.Date.now = originalNow;
  });

  it('GET /api/stats returns stats from cache if valid', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify([{ price: 10 }, { price: 20 }, { price: 30 }]));

    await request(app).get('/api/stats');
    const res = await request(app).get('/api/stats');

    expect(mockReadFile).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 3, averagePrice: 20 });
  });

  it('GET /api/stats recalculates after TTL expires', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify([{ price: 10 }, { price: 20 }, { price: 30 }]));

    await request(app).get('/api/stats');
    now += 6 * 60 * 1000; // Advance time by 6 minutes

    mockReadFile.mockResolvedValueOnce(JSON.stringify([{ price: 40 }, { price: 60 }]));

    const res = await request(app).get('/api/stats');

    expect(mockReadFile).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 2, averagePrice: 50 });
  });

  it('GET /api/stats handles empty items', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify([]));
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 0, averagePrice: 0 });
  });

  it('GET /api/stats calls next on read error', async () => {
    mockReadFile.mockRejectedValueOnce(new Error('fail'));
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(500);
  });
});
