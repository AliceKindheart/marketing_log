'use strict';

/**
 * Module dependencies.
 */
var StandardError = require('standard-error');
var db = require('../../config/sequelize');

/**
 * List of Events
 */
exports.all = function(req, res) {
    console.log("exports.all events happened WHEN IT SHOULDNT");
    
    db.Event.findAll().then(function(events){
        return res.jsonp(events);
    }).catch(function(err){
        return res.render('error', {
            error: err,
            status: 500
        });
    });
};

exports.create = function(req, res) {
    var techtofind = req.body.Technology;
    var comptofind = req.body.Company;
    var user;
    var tek;
    var comp;

    db.Company.findOne({where: {Company_name: comptofind.Company_name}
        }).then(function(cmp){
            comp = cmp;
            return db.Technology.findOne({where: {id: techtofind.id}
            }).then(function(foundtech){
                tek=foundtech;
            // save and return an instance of event on the res object. 
                return db.Event.create(req.body);
            }).then(function(event){
                    event.setUser(req.user, {through: 'UserEvents'});
                    event.setTechnology(tek, {through: 'TechEvents'});
                    event.setCompany(comp, {through:'CompanyEvents'});
                    comp.addEvent(event, {through:"CompanyEvents"});

                    for(var i=0; i<req.body.Contacts.length; i++){
                        console.log("req.body.Contacts[i]", req.body.Contacts[i]);
                        db.Contact.findOne({where: {id: req.body.Contacts[i].id}
                            }).then(function(cont){
                                cont.addEvent(event);
                            });
                    }

                    if(!event){
                        return res.send('users/signup', {errors: new StandardError('EVENT could not be created')});
                    } else {
                        return res.jsonp(event);
                    }
            }).catch(function(err){
                return res.render('error', {
                    error: err,
                    status: 500
                });
            });
        });
};

exports.destroy = function(req, res) {
    // create a new variable to hold the event that was placed on the req object.
    var event = req.event;

    event.destroy().then(function(){
        return res.jsonp(event);
    }).catch(function(err){
        return res.render('error', {
            error: err,
            status: 500
        });
    });
};
/**
 * Find event by id
 * Note: This is called every time that the parameter :id is used in a URL. 
 * Its purpose is to preload the company on the req object then call the next function. 
 */
exports.event = function(req, res, next, id) {
    db.Event.find({where: {id: id}, include: [{model: db.User}, {model: db.Technology}, {model: db.Contact}, {model: db.Company}]}).then(function(event){
        if(!event) {
            return next();
        } else {
            req.event = event;
           return next();            
        }
    }).catch(function(err){
        return next(err);
    });
};

exports.findcompanies = function(req,res){
    db.Company.findAll({include: [{model: db.Contact}], order: 'Company_name'})
        .then(function(comps){
            return res.jsonp(comps);
        });
};

exports.findkomp = function(req, res){
    db.Company.findOne({where: {id:req.query.CompId}})
        .then(function(komp){
            return res.jsonp(komp);
        });
};

exports.findtech = function(req,res){
    db.Technology.findOne({where: {id: req.query.id}})
        .then(function(tec){
            return res.jsonp(tec);
        });
};

exports.findteck = function(req,res){
    db.Technology.findOne({where: {id:req.query.TechId}})
        .then(function(teck){
            return res.jsonp(teck);
        });
};

exports.getcontacts = function(req,res){
    db.Company.findOne({where: {Company_name: req.query.Company_name}, include: {model: db.Contact}})
        .then(function(company){
            return res.jsonp(company);   
        });
};

exports.getcontactsforevents = function(req,res){
    db.Contact.getEvents({
            where: {Event_rowId: req.query.id}
        }).then(function(cntcs){
            return res.jsonp(cntcs);
        }).catch(function(err){
            return res.render('error', {
                error: err,
                status: 500
            });
        });
};

exports.getem = function(req,res){
    var internid = [];
    if(typeof req.query.internid==="string"){
        internid.push(req.query.internid);
    } else {
        internid = req.query.internid;
    }

    db.Event.findAll({
            where: {
                $or: [
                    {UserId: req.user.id},
                    {UserId: {$in: internid}}
                ],
                Event_followupdate: {$ne:null}, 
                Event_flag: true}, 
            include: [{model: db.Contact}, {model: db.User}, {model:db.Company}, {model:db.Technology}], 
            order: 'Event_date'})
        .then(function(evnts){
            return res.jsonp(evnts);
        }).catch(function(err){
            return res.render('error', {
                error: err,
                status: 500
            });
        });
};

exports.getemfornonadmin = function(req,res){
    db.Event.findAll({
            where: {
                UserId: req.user.id, 
                Event_followupdate: {$ne:null}, 
                Event_flag: true}, 
            include: [{model: db.Contact}, {model: db.User}, {model:db.Company}, {model:db.Technology}], 
            order: 'Event_date'})
        .then(function(evnts){
            return res.jsonp(evnts);
        }).catch(function(err){
            return res.render('error', {
                error: err,
                status: 500
            });
        });
};

exports.geteventinfo = function(req,res){
    db.Event.findOne({where: {id:req.query.id}, include: [{model: db.User}, {model: db.Technology}]})
        .then(function(event){
            return res.jsonp(event);
        }).catch(function(err){
            return res.render('error', {
                error: err,
                status: 500
            });
        });
};

exports.getusers = function(req,res){
    db.User.findOne({where: {id: req.query.id}})
    .then(function(user){
        return res.jsonp(user);
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

exports.newuser = function(req,res) {
    db.User.findOne({where: {name: req.query.name}})
        .then(function(user){
            return res.jsonp(user);
        });
};
/* Show an event
 */
exports.show = function(req, res) {
    // Sending down the event that was just preloaded by the events.event function
    // and saves event on the req object.
    return res.jsonp(req.event);
};

exports.update = function(req, res) {
    // create a new variable to hold the company that was placed on the req object.
    var event = req.event;
    var newuser;
    var newcomp;

    return event.updateAttributes({
        Event_date: req.body.Event_date,
        Event_notes: req.body.Event_notes,
        Event_outcome: req.body.Event_outcome,
        Event_method: req.body.Event_method,
        Event_flag: req.body.Event_flag,
        Event_followupdate: req.body.Event_followupdate,
        FollowedUp: req.body.Followedup
    }).then(function(event){
        if(req.body.company){
            db.Company.findOne({where: {Company_name: req.body.company}})
            .then(function(comp){
                newcomp=comp;
            }).then(function(){
                event.setCompany(newcomp, {through: 'CompanyEvents'});
            });
        }

        if (req.body.userchange===true){
            db.User.findOne({where: {name: req.body.newusername}})
            .then(function(user){
                console.log("USER: ", user);
                newuser = user;
            }).then(function(){
                event.setUser(newuser, {through: 'UserEvents'});
            });
        }

        //modify contacts if the company has been changed or contactids exist
        if(req.body.company || req.body.contactids.length!==0){   
            db.Contact.findAll({where: {id: req.body.contactids}})
            .then(function(contact){
                if(contact.length===0){
                    event.setContacts([], {through: 'ContactEvents'});
                }
                for (var j=0; j<contact.length; j++){
                    event.setContacts([contact[j]], {through: 'ContactEvents'});
                }
            });
        }
        return res.jsonp(event);
    }).catch(function(err){
        return res.render('error', {
            error: err, 
            status: 500
        });
    });
};
    