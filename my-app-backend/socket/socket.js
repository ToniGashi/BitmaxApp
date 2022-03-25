
const http = require('http');
const WebSocket = require('ws');
const tickerController = require('../src/controllers/tickerController');
const { newQuery } = require('../database/dbFunctions');
let userId;

const ioSocket = (app) => {
  const server = http.createServer(app);

  const io = require('socket.io')(server, {
    cors: { origin: '*' },
    autoConnect: false,
    reconnection: false,
    pingInterval: 2000,
    pingTimeout: 5000
  });

  server.listen(3007, () => { console.log('IO socket listening to port 3007!');});
  const wss = new WebSocket('wss://www.bitmex.com/realtime?subscribe=instrument:XBTUSD,instrument:ETHUSD,instrument:LTCUSD');
  
  wss.on('open', function () {
    wss.send('Connectiong to Bitmex');
  })

  wss.on("message", async function (message) {
    const JSONMessage = JSON.parse(message);
    if(JSONMessage?.data?.[0]?.fairPrice) { // Once we see a change in fair price which is the variable I am using for the price, we update the database. Now the database will always have live data.
      try{
        console.log('STARTING THE UPDATE OF: ', [JSONMessage.data[0].symbol]);
        const tickerByName = await newQuery(`SELECT t.id, t.name, t.symbol, d.Date, d.price FROM tickers t INNER JOIN ticker_data d ON t.id = d.ticker_id WHERE t.name=$1 LIMIT 1`, [JSONMessage.data[0].symbol]);
        if(tickerByName?.[0]?.id && tickerByName[0].price !== JSONMessage.data[0].fairPrice) {
          await tickerController.updateTicker(tickerByName[0].id, tickerByName[0].symbol, tickerByName[0].name, JSONMessage.data[0].fairPrice)
          if(userId) {
            io.emit('message', await tickerController.getTicker(userId));
          }
        }
      } catch (err) {
        console.log('[SOCKET ERROR]: ', err);
      }
    }
  });
  
  io.on('connection', (socket) => {
    socket.on('userId', (currentUserId) => {
      console.log('entered socket userId');
      userId = currentUserId;
    })
    socket.on('disconnect', () => {
      console.log('User disconnected');
    })
    console.log('=> USER HAS CONNECTED <=');
    
  })

  return io;
}



module.exports = ioSocket;
