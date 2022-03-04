require('dotenv').config()
const express = require('express');
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
const app = express();

const corsOptions = {
  origin:'http://localhost:3001', 
  credentials:true,
  optionSuccessStatus:200,
}

app.use(cors(corsOptions))
app.use(bodyParser.json());
app.use(express.json())
app.use(dbConnector);
app.use(cookieParser());

try {
  checkRequirements();
} catch (err) {
  console.log(err.message);
  return;
}

app.get('/ticker', authenticateJWT, async function(req, res) {
  console.log('=> STARTED GET TICKER<=');
  try{
    const userId = jwt.verify(req.cookies['accessToken'], process.env.JWT_SECRET_TOKEN).id;
    console.log('[DEBUG]: Sending the request to database');
    const userTickers = await newQuery('SELECT t.id, t.name, t.symbol, td.price FROM user_tickers ut INNER JOIN tickers t ON ut.ticker_id = t.id INNER JOIN ticker_data td ON td.ticker_id=t.id INNER JOIN users u ON u.id=ut.user_id WHERE u.id=$1', [userId], req.pool);
    console.log("[DEBUG]: Tickers retrieved successfully");
    res.send({
      message: userTickers
    })
  } catch (err) {
    console.log('[ERROR]: ', err.message);
    return res.status(err.statusCode || 500).send({
      error: { message: err.message },
    });
  }
})

app.put('/ticker', authenticateJWT, async function(req, res) {
  console.log('=> STARTED UPDATE TICKER <=');
  try{
    const { id, symbol, name, price } = req.body;
    if(!id || !symbol || !name || !price) {
      throw new Error('Data missing in request');
    }
    const date = new Date();
    
    await req.pool.query('BEGIN')
      await newQuery(`UPDATE ticker_data SET Date=$1, price=$2 WHERE ticker_id=$3`, [date, price, id], req.pool);
      await newQuery(`UPDATE tickers SET name=$1, symbol=$2 WHERE id=$3`, [name, symbol, id], req.pool);
    await req.pool.query('COMMIT')

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

app.delete('/ticker', authenticateJWT, async function(req, res) {
  console.log('=> STARTED DELETE TICKER <=');
  try {
    const userId = jwt.verify(req.cookies['accessToken'], process.env.JWT_SECRET_TOKEN).id;
    const { id } = req.body;
    if(!id) {
      throw new Error('ID not provided');
    }
    await req.pool.query('BEGIN')
      await newQuery(`DELETE FROM user_tickers WHERE user_id=$1 AND ticker_id=$2`, [userId, id], req.pool);
      await newQuery(`DELETE FROM ticker_data WHERE ticker_id=$1`, [id], req.pool);
      await newQuery(`DELETE FROM tickers WHERE id=$1`, [id], req.pool);
    await req.pool.query('COMMIT')
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

app.post('/ticker', authenticateJWT, async function(req, res) {
  console.log('=> STARTED CREATE TICKER <=');
  try {
    const userId = jwt.verify(req.cookies['accessToken'], process.env.JWT_SECRET_TOKEN).id;
    const { price, symbol, name } = req.body;
    if(!symbol || !name || !price) {
      throw new Error('Data missing in request');
    }
    const date = new Date();
    await createTicker(date, price, symbol, name, req.pool, userId);
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

async function createTicker(date, price, symbol, name, pool, userId) {
  console.log('=> STARTED CREATE TICKER <=');

  const id = uuidv1();

  console.log('[DEBUG]: Sending the request to database');
  try {
    await pool.query('BEGIN')
      await newQuery(`INSERT INTO tickers (id, symbol, name) VALUES ($1, $2, $3)`, [id, symbol, name], pool);
      await newQuery(`INSERT INTO ticker_data (ticker_id, date, price) VALUES ($1, $2, $3)`, [id, date, price], pool);
      await newQuery(`INSERT INTO user_tickers (user_id, ticker_id) VALUES ($1, $2)`, [userId, id], pool)
    await pool.query('COMMIT')
    console.log('[DEBUG]: User Ticker successfully');
    return;
  } catch (err) {
    const error =  new Error(err.message)
    error.statusCode = 400
    throw error;
  }
}

app.post('/user', authenticateJWT, async function(req, res) {
  try {
    const { email, password } = req.body;
    await createUser(email, password, req.pool);
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
    const resp = await loginUser(email, password, req.pool)
    const accessToken = jwt.sign({ username: email, id: resp.rows[0].id }, process.env.JWT_SECRET_TOKEN);
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

async function createUser(email, password, pool) {
  console.log('=> STARTED CREATE USER <=');
  try {
    validateEmail(email);
    console.log('[DEBUG]: Email validated');
    validatePassword(password);
    console.log('[DEBUG]: Password validated');
  } catch (error) {
    throw error;
  }

  console.log('[DEBUG]: Hashing the password');
  const hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS))

  console.log('[DEBUG]: Sending the request to database');
  try {
    const id = uuidv1();
    await newQuery(`INSERT INTO users (id, email, dhash) VALUES ($1, $2, $3)`, [id, email, hash], pool);
    console.log('[DEBUG]: User created successfully');
    return;
  } catch (err) {
    console.log('[ERROR]: ', err);
    const error =  new Error('Email already exists')
    error.statusCode = 409
    throw error;
  }
}

async function loginUser(email, password, pool) {
  console.log('=> STARTED LOGIN USER <=');
  try {
  validateEmail(email);
  console.log('[DEBUG]: Email validated');
  validatePassword(password);
  console.log('[DEBUG]: Password validated');
  } catch (err) {
    throw err;
  }

  console.log('[DEBUG]: Connecting to database');
  await pool.connect();

  console.log('[DEBUG]: Sending the request to database');
  try {
    const resp = await newQuery(`SELECT * FROM users WHERE email=$1`, [email], pool);
    if (resp) {
      let isValid;
      if(resp.rows?.[0]?.dhash) {
        isValid = await bcrypt.compare(password, resp.rows[0].dhash);
      }
      if (isValid) {
        console.log('[DEBUG]: User retrieved successfully');
        return resp;
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

async function newQuery(query, values, pool) {
  var result = await pool.query({
      text: query,
      values
  });
  return result;
}
