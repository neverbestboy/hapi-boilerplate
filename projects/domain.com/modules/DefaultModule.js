const Code = require('../constants/ResponseCodeConstant');
const Server = require('../app').server;

module.exports.DefaultGet = (request, reply) => {
  Server.log('info', 'test');
  return reply({
    number: 1
  }).code(Code.REQUEST_SUCCESS);
};
