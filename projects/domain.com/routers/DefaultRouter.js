const Joi = require('joi');
const Code = require('../constants/ResponseCodeConstant');
const DefaultModule = require('../modules/DefaultModule');

const routers = [];

routers.push({
  method: 'GET',
  path: '/',
  config: {
    auth: false,
    handler(request, reply) {
      return DefaultModule.DefaultGet(request, reply);
    },
    description: 'Router method get',
    validate: {
      params: {

      }
    },
    response: {
      // isAppendStatus: false
      status: {
        [Code.REQUEST_SUCCESS]: Joi.object({
          number: Joi.number()
                      .example('1000')
                      .description('Số')
        }).description('Request thành công')   
      }
    },
    tags: [
      'api',
      'Default'
    ]
  }
}
);

module.exports = routers;
