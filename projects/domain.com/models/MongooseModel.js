const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Model = {
  connection: 'mongoose',
  tableName: 'mongoose',
  attributes: new Schema({
    name: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: Boolean,
    location: String,
    meta: {
      age: Number,
      website: String
    },
    created_at: Date,
    updated_at: Date
  })
};

Model.attributes.methods.dudify = function () {
  // add some stuff to the users name
  this.name = `${this.name}-dude`; 
  return this.name;
};

module.exports = Model;
