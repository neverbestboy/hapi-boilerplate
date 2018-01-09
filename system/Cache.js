const _ = require('lodash');
const IoRedis = require('ioredis');

const store = {
  caches: [],
  connections: {}
};

const commands = {
  async set(key, value, ttl = null) {
    try {
      const server = this.server;
      const adapter = this.adapter;
      if (adapter === 'redis') {
        let result;
        if (_.isNull(ttl) === true) {
          result = await server.set(key, value);
        } else {
          result = await server.set(key, value, 'EX', parseInt(ttl, 10));
        }
        
        return result;
      }
      return false;
    } catch (e) {
      throw e;
    }
  },
  async get(key) {
    try {
      const server = this.server;
      const adapter = this.adapter;
      if (adapter === 'redis') {
        const result = await server.get(key);
        return result;
      }
      return false;
    } catch (e) {
      throw e;
    }
  },
  async wrap(key, work, ttl = null) {
    const server = this.server;
    const adapter = this.adapter;
    if (adapter === 'redis') {
      const result = await server.get(key);
      if (_.isNull(result) === false) {
        return result;
      }
      const data = await work();
      if (data) {
        if (_.isNull(ttl) === true) {
          await server.set(key, data);
        } else {
          await server.set(key, data, ttl);
        }
      }
      return data;
    }
    return false;
  }
};

module.exports.ApplyCache = (cache, path, projectBasePath) => {
  store.caches.push({
    cache,
    path,
    projectBasePath
  });
};

module.exports.Start = (connections) => {
  return new Promise((resolve, reject) => {
    _.forEach(connections, (v, k) => {
      try {
        if (v.engine === 'cache') {
          if (v.options.adapter === 'redis') {
            // IoRedis.Promise.onPossiblyUnhandledRejection((error) => {
            // });
            store.connections[k] = {
              adapter: 'redis',
              server: new IoRedis(v.options.config)
            };
            // store.connections[k].on('error', (err) => {
            // });
          }
        }
        return true;
      } catch (e) {
        return reject(e);
      }
    });

    _.forEach(store.caches, (v) => {
      try {
        const cache = require(v.path);
        const connection = `${v.projectBasePath}-${cache.connection}`;
        const bindCommand = {};
        _.forEach(commands, (func, funcName) => {
          bindCommand[funcName] = func.bind(store.connections[connection]);
        });
        require.cache[v.path].exports = bindCommand;
        _.forEach(cache, (func, funcName) => {
          if (_.isFunction(func) === true) {
            require.cache[v.path].exports[funcName] = func.bind(bindCommand);
          }
        });
      } catch (e) {
        reject(e);
      }
    });

    resolve(true);
  });
};
