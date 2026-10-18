export const appConfig = () => ({
  port: parseInt(process.env.PORT, 10) || 5000,
  env: process.env.NODE_ENV || 'development',
  cookie: {
    accessTokenMaxAge: 15 * 60 * 1000, // 15 mins
    refreshTokenMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_jwt_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
  },
});
