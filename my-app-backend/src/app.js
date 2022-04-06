require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const { checkRequirements } = require('../middleware/config');
const app = express();
const ioSocket = require('../socket/socket')(app);
const { authenticateJWT } = require('../middleware/authJWT');

try {
  checkRequirements();
} catch (err) {
  console.log(err.message);
  return;
}

const port = 3000;

const corsOptions = {
  origin:'http://localhost:3001', 
  credentials:true,
  optionSuccessStatus:200,
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(express.json());

const userRouter = require('./routes/users')
const tickerRouter = require('./routes/tickers')

app.use('/user-management', userRouter)
app.use('/ticker-management', authenticateJWT, tickerRouter)

app.listen(port, function() {
  console.log(`App listening on port ${port}!`)
});
