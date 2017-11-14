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
  }
};
