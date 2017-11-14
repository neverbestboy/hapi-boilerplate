const Code = require('../constants/ResponseCodeConstant');
const Server = require('../app').server;
const WaterlineModel = require('../models/WaterlineModel');

module.exports.DefaultGet = async (request, reply) => {
  // Insert data test
  await WaterlineModel.create({
    title: 'TEST',
    status: true
  });
  // Get data test
  const get = await WaterlineModel.findOne({
    title: 'TEST'
  });
  
  Server.log('info', get);
  Server.log('info', 'test');
  return reply({
    number: 1
  }).code(Code.REQUEST_SUCCESS);
};
