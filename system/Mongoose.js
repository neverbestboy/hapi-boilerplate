const Path = require('path');
const _ = require('lodash');
// const Randomstring = require('randomstring');
// const Env = require('get-env')();

const mongoose = {};

const store = {
  models: [],
  connections: {}
};

module.exports.ApplyModel = (model, path, projectBasePath) => {
  const tmpModel = model;
  const modelName = Path.basename(path, 'Model.js');
  if (_.get(model, 'tableName', false) === false) {
    tmpModel.tableName = modelName;
  }
  store.models.push({
    model: tmpModel,
    path,
    projectBasePath
  });
};

module.exports.Start = (connections) => {
  return new Promise((resolve, reject) => {
    _.forEach(connections, (v, k) => {
      try {
        if (v.engine === 'mongoose') {
          store.connections[k] = v.options;
          mongoose[k] = require('mongoose');
          mongoose[k].Promise = global.Promise;
          const options = _.clone(v.options);
          delete options.uri;
          mongoose[k].connect(v.options.uri, options);
        }
        return true;
      } catch (e) {
        return reject(e);
      }
    });

    _.forEach(store.models, (v) => {
      try {
        const model = v.model;
        const connection = `${v.projectBasePath}-${model.connection}`;
        require.cache[v.path].exports = mongoose[connection].model(model.tableName, model.attributes);
      } catch (e) {
        reject(e);
      }
    });

    resolve(true);
  });
};
