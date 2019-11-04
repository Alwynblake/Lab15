'use strict';

const express = require('express');
const authRouter = express.Router();
const Users = require('./users-model.js');
const auth = require('./middleware.js');
const oauth = require('./oauth/google.js');

// signup works
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

// signin works
authRouter.post('/signin', auth, (req, res, next) => {
  res.cookie('auth', req.token);
  res.send(req.token);
});

authRouter.get('/oauth', (req,res,next) => {
  oauth.authorize(req)
    .then( token => {
      res.status(200).send(token);
    })
    .catch(next);
});

// request for images
authRouter.get('/images', (req, res, next) => {
  oauth.authorize(req)
    .then(token => {
      res.status(200).send(token);
      console.log('You have a valid token for all images');
    })
    .catch(next);
});
module.exports = authRouter;
