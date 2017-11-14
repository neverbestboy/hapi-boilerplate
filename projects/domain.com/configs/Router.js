const Joi = require('joi');
const Code = require('../constants/ResponseCodeConstant');

module.exports = {
  active: true,
  appendResponseStatus: {
    [Code.INVALID_TOKEN]: Joi.object({
      message: Joi.string().example('Chứng thực sai')
    }).description('Thông tin xác thực không hợp lệ'),

    [Code.INVALID_PARAMS]: Joi.object({
      message: Joi.string().example('Tham số đầu vào không chính xác'),
      validation: Joi.object().keys({
        source: Joi.string().example('payload').description('Phương thức nhập liệu'),
        keys: Joi.array().description('Chứa key tham số lỗi').example([
          'pin'
        ])
      })
    }).description('Tham số đầu vào không chính xác')
  }
};
