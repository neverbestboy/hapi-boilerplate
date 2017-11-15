const Path = require('path');
const _ = require('lodash');
const Randomstring = require('randomstring');
const Env = require('get-env')();

let mongoose;

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
    mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    _.forEach(connections, (v, k) => {
      if (v.engine === 'mongoose') {
        store.connections[k] = v.options;
      }
    });
    // console.dir(store.connections);
    mongoose.connect('mongodb://localhost:37017/mongoose', {
      useMongoClient: true
    });

    _.forEach(store.models, (v, k) => {
      const model = v.model;
      // model.connection = `${v.projectBasePath}-${model.connection}`;
      require.cache[v.path].exports = mongoose.model(model.tableName, model.attributes);
    });

    resolve(true);
  });
};
