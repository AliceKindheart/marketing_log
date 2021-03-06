'use strict';

/**
 * Module dependencies.
 */
var db = require('../../config/sequelize');

/**
 * Auth callback
 */
exports.authCallback = function(req, res, next) {
    res.redirect('/');
};

exports.changepassword = function(req,res){
  var message = null;
  db.User.findOne({where: {id: req.body.id}})
    .then(function(user){
      if(req.user.authenticate(req.body.oldpassword)){
        var newsalt = user.makeSalt();
        var newhashedpassword = user.encryptPassword(req.body.newpassword, newsalt);
        user.updateAttributes({
          salt: newsalt,
          hashedPassword: newhashedpassword
        });
        return res.send({status : 'success', message : 'User password changed successfully.'});
      } else {
        return res.status(500).body({err: "error"});
      }
    }).catch(function(err){
        return res.status(500).body({err: "error"});
    });
    
};
/**
 * Create user
 */
exports.create = function(req, res, next) {
    var message = null;
    var user = db.User.build(req.body);

    user.provider = 'local';
    user.salt = user.makeSalt();
    user.hashedPassword = user.encryptPassword(req.body.password, user.salt);
    return user.save()
    .then(function(user){
            if(req.body.advisor){
              user.setAdvisor(req.body.advisor);
              db.User.findOne({where: {id: req.body.advisor.id}
                }).then(function(adv){
                  adv.addIntern(user);
                });
              }
          return res.send({status : 'success', message : 'User signup successfully.'});
    }).catch(function(err){
      res.render('users/signup',{
          message: message,
          user: user
      });
    });
};

exports.delete = function(req, res) {
  db.User.destroy({where: {id: req.query.id}})
    .then(function(){
      return res.jsonp({status: 200});
    }).catch(function(err){
      return res.render('error',  {
        error: err,
        status: 500
        });
    });
};

exports.findOne = function(req, res, id) {
  db.User.findOne({where: {id: req.query.id}, include: [{model: db.Technology}, {model: db.User, as: 'Advisor'}, {model: db.User, as: 'Interns'}]})
    .then(function(response){
        response.getInterns();
      res.jsonp(response);
    });
};

exports.getall = function(req, res) {
  db.User.findAll({include: [{model: db.Technology}], order: "last_name"})
    .then(function(users){
      res.jsonp(users);
    });
};

exports.getadmins = function(req, res){
  db.User.findAll({where: {admin: true}})
    .then(function(admins){
      res.jsonp(admins);
    });
};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.profile.id !== req.user.id) {
      return res.status(401).send('User is not authorized');
    }
    next();
};

exports.isadmin = function(req, res) {
    db.User.find({where : { id: req.query.id }}).then(function(user){
      if (!user) {
          return (new Error('Failed to load User ' + req.query.id));
      }
      req.profile = user;
      return user.jsonp;
    }).catch(function(err){
      return (err);
    });
};
/**
 * Send User
 */
exports.me = function(req, res) {
    res.jsonp(req.user || null);
};
/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).send('User is not authorized');
    }
    next();
};
/**
 * Session
 */
exports.session = function(req, res) {
    return res.send({status : 'success', message : 'User login successfully.'});
};
/**
 * Show login form
 */
exports.signin = function(req, res) {
    res.render('users/signin', {
        title: 'Signin',
        message: req.flash('error')
    });
};
/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    return res.send({status : 'success', message : 'User logout successfully.'});
};
/**
 * Show sign up form
 */
exports.signup = function(req, res) {
    res.render('users/signup', {
        title: 'Sign up',
    });
};

exports.update = function(req, res) {
  var advisor = req.query.advisor;

  db.User.findOne({where: {id: req.query.id}})
    .then(function(user){
      return user.updateAttributes({
        name: req.query.name,
        username: req.query.username,
        email: req.query.email,
        admin: req.query.admin,
        first_name: req.query.first_name, 
        last_name: req.query.last_name,
        intern: req.query.intern
      });
    }).then(function(user){
        if(user.intern===true){
              user.setAdvisor(req.query.advisorid);
              db.User.findOne({where: {id: advisorid}
                }).then(function(adv){
                  adv.addIntern(user);
                });
          } else {
            user.setAdvisor(null);
          }    
      return res.jsonp(user);
    }).catch(function(err){
      return res.render('error',  {
        error: err,
        status: 500
        });
    });
};
/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    db.User.find({where : { id: id }}).then(function(user){
      if (!user) {
          return next(new Error('Failed to load User ' + id));
      }
      req.profile = user;
      next();
    }).catch(function(err){
      next(err);
    });
};
