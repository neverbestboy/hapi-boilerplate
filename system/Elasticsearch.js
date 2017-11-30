const _ = require('lodash');
const ResultHandlerFactory = require('./elasticsearch/ResultHandlerFactory');
const RequestHandler = require('./elasticsearch/RequestHandler');
const Urlencode = require('urlencode');
const UrlJoin = require('url-join');

const store = {
  models: [],
  connections: {}
};

const commands = {
  async querySql(sql) {
    if (!sql) return false;
    try {
      const options = {};
      if (_.isUndefined(this.options.auth) === false) {
        options.auth = this.options.auth;
      }
      const url = UrlJoin(this.options.url, `_sql?sql=${Urlencode(sql)}`);
      const response = await RequestHandler.Get(url, options);
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        const parseData = ResultHandlerFactory.parse(data);
        const items = parseData.getBody();
        let totalRows = parseData.getTotal();
        if (_.isUndefined(totalRows) === true) {
          totalRows = items.length;
        }
        return {
          totalRows,
          items
        };
      } 
      return false;
    } catch (e) {
      throw e;
    }
  }
};

module.exports.ApplyModel = (model, path, projectBasePath) => {
  store.models.push({
    model,
    path,
    projectBasePath
  });
};

module.exports.Start = (connections) => {
  return new Promise((resolve, reject) => {
    _.forEach(connections, (v, k) => {
      try {
        if (v.engine === 'elasticsearch') {
          store.connections[k] = v.options;
        }
        return true;
      } catch (e) {
        return reject(e);
      }
    });

    _.forEach(store.models, (v) => {
      try {
        const model = require(v.path);
        _.forEach(model, (func, funcName) => {
          if (_.isFunction(func) === true) {
            const bindCommand = _.clone(commands);
            const connection = `${v.projectBasePath}-${model.connection}`;
            bindCommand.options = store.connections[connection];
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
