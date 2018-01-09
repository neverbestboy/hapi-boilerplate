const Code = require('../constants/ResponseCodeConstant');
const Server = require('../app').server;
const WaterlineModel = require('../models/WaterlineModel');
const DemoModel = require('../models/elasticsearch/DemoModel');
const AppCache = require('../caches/AppCache');

module.exports.DefaultGet = async (request, reply) => {
  //= ========================= Cache demo =========================
  //
  // console.log(await AppCache.set('test', '11'));
  // console.log(await AppCache.get('test1'));
  // console.log(await AppCache.wrap('test_wrap', async () => {
  //   console.log('Load from db');
  //   return 'Data from db';
  // }));

  //= ========================= MongooseModel demo =========================
  //
  // const MongooseModel = require('../models/MongooseModel');
  // const chris = new MongooseModel({
  //   name: 'Chris 1',
  //   username: 'sevilayha 2',
  //   password: 'password' 
  // });
  // // MongooseModel.find({ username: 'sevilayha' }, (err, result) => {
  // //   result.
  // //   console.log(result);
  // // });
  
  // MongooseModel.update({ username: 'sevilayha' }, { $set: { password: 'aaaaa' } }, (err, tank) => {
  //   if (err) console.log(err);
  //   console.log(tank);
  // });

  //= ========================= Elasticsearch demo =========================
  //
  // await DemoModel.getDemo();

  //= ========================= WaterlineModel demo =========================
  //
  // await WaterlineModel.create({
  //   title: 'TEST',
  //   status: true
  // });
  // // Get data test
  // const get = await WaterlineModel.findOne({
  //   title: 'TEST'
  // });
  
  //= ========================= Log demo =========================
  //
  // Server.log('info', get);
  // Server.log('info', 'test');
  
  return reply({
    number: 1
  }).code(Code.REQUEST_SUCCESS);
};
