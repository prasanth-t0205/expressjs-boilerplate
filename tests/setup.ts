process.env.NODE_ENV = 'test';
process.env.PORT = '5000';
process.env.MONGO_URI = 'mongodb://localhost:27017/test-db';
process.env.CORS_ORIGIN = '*';
process.env.JWT_SECRET = 'test-secret';

export default () => {
  // Global setup for tests can go here (e.g. database connections)
};
