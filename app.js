require('dotenv').config()
const express = require('express');
const http = require('http');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v1: uuidv1 } = require('uuid');
const bodyParser = require('body-parser');
const cors = require("cors");
const { authenticateJWT } = require('./middleware/authJWT')
const { dbConnector } = require('./middleware/dbConnect');
const cookieParser = require('cookie-parser');
const { checkRequirements } = require('./middleware/config');
const port = 3000;
const pool = dbConnector();
const app = express();

const corsOptions = {
  origin:'*', 
  credentials:true,
  optionSuccessStatus:200,
}

app.use(cors(corsOptions))
app.use(bodyParser.json());
app.use(express.json())
app.use(cookieParser());
const WebSocket = require('ws');
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: '*' },
  pingInterval: 2000,
  pingTimeout: 5000
})
server.listen(3005, () => { console.log('IO socket listening to port 3005!');});
const wss = new WebSocket('wss://www.bitmex.com/realtime?subscribe=instrument:XBTUSD,instrument:ETHUSD,instrument:LTCUSD');

wss.on('open', function () {
  wss.send('Connectiong to Bitmex');
})

io.on('connection', (message) => {
  console.log('=> USER HAS CONNECTED <=');
  wss.on("message", async function (message) {
    const JSONMessage = JSON.parse(message);
    if(JSONMessage?.data?.[0]?.symbol && JSONMessage?.data?.[0]?.rootSymbol && JSONMessage?.data?.[0]?.fairPrice) { // This only happens on the first time they send a message so this is when we will add them to database. For that we need name, symbol and price
      try {
        await createTicker(JSONMessage.data[0].fairPrice, JSONMessage.data[0].rootSymbol, JSONMessage.data[0].symbol);
        io.emit('message', await getTicker());
      } catch (err) {
        console.log('[SOCKET ERROR]: ', err);
      }
    }
    if(JSONMessage?.data?.[0]?.fairPrice) { // Once we see a change in fair price which is the variable I am using for the price, we update the database. Now the database will always have live data.
      try{
        const tickerByName = await newQuery(`SELECT t.id, t.name, t.symbol, d.Date, d.price FROM tickers t INNER JOIN ticker_data d ON t.id = d.ticker_id WHERE t.name=$1 LIMIT 1`, [JSONMessage.data[0].symbol]);
        if(tickerByName && tickerByName.price !==JSONMessage.data[0].fairPrice) {
          updateTicker(tickerByName[0].id, tickerByName[0].symbol, tickerByName[0].name, JSONMessage.data[0].fairPrice)
          io.emit('message', await getTicker());
        }
      } catch (err) {
        console.log('[SOCKET ERROR]: ', err);
      }
    }
  });
})

app.use(bodyParser.json());
app.use(express.json())

try {
  checkRequirements();
} catch (err) {
  console.log(err.message);
  return;
}

