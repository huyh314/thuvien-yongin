require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_change_me',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  library: {
    name: process.env.LIBRARY_NAME || 'Thư viện số cộng đồng Yongin',
    address: process.env.LIBRARY_ADDRESS || '46 Bạch Đằng, Hải Châu, Đà Nẵng',
  },
};
