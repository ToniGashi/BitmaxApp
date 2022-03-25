const express = require('express')
const tickerRouter = express.Router()
const tickerController = require('../controllers/tickerController.js')
const { authenticateJWT } = require('../../middleware/authJWT')
const jwt_decode = require('jwt-decode');

tickerRouter.get('/tickers', authenticateJWT, async function(req, res) {
  console.log('=> STARTED GET TICKER <=');
  try{
    console.log('[DEBUG]: Sending the request to database');
    const userId = jwt_decode(req.cookies.accessToken).id;
    const resp = await tickerController.getTicker(userId);
    res.send({
      message: resp
    })
  } catch (err) {
    console.log('[ERROR]: ', err.message);
    return res.status(err.statusCode || 500).send({
      error: { message: err.message },
    });
  }
})

tickerRouter.put('/tickers', authenticateJWT, async function(req, res) { // Updates ticker by id
  console.log('=> STARTED UPDATE TICKER <=');
  try{
    const { id, symbol, name, price } = req.body;
    if(!id || !symbol || !name || !price) {
      throw new Error('Data missing in request');
    }
    await tickerController.updateTicker(id, symbol, name, price)
    console.log("[DEBUG]: Ticker updated successfully");
    res.send({
      status: 200,
      message: "Ticker updated successfully"
    })
  }catch (err) {
    console.log('[ERROR]: ', err.message);
    return res.status(err.statusCode || 500).send({
      error: { message: err.message },
    });
  }
})

tickerRouter.delete('/tickers', authenticateJWT, async function(req, res) {
  console.log('=> STARTED DELETE TICKER <=');
  try {
    const { id } = req.body;
    if(!id) {
      throw new Error('ID not provided');
    }
    const userId = jwt_decode(req.cookies.accessToken).id;
    await tickerController.deleteTicker(id, userId);
    console.log("[DEBUG]: Ticker deleted successfully");
    res.status(200).send({
      status: 200,
      message: "Ticker deleted successfully"
    })
  } catch (err) {
    console.log('[ERROR]: ', err.message);
    return res.status(err.statusCode || 500).send({
      error: { message: err.message },
    });
  }
})

tickerRouter.post('/tickers', authenticateJWT, async function(req, res) {
  console.log('=> STARTED CREATE TICKER <=');
  try {
    const { price, symbol, name } = req.body;
    if(!symbol || !name || !price) {
      throw new Error('Data missing in request');
    }
    const userId = jwt_decode(req.cookies.accessToken).id;
    await tickerController.createTicker(price, symbol, name, userId);
    console.log("[DEBUG]: Ticker created successfully");
    return res.send({
      status: 200,
      message: 'Ticker created successfully'
    })
  } catch (err) {
    console.log('[ERROR]: ', err.message);
    return res.status(err.statusCode || 500).send({
      error: { message: err.message },
    });
  }
})

tickerRouter.get('/tickerData', authenticateJWT, async function(req, res) {
  console.log('=> STARTED GET TICKER DATA <=');
  try{
    const {tickerId} = req.query;
    console.log('[DEBUG]: Sending the request to database');
    const resp = await tickerController.getTickerData(tickerId);
    res.send({
      message: resp
    })
  } catch (err) {
    console.log('[ERROR]: ', err.message);
    return res.status(err.statusCode || 500).send({
      error: { message: err.message },
    });
  }
})

module.exports = tickerRouter
