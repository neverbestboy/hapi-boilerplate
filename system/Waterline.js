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
        if (Env === 'prod') {
          migrate = 'safe';
        } else {
          migrate = 'alter';
        }
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
// let instanceModels;
// function requireUncached(module) {
//   delete require.cache[require.resolve(module)];
//   return require(module);
// }
// module.exports = (model, filename) => {
//   const modelName = Path.basename(filename, 'Model.js');
//   waterline.loadCollection(Waterline.Collection.extend(model));
// };

// module.exports.ApplyModel = (model, path) => {

// };

// module.exports.Create = (instanceWaterline) => {
//   waterline = instanceWaterline;
//   waterline = new Waterline();
//   return waterline;
// };

// module.exports.Start = () => {
//   return new Promise((resolve, reject) => {
//     const configDb = {
//       adapters: {
//         mysql: mysqlAdapter,
//         mongo: mongoAdapter
//       },
//       connections: {
//         default: {
//           adapter: 'mongo',
//           host: 'localhost',
//           port: 37017,
//           user: '',
//           password: '',
//           database: 'eknut'
//         },
//         partnerEknut: {
//           adapter: 'mongo',
//           host: 'localhost',
//           port: 37017,
//           user: '',
//           password: '',
//           database: 'eknut_partner'
//         }
//       }
//     };
//     waterline.initialize(configDb, (err, models) => {
//       if (err) {
//         throw err;
//       }
  
//       instanceModels = models.collections.connections;

//       resolve(true);
//     });
//   });
// };

