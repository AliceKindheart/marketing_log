'use strict';

/**
 * Module dependencies.
 */
var StandardError = require('standard-error');
var db = require('../../config/sequelize');


/**
 * Find company by id
 * Note: This is called every time that the parameter :id is used in a URL. 
 * Its purpose is to preload the company on the req object then call the next function. 
 */
exports.company = function(req, res, next, id) {
    db.Company.find({where: {id: id}, include: [{model: db.Tag}, {model: db.Contact}, {model: db.Event}]}).then(function(company){
        if(!company) {
            return next();
        } else {            
            req.company = company; // {Company_name: "Whatever", Notes: "Stuff", tags: [{Tag_name: "Foo"}]}
           return next();            
        }
    }).catch(function(err){
        return next(err);
    });
};

/**
 * List of Companies
 */
exports.all = function(req, res) {    
    db.Company.findAll({include: [{model: db.Tag}], order: 'Company_name'}).then(function(companies){
        return res.jsonp(companies);
    }).catch(function(err){
        return res.render('error', {
            error: err,
            status: 500
        });
    });
};

/* Show a company
 */
exports.show = function(req, res) {
        // Sending down the company that was just preloaded by the companies.company function
    // and saves company on the req object.
    return res.jsonp(req.company);
};
/**
 * Create a company
 */
exports.create = function(req, res) {
    // augment the company by adding the UserId
    req.body.UserId = req.user.id;
    var tagrows;
    var thecompany;
    
    if (req.body.Tag_name){
        var Tagnames = req.body.Tag_name;

        db.Tag.findAll({where:{Tag_name:{$in:Tagnames}}})
            .then(function(rowoftags){
                tagrows=rowoftags;
                return db.Company.create(req.body);
            })
        // save and return an instance of company on the res object. 
        .then(function(company){
            //add tags to the company
            thecompany= company;
            return company.addTags(tagrows);
        }).then(function(){
            if(!thecompany){
                return res.send('users/signup', {errors: new StandardError('Company could not be created')});
            } else {
                return res.jsonp(thecompany);
            }
        }).catch(function(err){
            return res.send('users/signup', { 
                errors: err,
                status: 500
            });
        });
    } else {
        db.Company.create(req.body).then(function(company){
        if(!company){
            return res.send('users/signup', {errors: new StandardError('Company could not be created')});
        } else {
            return res.jsonp(company);
         }   
        }).catch(function(err){

            return res.send('users/signup', { 
                errors: err,
                status: 500
            });
        });
    }
};

exports.addtag = function(req, res) {
    var id = req.body.id;
    var tagrows;
    var Tagnames = req.body.tag.Tag_name.split(", ");
    db.Tag.findAll({where:{Tag_name:{$in:Tagnames}}})
        .then(function(rowoftags){
            tagrows=rowoftags;
            return db.Company.find({where: {id: id}, include: [{model: db.Tag}]}).then(function(company){
                return company.addTags(tagrows);
            }).then(function(comp){
                return res.jsonp(comp);
            });
        });
};

exports.search = function(req, res) {
    db.Company.findAll({where: {Company_name:  {$like: '%' + req.query.compname + '%'}}, include: [{model: db.Tag}]})
        .then(function(comps){
            return res.jsonp(comps);
        }).catch(function(err){
            return res.render('error', {
                error: err,
                status: 500
            });
        });
};

exports.getcompanyevents = function(req,res){
    db.Event.findAll({where: {CompanyId: req.query.compid}, include: [{model: db.Contact}, {model: db.User}, {model: db.Company}, {model: db.Technology}]
        }).then(function(events){
            return res.jsonp(events);
        }).catch(function(err){
            return res.render('error',{
                error: err,
                status: 500
            });
        });
};

/**
 * Update a company
 */
exports.update = function(req, res) {
    // create a new variable to hold the company that was placed on the req object.
    var company = req.company;
    var newtags = req.body.Tag_name.join(", ").split(", ");
    var tagrows;
    var companyid = req.body.id;
     
    db.Tag.findAll({where:{Tag_name: {$in:newtags}}})
        .then(function(rowoftags){
            tagrows=rowoftags;
            return db.Company.findOne({where: {id: companyid}, include: [{model: db.Tag}]}).then(function(company){
                company.setTags(tagrows);
                return company.updateAttributes({
                    Company_name: req.body.Company_name,
                    Notes: req.body.Notes,
                    Company_email: req.body.Company_email,
                    Company_phone: req.body.Company_phone
                });
            }).then(function(company){
                return res.jsonp(company);
            }).catch(function(err){
                return res.render('error',{
                    error: err,
                    status: 500
                });
            });
        });
};

/**
 * Delete a company
 */
exports.destroy = function(req, res) {
    // create a new variable to hold the company that was placed on the req object.
    var company = req.company;

    company.destroy().then(function(){
        return res.jsonp(company);
    }).catch(function(err){
        return res.render('error', {
            error: err,
            status: 500
        });
    });
};

/**
/**
 * Article authorizations routing middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.company.id !== req.company.id) {
      return res.send(401, 'User is not authorized');
    }
    next();
};


