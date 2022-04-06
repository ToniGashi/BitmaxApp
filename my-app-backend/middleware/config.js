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
};

module.exports = {
  checkRequirements,
};
