module.exports = {
  default: {
    engine: 'waterline',
    options: {
      adapter: 'mongo',
      host: 'localhost',
      port: 37017,
      user: '',
      password: '',
      database: 'eknut',
      migrate: 'alter'
    }
  }
};
