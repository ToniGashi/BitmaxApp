require('dotenv').config()
const { Pool } = require('pg')
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
})

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

  return errMessage;
}

function isValidEmail(email) {
  if(String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
    return true;
  } else {
    return false;
  }
}

function isValidPassword(pass) {
  if(String(pass).toLowerCase().match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/)) {
    return true;
  } else {
    return false;
  }
}

async function createUser(email, password) {
  const failedRequirements = checkRequirements()

  if(failedRequirements) {
    return failedRequirements;
  }

  console.log('=> STARTED CREATE USER <=');

  if(!isValidEmail(email)) {
    return 'Wrong email format';
  }
  console.log('[DEBUG]: Email validated');

  if(!isValidPassword(password)) {
    return 'Wrong password format';
  }
  console.log('[DEBUG]: Password validated');

  await pool.connect();

  console.log('[DEBUG]: Hashing the password');
  const hash = await bcrypt.hash(password, 10)

  console.log('[DEBUG]: Sending the request to database');
  try {
    await newQuery(`INSERT INTO users (email, dpassword) VALUES ($1, $2)`, [email, hash], pool);
    console.log('[DEBUG]: User created successfully');
    process.exit(1);
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
}

async function loginUser(email, password) {
  const failedRequirements = checkRequirements()

  if(failedRequirements) {
    return failedRequirements;
  }

  console.log('=> STARTED LOGIN USER <=');
  
  if(!isValidEmail(email)) {
    return 'Wrong email format';
  }
  console.log('[DEBUG]: Email validated');

  if(!isValidPassword(password)) {
    return 'Wrong password format';
  }
  console.log('[DEBUG]: Password validated');

  await pool.connect();

  console.log('[DEBUG]: Sending the request to database');
  try {
    const resp = await newQuery(`SELECT * FROM users WHERE email=$1`, [email], pool);

    if (resp.rowCount > 0) {
      console.log('[DEBUG]: Hashing password');
      const isValid = await bcrypt.compare(password, resp.rows[0][2]);
      if (isValid) {
        console.log(resp);
        console.log('[DEBUG]: User retrieved successfully');
        process.exit(1);
      } else {
        throw new Error('Wrong password');
      }
    } else {
      throw new Error('User not found');
    }
  } catch (err) {
    console.log(err.message);
    process.exit(1);
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

module.exports = {
  createUser,
  loginUser
}

require('make-runnable')
