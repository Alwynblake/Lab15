'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const imageModel = new mongoose.Schema({
  title: {type:String, required:true},
  user_id: {type:String, required:true},
  description: {type: String},
  url: {type:String, required:true, unique:true},
  // created_at:{type:Date, required:true},
});

imageModel.pre('save', async function () {
  if (this.isModified('user_id')) {
    this.user_id = await bcrypt.hash(this.user_id, 10);
  }
});

imageModel.statics.authenticateBasic = function(auth) {
  let query = {title:auth.title};
  return this.findOne(query)
    .then( user => user && user.comparePassword(auth.user_id) )
    .catch(error => {throw error;});
};

module.exports = mongoose.model('images', imageModel);