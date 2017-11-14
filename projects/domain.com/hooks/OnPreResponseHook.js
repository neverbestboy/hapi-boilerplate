const Code = require('../constants/ResponseCodeConstant');
const Server = require('../app').server;

module.exports = (request, reply) => {
  const response = request.response;
  if (response instanceof Error) {
    if (response && response.message === 'Not Found') {
      return reply({
        code: Code.INVALID_SERVICE,
        data: {
          message: 'Not Found'
        }
      });
    } else if (response && response.output && response.output.statusCode === 401) {
      return reply({
        code: Code.INVALID_TOKEN,
        data: {
          message: request.__('Thông tin xác thực không hợp lệ')
        }
      });
    } else if (response && response.output && response.output.payload.validation) {
      return reply({
        code: Code.INVALID_PARAMS,
        data: {
          message: response.output.payload.message,
          validation: response.output.payload.validation
        }
      });
    } 
    const { path, payload, params } = request;
    Server.log('SystemErrorTracking', {
      path,
      payload,
      params,
      errorMessage: response.message,
      errorStack: response.stack
    });
    Server.log('error', response);
    return reply({
      code: Code.SYSTEM_ERROR,
      data: {
        message: 'Dịch vụ đang gặp gián đoạn. Vui lòng quay lại sau'
      }
    });
  } 
  if (response.statusCode !== 200 && response.statusCode !== 302) {
    reply({
      code: response.statusCode,
      data: response.source
    }).code(200);
  } else {
    reply.continue();
  }
  return false;
};
