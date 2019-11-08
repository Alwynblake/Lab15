'use strict';

const express = require('express');
const authRouter = express.Router();
const Users = require('../model/users-model.js');
const auth = require('./middleware.js');
const oauth = require('./oauth/google.js');
const imageModel = require('../model/image-model');

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

// authRouter.get('/oauth', (req,res,next) => {
//   oauth.authorize(req)
//     .then( token => {
//       res.status(200).send(token);
//     })
//     .catch(next);
// });

// request for images
authRouter.get('/images', auth, (req, res, next) => {
  imageModel.find({})
    .then(results => {
      res.json(results);
    }) .catch(next);
});

authRouter.get('/image/:id', auth, (req, res, next) => {
  imageModel.findOne({_id: req.params.id})
    .then(records => res.json(records[0]))
    .catch(next);
});

authRouter.get('/images/:userId', auth, (req, res, next) => {
  imageModel.find({user_id: req.params.userId})
    .then(records => res.json(records[0]))
    .catch(next);
});

authRouter.post('/images', auth, (req,res,next) => {
  let img = new imageModel(req.body);
  img.save()
    .then(result => res.json(result))
    .catch(next);
});

authRouter.put('/image/:id', auth, (req, res, next) => {
  imageModel.findOneAndUpdate({
    _id: req.params.id})
    .then(records => res.json(records[0]))
    .catch(next);
});

authRouter.delete('/image/:id', auth, (req, res, next) => {
  imageModel.findOneAndDelete({
    _id: req.params.id})
    .then(records => res.json(records[0]))
    .catch(next);
});

module.exports = authRouter;
