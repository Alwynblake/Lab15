'use strict';

const express = require('express');
const authRouter = express.Router();

const Users = require('./users-model.js');
const auth = require('./middleware.js');
// const oauth = require('./oauth/google.js');

authRouter.post('/signup', (req, res, next) => {
  let users = new Users(req.body);
  users.save()
    .then( (users) => {
      req.token = users.generateToken();
      req.users = users;
      res.set('token', req.token);
      res.cookie('auth', req.token);
      res.send(req.token);
    }).catch(next);
});

authRouter.post('/signin', auth, (req, res, next) => {
  res.cookie('auth', req.token);
  res.send(req.token);
});

module.exports = authRouter;
