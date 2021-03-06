'use strict';

/**
 * Module dependencies.
 */
var StandardError = require('standard-error');
var db = require('../../config/sequelize');

/**
 * List of Technologies
 */
exports.all = function(req, res) {
    db.Technology.findAll({include: [{model: db.Tag}, {model: db.User}], order: 'Tech_RUNumber'})
        .then(function(technologies){
            return res.jsonp(technologies);
        }).catch(function(err){
            return res.render('error', {
                error: err,
                status: 500
        });
    });
};

/**
 * Find technology by id
 * Note: This is called every time that the parameter :id is used in a URL. 
 * Its purpose is to preload the company on the req object then call the next function. 
 */
exports.technology = function(req, res, next, id) {
    db.Technology.find({where: {id: id}, include: [{model: db.Tag}, {model: db.User}, {model: db.Event}]})
        .then(function(technology){
            if(!technology) {
                return next();
            } else {
                req.technology = technology;
               return next();            
            }
        }).catch(function(err){
            return next(err);
        });
};


/* Show a technology
 */
exports.show = function(req, res) {
    return res.jsonp(req.technology);
};
/**
 * Create a technology
 */
exports.create = function(req, res) {
    var tagrows;
    var thetechnology;
    var marketer = req.body.Tech_marketer;
    var personn;
    // save and return an instance of company on the res object. 

    db.User.find({where:{name: marketer}})
        .then(function(person){
            //saving the marketer to an outside variable for future reference
            personn = person;
        }).then(function(){
            if (req.body.Tag_name){
                var Tagnames = req.body.Tag_name;
                db.Tag.findAll({where:{Tag_name:{$in:Tagnames}}})
                    .then(function(rowoftags){
                        //saving the found tags to an outside variable for future reference
                        tagrows=rowoftags;
                        return db.Technology.create(req.body);
                    }).then(function(technology){
                        thetechnology = technology;
                        technology.setUser(personn);
                        technology.addTags(tagrows);
                        return technology;              
                    }).then(function(tek){
                        return res.jsonp(tek);
                    }).catch(function(err){
                        return res.status(500).send("Technology could not be created");
                    });                    
            } else {
                db.Technology.create(req.body).then(function(technology){
                    if(!technology){
                            return res.status(500).send('users/signup', {errors: new StandardError("Technology could not be created")});
                         } else {
                            technology.setUser(personn);
                            return res.jsonp(technology);
                         }
                    }).catch(function(err){
                        return res.send('users/signup', {
                            errors: err,
                            status: 500
                        });
                    });
            }
        });
};

exports.searchfortech = function(req, res){
    db.Technology.findOne({where: {Tech_RUNumber: req.query.number}, include: [{model: db.Tag}, {model: db.User}]})
        .then(function(tech){
            return res.jsonp(tech);
        }).catch(function(err){
            return res.send({
                errors: err,
                status: 500
            });
        });
};

exports.searchformine = function(req,res){
    console.log("REQQQQquery", req.query);
    var internid = [];
    if(typeof req.query.internid==="string"){
        internid.push(req.query.internid);
    } else {
        internid = req.query.internid;
    }

    db.Technology.findAll({
            where: {
                $or: [
                    {UserId: req.user.id, isActive: true},
                    {isActive:true, UserId: {$in: internid}}
                ]
            }, 
            include: [{model: db.User}, {model: db.Tag}], 
            order: 'Tech_RUNumber'})
        .then(function(tex){
            return res.jsonp(tex);
        }).catch(function(err){
            return res.send({
                errors: err,
                status: 500
            });
        });
};

exports.searchforjustmine = function(req,res){
    db.Technology.findAll({
            where: {
                    UserId: req.user.id, 
                    isActive: true,                    
            }, 
            include: [{model: db.User}, {model: db.Tag}], 
            order: 'Tech_RUNumber'})
        .then(function(tex){
            return res.jsonp(tex);
        }).catch(function(err){
            return res.send({
                errors: err,
                status: 500
            });
        });
};

exports.geteventsforonetechnology = function(req,res){
    db.Event.findAll({where: {TechnologyId: req.query.techid}, include: [{model:db.User}, {model:db.Contact}, {model:db.Technology}, {model:db.Company}], order: ['Company_name','Event_date']
    }).then(function(evnts){
        return res.jsonp(evnts);
    }).catch(function(err){
        return res.send({
            errors: err,
            status: 500
        });
    });
};

exports.geteventsforonetechnologyforfollowup = function(req,res){
    db.Event.findAll({where: {TechnologyId: req.query.techid, isFollowup: true}, include: [{model:db.User}, {model:db.Contact}, {model:db.Technology}, {model:db.Company}], order: ['Company_name','Event_date']
    }).then(function(evnts){
        return res.jsonp(evnts);
    }).catch(function(err){
        return res.send({
            errors: err,
            status: 500
        });
    });
};

