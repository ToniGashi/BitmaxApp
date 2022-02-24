const { Pool } = require('pg')

const dbConnector = (req, res, next) => {
  req.pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  })

  next();
};

module.exports = {
  dbConnector,
};
