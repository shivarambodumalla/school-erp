require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Pool Config
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Start the server first, then try DB connection
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

  // Test DB Connection (non-fatal)
  pool.query('SELECT NOW()')
    .then((res) => {
      console.log('Connected to Database:', res.rows[0]);
    })
    .catch((err) => {
      console.warn('Warning: Could not connect to the database.', err.message);
      console.warn('The API will continue running without database connectivity.');
    });
});

// Handle pool errors to prevent crashes
pool.on('error', (err) => {
  console.error('Unexpected database pool error', err.message);
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});
