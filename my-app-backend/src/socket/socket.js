const jwt_decode = require("jwt-decode");
const http = require('http');
const WebSocket = require('ws');
const tickerController = require('../controllers/tickerController');
const { newQuery } = require('../database/dbFunctions');

const ioSocket = (app) => {
  const server = http.createServer(app);

  const io = require('socket.io')(server, {
    cors: { origin: '*' },
    autoConnect: false,
    reconnection: false,
    pingInterval: 2000,
  });

  server.listen(3007, () => { console.log('IO socket listening to port 3007!');});
  const wss = new WebSocket('wss://www.bitmex.com/realtime?subscribe=instrument:XBTUSD,instrument:ETHUSD,instrument:LTCUSD');
  
  wss.on('open', function () {
    console.log('Connecting to Bitmex');
    wss.send('Connecting to Bitmex');
  })

  wss.on("message", async function (message) {
    const JSONMessage = JSON.parse(message);
    if(JSONMessage?.data?.[0]?.fairPrice) { // Once we see a change in fair price which is the variable I am using for the price, we update the database. Now the database will always have live data.
      try{
        const tickerByName = await newQuery(`SELECT t.id, t.name, t.symbol, d.Date, d.price FROM tickers t INNER JOIN ticker_data d ON t.id = d.ticker_id WHERE t.name=$1 LIMIT 1`, [JSONMessage.data[0].symbol]);
        if(tickerByName?.[0]?.id && tickerByName[0].price !== JSONMessage.data[0].fairPrice) {
          console.log('Updating tickers');
          await tickerController.updateTicker(tickerByName[0].id, tickerByName[0].symbol, tickerByName[0].name, JSONMessage.data[0].fairPrice)
        }
      } catch (err) {
        console.log('[SOCKET ERROR]: ', err);
      }
    }
  });

  io.use(async (socket, next) => {
    let userId;
    try {
      userId = await jwt_decode(socket.handshake.query.token).id
    } catch (err) {
      console.log(err);
    }
    if (socket.handshake.query && socket.handshake.query.token){
        socket.userId = userId;
        next();
    } else {
      next(new Error('Authentication error'));
    }
  })
  .on('connection', (socket) => {
    socket.on('disconnect', () => {
      console.log('User disconnected');
    })

    wss.on('message', async (message) => {
      const JSONMessage = JSON.parse(message);
      if(JSONMessage?.data?.[0]?.fairPrice) { // Once we see a change in fair price which is the variable I am using for the price, we update the database. Now the database will always have live data.
        try{
          const tickerByName = await newQuery(`SELECT t.id, t.name, t.symbol, d.Date, d.price FROM tickers t INNER JOIN ticker_data d ON t.id = d.ticker_id WHERE t.name=$1 LIMIT 1`, [JSONMessage.data[0].symbol]);
          if(tickerByName?.[0]?.id && tickerByName[0].price !== JSONMessage.data[0].fairPrice) {
            io.to(socket.id).emit('message', await tickerController.getTicker(socket.userId));
          }
        } catch (err) {
          console.log('[SOCKET ERROR]: ', err);
        }
      }
    })
    console.log('=> USER HAS CONNECTED <=');
    
  })

  return io;
}



module.exports = ioSocket;
