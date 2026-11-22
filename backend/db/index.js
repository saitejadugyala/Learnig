const { Pool } = require('pg');

let pool = null;

/**
 * Initialize the database connection pool.
 * Reads configuration from environment variables.
 */
function connectDatabase() {
  if (pool) {
    return;
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // additional config options can go here
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
}

/**
 * Close all active connections in the pool.
 */
async function closeDatabaseConnection() {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
}

/**
 * Perform a SQL query with parameters.
 *
 * @param {string} text - The SQL query text.
 * @param {Array} params - The parameters for the query.
 * @returns {Promise} - Resolves with the query result.
 */
async function performQuery(text, params) {
  if (!pool) {
    throw new Error('Database not connected. Call connectDatabase first.');
  }

  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

module.exports = {
  connectDatabase,
  closeDatabaseConnection,
  performQuery
};
