const express = require('express');
const userRouter = express.Router();
const usersController = require('../controllers/userController.js');
const { authenticateJWT } = require('../middleware/authJWT');
const jwt = require('jsonwebtoken');

userRouter.post('/user', authenticateJWT, async function(req, res) {
  console.log('=> STARTED USER CREATION <=');
  try {
    const { email, password } = req.body;
    await usersController.createUser(email, password);
    console.log("[DEBUG]: User created successfully");
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

userRouter.post('/login', async function(req, res) {
  console.log('=> STARTED USER LOGIN <=');
  try {
    const { email, password } = req.body;
    const resp = await usersController.loginUser(email, password)
    console.log("[DEBUG]: User logged in successfully");
    const accessToken = jwt.sign({ username: email, id: resp[0].id }, process.env.JWT_SECRET_TOKEN);
    console.log('[DEBUG]: Access token generated');
    res.cookie('accessToken', accessToken, { maxAge: 900000 });
    console.log("[DEBUG]: User logged in successfully");
    return res.send({
      status: 200,
      message: 'User login successfully',
    })
  } catch (err) {
    console.log('[ERROR]: ', err.message);
    res.status(err.statusCode || 500).send({
      error: { message: err.message, status:err.statusCode },
    });
  }
});

module.exports = userRouter
