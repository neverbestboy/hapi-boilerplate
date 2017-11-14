const Jwt = require('../../../packages/hapi-auth-jwt2');

module.exports = {
  active: true,
  register: [Jwt]
};
