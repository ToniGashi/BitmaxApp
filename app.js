require('dotenv').config()
const { Pool } = require('pg')
// const express = require('express');
// const app = express();
// app.use(express.json())
// const port = 3000;

// const { Pool } = require('pg')

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
//   port: process.env.DB_PORT,
// })

// app.post('/createUser', async function(req, res) {
//   console.log(req.body);
//   const { email, password } = req.body;
//   try {
//     const user = await createUser(email, password)
//     console.log('Current user: ', user);
//   } catch (err) {
//     res.status(err.status || 400).send({
//       error: { message: err.message },
//     });
//   }
// });

// app.post('/login', function(req, res) {
//   const { email, password } = req.body;
//   try {
//     const user = loginUser(email, password)
//     console.log('Current user: ', user);
//   } catch (err) {
//     res.status(err.status || 400).send({
//       error: { message: err.message },
//     });
//   }
// });

// app.get('/', function(req, res) {
//   console.log('Server connection is alive');
// });

// app.listen(port, function() {
//   console.log(`Example app listening on port ${port}!`)
// });

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
})

function validateEmail(email) {
  if(String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
    return true;
  } else {
    throw new Error('Invalid email')
  }
}

function validatePassword(pass) {
  if(String(pass).toLowerCase().match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/)) {
    return true;
  } else {
    throw new Error('Invalid password')
  }
}

async function createUser(email, password) {
  console.log(email, ':::::::::', password);
  console.log('=> STARTED CREATE USER <=');
  validateEmail(email);
  console.log('[DEBUG]: Email validated');
  validatePassword(password);
  console.log('[DEBUG]: Password validated');

  pool.connect();
  try {
    const response = await pool.query(`INSERT INTO users (email, password) VALUES ('${email}', '${password}')`);
    if(response){
      console.log('[DEBUG]: User created successfully');
      return 'User created successfully';
    } else {
      console.log('[DEBUG]: User creation failed');
      return 'Something unexpected went wrong'
    }
  } catch (err) {
    console.log(err);
    throw new Error('Error with the query');
  }
}

async function loginUser(email, password) {
  console.log('=> STARTED LOGIN USER <=');
  validateEmail(email);
  console.log('[DEBUG]: Email validated');
  validatePassword(password);
  console.log('[DEBUG]: Password validated');
  pool.connect();
  try {
    const response = await pool.query(`SELECT * FROM users WHERE email='${email}' AND password='${password}'`);
    if(response.rowCount>0) {
      console.log('[DEBUG]: User logged in successfully');
      return response.data;
    } else {
      console.log('[DEBUG]: User not found');
      throw new Error('User not found');
    }
  } catch (err) {
    console.log(err);
    throw new Error('Error with the query');
  }
}

module.exports = {
  createUser,
  loginUser
}

require('make-runnable/custom')({
  printOutputFrame: false
})
