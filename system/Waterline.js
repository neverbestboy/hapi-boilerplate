const Path = require('path');
const Waterline = require('waterline');
const mysqlAdapter = require('sails-mysql');
const mongoAdapter = require('sails-mongo');
const _ = require('lodash');
const Randomstring = require('randomstring');
const Env = require('get-env')();

let waterline;

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
    waterline = new Waterline();
    _.forEach(connections, (v, k) => {
      if (v.engine === 'waterline') {
        store.connections[k] = v.options;
      }
    });
    const config = {
      adapters: {
        mysql: mysqlAdapter,
        mongo: mongoAdapter
      },
      connections: store.connections
    };
    _.forEach(store.models, (v, k) => {
      const model = v.model;
      let migrate = _.get(store.connections[`${v.projectBasePath}-${model.connection}`], 'migrate', '');
      if (migrate === '') {
        migrate = 'alter';
      }
      if (Env !== 'dev') {
        migrate = 'safe';
      }
      const identity = Randomstring.generate({
        length: 12,
        charset: 'alphabetic',
        capitalization: 'lowercase'
      });
      model.identity = identity;
      model.migrate = migrate;
      model.connection = `${v.projectBasePath}-${model.connection}`;
      waterline.loadCollection(Waterline.Collection.extend(model));
    });
    waterline.initialize(config, (err, models) => {
      if (err) {
        reject(err);
      }
      _.forEach(store.models, (v) => {
        if (_.isEmpty(models.collections[v.model.identity]) === false) {
          require.cache[v.path].exports = models.collections[v.model.identity];
        }
      });
      resolve(true);
    });
  });
};

