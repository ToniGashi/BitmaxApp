const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  console.log('=> STARTED JWT AUTHENTICATION <=');
  const authHeader = req.cookies['accessToken'];
  if (authHeader) {
      jwt.verify(authHeader, process.env.JWT_SECRET_TOKEN, (err, user) => {
          if (err) {
              return res.status(403).send({
                message: 'Forbidden'
              });
          }

          req.user = user;
          next();
      });
  } else {
      res.status(401).send({
        message: 'Unauthorized'
      });
  }
};

module.exports = {
  authenticateJWT,
};
