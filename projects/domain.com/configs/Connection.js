module.exports = {
  default: {
    engine: 'waterline',
    options: {
      adapter: 'mongo',
      host: 'localhost',
      port: 37017,
      user: '',
      password: '',
      database: 'waterline',
      migrate: 'alter'
    }
  },
  mongoose: {
    engine: 'mongoose',
    options: {
      uri: 'mongodb://localhost:37017/mongoose',
      useMongoClient: true
    }
  }
};
