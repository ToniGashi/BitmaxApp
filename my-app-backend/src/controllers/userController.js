const { v1: uuidv1 } = require('uuid');
const {newQuery} = require('../../database/dbFunctions');
const bcrypt = require('bcrypt')

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

const userController = {
  async createUser(email, password) {
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
      await newQuery(`INSERT INTO users (id, email, dhash) VALUES ($1, $2, $3)`, [id, email, hash]);
      console.log('[DEBUG]: User created successfully');
      return;
    } catch (err) {
      const error =  new Error('Email already exists')
      error.statusCode = 409
      throw error;
    }
  },
  async loginUser(email, password) {
    console.log('=> STARTED LOGIN USER <=');
    console.log([email, password]);
    try {
    validateEmail(email);
    console.log('[DEBUG]: Email validated');
    validatePassword(password);
    console.log('[DEBUG]: Password validated');
    } catch (err) {
      throw err;
    }
  
    console.log('[DEBUG]: Connecting to database');
  
    console.log('[DEBUG]: Sending the request to database');
    try {
      const resp = await newQuery(`SELECT * FROM users WHERE email=$1`, [email]);
      if (resp) {
        let isValid;
        if(resp?.[0]?.dhash) {
          isValid = await bcrypt.compare(password, resp[0].dhash);
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
}

module.exports = userController;
