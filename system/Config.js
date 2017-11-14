const Path = require('path');
const Env = require('get-env')();
const _ = require('lodash');
const Fs = require('fs');

module.exports = (obj, filename) => {
  const configName = Path.basename(filename).replace('.js', '');
  const path = Path.dirname(filename);
  let config;
  if (Fs.existsSync(`${path}/env/${Env}.js`)) {
    const configEnv = require(`${path}/env/${Env}.js`);
    config = _.merge(obj, configEnv[configName]);
  } else {
    config = obj;
  }
  if (_.isUndefined(require.cache[filename].exports) === false) {
    require.cache[filename].exports = config;
  }
  return true;
};

