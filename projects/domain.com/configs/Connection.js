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
  },
  elasticsearch: {
    engine: 'elasticsearch',
    options: {
      url: 'http://mmm.9link.mobi',
      auth: {
        username: 'elastic',
        password: 'changeme'
      }
    }
  },
  cache: {
    engine: 'cache',
    options: {
      adapter: 'redis',
      config: {
        port: 7379,
        host: '127.0.0.1',
        // family: 4,
        // password: 'auth',
        db: 0
      }
    }
  }
};
