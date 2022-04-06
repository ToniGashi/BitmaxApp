const { dbConnector } = require('../database/dbConnect');
const pool = dbConnector();

async function newQuery(query, values) {
  const result = await pool.query({
      text: query,
      values
  });
  return result.rows;
}

module.exports = {
  newQuery,
};
