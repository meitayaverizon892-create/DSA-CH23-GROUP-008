require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    console.log('Current time from DB:', result.rows[0].now);
    pool.end();
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log('Error:', error.message);
  }
}

testConnection();