app.get('/ticker', authenticateJWT, async function(req, res) {
  console.log('=> STARTED GET TICKER <=');
  try{
    console.log('[DEBUG]: Sending the request to database');
    const resp = await getTicker();
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

async function getTicker() {
  return newQuery(`SELECT t.id, t.name, t.symbol, d.Date, d.price FROM tickers t INNER JOIN ticker_data d ON t.id = d.ticker_id`, []);
}

app.put('/ticker', authenticateJWT, async function(req, res) { // Updates ticker by id
  console.log('=> STARTED UPDATE TICKER <=');
  try{
    const { id, symbol, name, price } = req.body;
    if(!id || !symbol || !name || !price) {
      throw new Error('Data missing in request');
    }
    await updateTicker(id, symbol, name, price)
    console.log("Ticker updated successfully");
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

async function updateTicker(id, symbol, name, price){
  const date = new Date();
  console.log('[DEBUG]: Sending the first request to ticker_data from database');
  await newQuery(`UPDATE ticker_data SET Date=$1, price=$2 WHERE ticker_id=$3`, [date, price, id]);
  console.log('[DEBUG]: Sending the second request to tickers from database');
  await newQuery(`UPDATE tickers SET name=$1, symbol=$2 WHERE id=$3`, [name, symbol, id]);
}
app.delete('/ticker', authenticateJWT, async function(req, res) {
  console.log('=> STARTED DELETE TICKER <=');
  try {
    const { id } = req.body;
    if(!id) {
      throw new Error('ID not provided');
    }
    await newQuery(`DELETE FROM ticker_data WHERE ticker_id=$1`, [id]);
    await newQuery(`DELETE FROM tickers WHERE id=$1`, [id]);
    console.log("Ticker deleted successfully");
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

app.post('/ticker', authenticateJWT, async function(req, res) {
  console.log('=> STARTED CREATE TICKER <=');
  try {
    const { price, symbol, name } = req.body;
    if(!symbol || !name || !price) {
      throw new Error('Data missing in request');
    }
    await createTicker(price, symbol, name);
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

async function createTicker (price, symbol, name) {
  console.log('=> STARTED CREATE TICKER <=');

  const id = uuidv1();
  
  const date = new Date();

  console.log('[DEBUG]: Sending the request to database');
  try {
    await newQuery(`INSERT INTO tickers (id, symbol, name) VALUES ($1, $2, $3)`, [id, symbol, name]);
    await newQuery(`INSERT INTO ticker_data (ticker_id, date, price) VALUES ($1, $2, $3)`, [id, date, price]);
    console.log('[DEBUG]: Ticker created successfully');
    return 'Success'
  } catch (err) {
    const error =  new Error(err.message)
    error.statusCode = 400
    throw error;
  }
}

app.post('/user', authenticateJWT, async function(req, res) {
  try {
    const { email, password } = req.body;
    await createUser(email, password);
    return res.send({
      status: 200,
      message: 'User created successfully'
    })
  } catch (err) {
    console.log('[ERROR]: ', err.message);
    return res.status(err.statusCode || 500).send({
      error: { message: err.message, status:err.statusCode },
    });
  }
});

app.post('/login', async function(req, res) {
  try {
    const { email, password } = req.body;
    await loginUser(email, password)
    const accessToken = jwt.sign({ username: email }, process.env.JWT_SECRET_TOKEN);
    console.log('[DEBUG]: Access token generated');
    res.cookie('accessToken', accessToken, { maxAge: 900000 });
    return res.send({
      status: 200,
      message: 'User login successfully'
    })
  } catch (err) {
    console.log('[ERROR]: ', err.message);
    res.status(err.statusCode || 500).send({
      error: { message: err.message, status:err.statusCode },
    });
  }
});

app.get('/', function(req, res) {
  console.log('Server connection is alive');
});

app.listen(port, function() {
  console.log(`App listening on port ${port}!`)
});

function validateEmail(email) {
  if(String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
    return true;
  } else {
    const error =  new Error('Invalid email');
    error.statusCode = 400;
    throw error;
  }
}

function validatePassword(pass) {
  if( /[A-Z]/.test(pass) &&
      /[a-z]/       .test(pass) &&
      /[0-9]/       .test(pass) &&
      /[^A-Za-z0-9]/.test(pass) &&
      pass.length > 4) {
    return true;
  } else {
    const error =  new Error('Invalid password');
    error.statusCode = 400;
    throw error;
  }
}

async function createUser(email, password) {
  console.log('=> STARTED CREATE USER <=');

  validateEmail(email);
  console.log('[DEBUG]: Email validated');

  validatePassword(password);
  console.log('[DEBUG]: Password validated');

  console.log('[DEBUG]: Hashing the password');
  const hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS))

  console.log('[DEBUG]: Sending the request to database');
  try {
    await newQuery(`INSERT INTO users (email, dhash) VALUES ($1, $2)`, [email, hash]);
    console.log('[DEBUG]: User created successfully');
    return;
  } catch (err) {
    const error =  new Error('Email already exists')
    error.statusCode = 400
    throw error;
  }
}

async function loginUser(email, password) {
  console.log('=> STARTED LOGIN USER <=');
  
  validateEmail(email);
  console.log('[DEBUG]: Email validated');

  validatePassword(password);
  console.log('[DEBUG]: Password validated');

  console.log('[DEBUG]: Sending the request to database');
  try {
    const resp = await newQuery(`SELECT * FROM users WHERE email=$1`, [email]);
    if (resp) {
      const isValid = await bcrypt.compare(password, resp[0].dhash);
      if (isValid) {
        console.log('[DEBUG]: User retrieved successfully');
        return;
      } else {
        throw new Error('Wrong password');
      }
    } else {
      throw new Error('User not found');
    }
  } catch (err) {
    const error =  new Error(err.message);
    error.statusCode = 404;
    throw error;
  }
}

async function newQuery(query, values) {
  var result = await pool.query({
      text: query,
      values
  });
  return result.rows;
}
