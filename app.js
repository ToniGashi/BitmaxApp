require('dotenv').config()
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { authenticateJWT } = require('./middleware/authJWT')
const { dbConnector } = require('./middleware/dbConnect');
const cookieParser = require('cookie-parser');
const port = 3000;
const app = express();

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
      error: { message: err.message },
    });
  }
});

app.post('/login', async function(req, res) {
  try {
    const { email, password } = req.body;
    await loginUser(email, password, req.pool)
    const accessToken = jwt.sign({ username: email }, process.env.JWT_SECRET_TOKEN);
    console.log('[DEBUG]: Access token generated');
    res.cookie('accessToken', accessToken, { maxAge: 900000 });
    return res.send({
      status: 200,
      message: 'User login successfully'
    })
  } catch (err) {
    console.log('[ERROR]: ', err.message);
    return res.status(err.statusCode || 500).send({
      error: { message: err.message },
    });
  }
});

app.get('/', function(req, res) {
  console.log('Server connection is alive');
});

app.listen(port, function() {
  console.log(`App listening on port ${port}!`)
});

function checkRequirements() {
  let errMessage = '';

  if(!process.env.DB_USER) {
    errMessage += "Missing DB_USER in the .env file\n"
  }
  if(!process.env.DB_PASSWORD) {
    errMessage += "Missing DB_PASSWORD in the .env file\n"
  }
  if(!process.env.DB_HOST) {
    errMessage += "Missing DB_HOST in the .env file\n"
  }
  if(!process.env.DB_PORT) {
    errMessage += "Missing DB_PORT in the .env file\n"
  }
  if(!process.env.DB_DATABASE) {
    errMessage += "Missing DB_DATABASE in the .env file\n"
  }
  if(!process.env.JWT_SECRET_TOKEN) {
    errMessage += "Missing JWT_SECRET_TOKEN in the .env file\n"
  }
  if(!process.env.BCRYPT_ROUNDS) {
    errMessage += "Missing BCRYPT_ROUNDS in the .env file\n"
  }

  if(errMessage) {
    throw new Error(errMessage);
  }
}

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

  validateEmail(email);
  console.log('[DEBUG]: Email validated');

  validatePassword(password);
  console.log('[DEBUG]: Password validated');

  console.log('[DEBUG]: Connecting to database');
  await pool.connect();

  console.log('[DEBUG]: Hashing the password');
  const hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS))

  console.log('[DEBUG]: Sending the request to database');
  try {
    await newQuery(`INSERT INTO users (email, dhash) VALUES ($1, $2)`, [email, hash], pool);
    console.log('[DEBUG]: User created successfully');
    return;
  } catch (err) {
    const error =  new Error('Email already exists')
    error.statusCode = 400
    throw error;
  }
}

async function loginUser(email, password, pool) {
  console.log('=> STARTED LOGIN USER <=');
  
  validateEmail(email);
  console.log('[DEBUG]: Email validated');

  validatePassword(password);
  console.log('[DEBUG]: Password validated');

  console.log('[DEBUG]: Connecting to database');

  await pool.connect();

  console.log('[DEBUG]: Sending the request to database');
  try {
    const resp = await newQuery(`SELECT * FROM users WHERE email=$1`, [email], pool);
    if (resp.rows.length > 0) {
      console.log('[DEBUG]: Hashing password');
      const isValid = await bcrypt.compare(password, resp.rows[0][2]);
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

async function newQuery(query, values, pool) {
  var result = await pool.query({
      rowMode: 'array',
      text: query,
      values
  });
  return result;
}
