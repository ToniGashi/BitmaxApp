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
    throw false;
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

  pool.connect();
  try {
    const response = await pool.query(`INSERT INTO users (email, dpassword) VALUES ('${email}', '${password}')`);
    if(response){
      console.log('[DEBUG]: User created successfully');
      return 'User created successfully';
    } else {
      console.log('[DEBUG]: User creation failed');
      return 'Something unexpected went wrong'
    }
  } catch (err) {
    console.log(err);
    ret
  }
}

async function loginUser(email, password) {
  console.log('=> STARTED LOGIN USER <=');
  
  if(!isValidEmail(email)) {
    return 'Wrong email format';
  }
  console.log('[DEBUG]: Email validated');

  if(!isValidPassword(password)) {
    return 'Wrong password format';
  }
  console.log('[DEBUG]: Password validated');

  pool.connect();
  try {
    const response = await pool.query(`SELECT * FROM users WHERE email='${email}' AND dpassword='${password}'`);
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
