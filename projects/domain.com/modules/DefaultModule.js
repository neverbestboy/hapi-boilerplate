const Code = require('../constants/ResponseCodeConstant');
const Server = require('../app').server;
const WaterlineModel = require('../models/WaterlineModel');
const MongooseModel = require('../models/MongooseModel');

const chris = new MongooseModel({
  name: 'Chris 1',
  username: 'sevilayha 2',
  password: 'password' 
});
// MongooseModel.find({ username: 'sevilayha' }, (err, result) => {
//   result.
//   console.log(result);
// });

MongooseModel.update({ username: 'sevilayha' }, { $set: { password: 'aaaaa' } }, (err, tank) => {
  if (err) console.log(err);
  console.log(tank);
});
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
