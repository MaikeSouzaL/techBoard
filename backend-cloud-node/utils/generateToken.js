const jwt = require('jsonwebtoken');

const generateToken = (id, storeId, role) => {
  return jwt.sign(
    { id, storeId, role },
    process.env.JWT_SECRET || 'logiclens_secret_key_123',
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;
