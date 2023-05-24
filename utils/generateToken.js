const jwt = require('jsonwebtoken');

async function generateToken (user) {
  const jwt_config = sails.config.custom.jwt
  return jwt.sign({
    id: user.id,
    username: user.username,
  }, jwt_config.jwt_secret, { expiresIn: jwt_config.expires  });
}

module.exports = generateToken;