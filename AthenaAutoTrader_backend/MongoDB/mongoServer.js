const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
// Hard-coded configuration
const app = express();
const PORT = 3000;
const MONGO_URI = 'mongodb+srv://AthenaAutoTrader:hackUPC2025winner!@athena.4buv5xy.mongodb.net/';
const DB_NAME = 'stock_db';

let client;
let isConnected = false;

async function connectMongo() {
  if (!isConnected) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    isConnected = true;
    console.log('Connected to MongoDB');
  }
}

async function getStockData(ticker, startDate, endDate) {
  if (!ticker || !startDate || !endDate) {
    throw new Error('ticker, startDate, and endDate are required');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const collectionName = `${ticker}_data`;

  await connectMongo();
  const db = client.db(DB_NAME);
  const collection = db.collection(collectionName);

  const query = { Date: { $gte: start, $lte: end } };
  const options = { sort: { Date: 1 }, projection: { _id: 0 } };

  const results = await collection.find(query, options).toArray();
  return results;
}

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Endpoint: GET /api/stock?symbol=XYZ&start=YYYY-MM-DD&end=YYYY-MM-DD
app.get('/api/stock', async (req, res) => {
  try {
    console.log('Received request:', req.query);
    if (!req.query.symbol || !req.query.start || !req.query.end) {
      return res.status(400).json({ success: false, error: 'Missing required query parameters' });
    }
    const { symbol, start, end } = req.query;
    const data = await getStockData(symbol, start, end);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching stock data:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Close MongoDB connection on SIGINT
process.on('SIGINT', async () => {
  if (isConnected) {
    await client.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