exports.findsuggestedcompanies = function(req,res){
    var Tagnames = req.query.tagids;
    var foundcomps = [];

    if(typeof Tagnames==="string"){
        db.Company.findAll({
            include: [{
                model: db.Tag,
                attributes: ['id', 'Tag_name'],
                where: [{'$TagId$': Tagnames}]
            }]       
        }).then(function(cmps){
            return res.jsonp(cmps);
        });
    } else {
        db.Company.findAll({
            include: [{
                model: db.Tag,
                attributes: ['id', 'Tag_name'],
                where: [{'$TagId$': {$in:Tagnames}}],
                order: "Company_name"
            }]
        }).then(function(cmps){
             return res.jsonp(cmps);
        });
    }        
};


exports.active = function(req,res){
    db.Technology.findAll({where: {isActive: true}, include: [{model: db.User}, {model: db.Tag}], order: 'Tech_RUNumber'})
        .then(function(tex){
            return res.jsonp(tex);
        }).catch(function(err){
            return res.send({
                errors: err,
                status: 500
            });
        });
};

exports.unloved = function(req,res){
    db.Technology.findAll({where: {isUnloved: true}, include: [{model: db.User}, {model: db.Tag}], order: 'Tech_RUNumber'})
        .then(function(tex){
            return res.jsonp(tex);
        }).catch(function(err){
            return res.send({
                errors: err,
                status: 500
            });
        });
};

exports.usercampaigns = function(req,res){
    db.Technology.findAll({where: {UserId: req.query.id}, include: [{model: db.User}, {model: db.Tag}], order: 'Tech_RUNumber'})
        .then(function(tex){
            return res.jsonp(tex);
        }).catch(function(err){
            return res.send({
                errors: err,
                status: 500
            });
        });
};

exports.getinterninfo = function(req,res){
    db.User.findOne({where: {id: req.query.id}, include: [{model: db.User, as: 'Intern'}]})
        .then(function(user){
            return res.jsonp(user);
        }).catch(function(err){
            return res.send({
                errors: err, 
                status: 500
            });
        });
};

/**
 * Update a technology
 */
exports.update = function(req, res) {
    // create a new variable to hold the technology that was placed on the req object.
    var technology = req.technology;
    var newtags = req.body.Tag_name.join(", ").split(", ");
    var tagrows;
    var techid = req.body.id;
    var newuser;

    if(newtags){
        return db.User.findOne({where: {name: req.body.marketer}})
            .then(function(user){
                newuser = user;
                //find tags to add in the dB
                db.Tag.findAll({where: {Tag_name: {$in:newtags}}
                    }).then(function(rowoftags){
                        //create a reference to the set of tags to be added that's outside this function
                        tagrows=rowoftags;
                        //find technology to be updated
                        return db.Technology.findOne({where: {id: techid}, include: [{model: db.Tag}]
                    }).then(function(technogoly){
                        //add the new tags
                        return technology.setTags(tagrows);
                    }).then(function(tech){
                        //update the technology
                        return technology.updateAttributes({
                            Tech_RUNumber: req.body.Tech_RUNumber,
                            Tech_name: req.body.Tech_name,
                            Tech_inventor: req.body.Tech_inventor,
                            isActive: req.body.isActive
                    }).then(function(tek){
                        //set user
                        tek.setUser(newuser);
                        return res.jsonp(tek);        
                    }).catch(function(err){
                        return res.render('error',{
                            error: err,
                            status: 500
                        });
                    });
                });
            });
            });
    } else {
        return db.User.findOne({where: {name: req.body.Tech_marketer}})
            .then(function(user){
                newuser = user;
                technology.updateAttributes({
                    Tech_RUNumber: req.body.Tech_RUNumber,
                    Tech_name: req.body.Tech_name,
                    Tech_inventor: req.body.Tech_inventor,
                    isActive: req.body.isActive   
                }).then(function(a){
                    a.setUser(req.body.Tech_marketer);
                    return res.jsonp(a);
                }).catch(function(err){
                    return res.render('error', {
                        error: err,
                        status: 500
                    });
                });
            });
    }
};

/**
 * Delete a technology
 */
exports.destroy = function(req, res) {
    // create a new variable to hold the technology that was placed on the req object.
    var technology = req.technology;

    technology.destroy().then(function(){
        return res.jsonp(technology);
    }).catch(function(err){
        return res.render('error', {
            error: err,
            status: 500
        });
    });
};

exports.runumbers = function(req,res){
    db.Technology.findOne({where: {id:req.query.id}})
    .then(function(tec){
        return res.jsonp(tec);
    }).catch(function(err){
        return res.render('error', {
            error: err,
            status: 500
        });
    });
};

exports.getcompanies = function(req,res){
    db.Company.findOne({where: {id:req.query.id}})
    .then(function(cmp){
        return res.jsonp(cmp);
    }).catch(function(err){
        return res.render('error', {
            error: err,
            status: 500
        });
    });
};

/**
 * Article authorizations routing middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.company.id !== req.company.id) {
      return res.send(401, 'User is not authorized');
    }
    next();
};
