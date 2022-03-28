const {newQuery} = require('../../database/dbFunctions');
const { dbConnector } = require('../../database/dbConnect');
const { v1: uuidv1 } = require('uuid');
const pool = dbConnector();

const tickerController = {
  async getTickerData(tickerId) {
    return newQuery(`SELECT * FROM ticker_data WHERE ticker_data.ticker_id=$1`, [tickerId]);
  },
  async getTicker() {
    return newQuery(
      `SELECT DISTINCT ON (tickers.id)
      tickers.*, td.price, td.Date, u.id as user_id
      FROM tickers
      INNER JOIN ticker_data td
      ON td.ticker_id = tickers.id
      LEFT JOIN user_tickers ut
      ON ut.ticker_id = tickers.id
      LEFT JOIN users u
      ON u.id = ut.user_id`);
  },
  async updateTicker(id, symbol, name, price){
    const date = new Date();
    await pool.query('BEGIN')
      await newQuery(`UPDATE tickers SET name=$1, symbol=$2 WHERE id=$3`, [name, symbol, id]);
      await newQuery(`INSERT INTO ticker_data (Date,price,ticker_id) VALUES ($1,$2,$3)`, [date, price, id]);
    await pool.query('COMMIT')
  },
  async createTicker(price, symbol, name, userId) {
    const id = uuidv1();
  
    const date = new Date();
  
    try {
      await pool.query('BEGIN')
        await newQuery(`INSERT INTO tickers (id, symbol, name) VALUES ($1, $2, $3)`, [id, symbol, name]);
        await newQuery(`INSERT INTO ticker_data (ticker_id, date, price) VALUES ($1, $2, $3)`, [id, date, price]);
        await newQuery(`INSERT INTO user_tickers (user_id, ticker_id) VALUES ($1, $2)`, [userId, id])
      await pool.query('COMMIT')
      return;
    } catch (err) {
      const error =  new Error(err.message)
      error.statusCode = 400
      throw error;
    }
  },
  async deleteTicker(id, userId) {
    await pool.query('BEGIN')
      await newQuery(`DELETE FROM ticker_data WHERE ticker_id=$1`, [id]);
      await newQuery(`DELETE FROM user_tickers WHERE user_id=$1 AND ticker_id=$2`, [userId, id]);
      await newQuery(`DELETE FROM tickers WHERE id=$1`, [id]);
    await pool.query('COMMIT')
  }
}

module.exports = tickerController;
