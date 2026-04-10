import dotenv from 'dotenv';
dotenv.config();
const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/allways',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || 'allways.onserve@gmail.com',
    pass: process.env.SMTP_PASS || 'gqpp fdwn gsfx buvo'
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  frontendUrls: ['*', 'http://localhost:3000', 'https://zp82dm8t-3000.inc1.devtunnels.ms']
};
export default config;