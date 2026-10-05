const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = 3210;

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: 'connected' });
  } catch (err) {
    res.status(500).json({ ok: false, db: 'error', error: err.message });
  }
});

//test
app.get('/scan', async (req, res) => {
  try {
    const barcode = String(req.query.barcode || '').trim();

    if (!barcode) {
      return res.status(400).json({ ok: false, error: 'barcode is required' });
    }

    const row = await prisma.product.findUnique({
      where: { boxBarcode: barcode }
    });

    if (!row) {
      return res.status(404).json({ ok: false, error: `Barcode not found: ${barcode}` });
    }

    res.json({
      ok: true,
      barcode,
      id: row.id,
      product_id: row.productId,
      sku: row.sku,
      name: row.productTitle,
      quantity: row.qty,
      type: 'box'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, '127.0.0.1', () =>
  console.log(`API running at http://127.0.0.1:${PORT}`)
);