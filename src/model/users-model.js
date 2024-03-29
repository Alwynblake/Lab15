'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const users = new mongoose.Schema({
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  email: {type: String},
  role: {type: String, default:'user', enum: ['admin','editor','user']},
});

users.pre('save', async function() {
  if (this.isModified('password'))
  {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

users.statics.createFromOauth = function(email) {
  if(! email) { return Promise.reject('Validation Error'); }
  return this.findOne( {email} )
    .then(users => {
      if( !users ) { throw new Error('User Not Found'); }
      console.log('Welcome Back', users.username);
      return users;
    })
    .catch( error => {
      console.log('Creating new user');
      let username = email;
      let password = 'none';
      return this.create({username, password, email});
    });
};

users.statics.authenticateBasic = function(auth) {
  let query = {username:auth.username};
  return this.findOne(query)
    .then( users => users && users.comparePassword(auth.password) )
    .catch(error => {throw error;});
};

// bear auth
users.statics.authenticateToken = function (token) {
  let parsedToken = jwt.verify(token, process.env.SECRET);
  return this.findOne({ _id: parsedToken.id });
};

users.methods.comparePassword = function(password) {
  return bcrypt.compare( password, this.password )
    .then( valid => valid ? this : null);
};

users.methods.generateToken = function() {
  let token = {
    id: this._id,
    role: this.role,
  };

  return jwt.sign(token, process.env.SECRET);
};

module.exports = mongoose.model('users', users);
