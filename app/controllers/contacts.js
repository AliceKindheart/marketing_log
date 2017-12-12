'use strict';

/**
 * Module dependencies.
 */
var StandardError = require('standard-error');
var db = require('../../config/sequelize');

/**
 * Find contact by id
 * Note: This is called every time that the parameter :id is used in a URL. 
 * Its purpose is to preload the contact on the req object then call the next function. 
 */
exports.contact = function(req, res, next, id) {
    console.log('contactid => ' + id);
    console.log("CONTACTS.CONTACT");
    db.Contact.find({where: {id: id}, include: [{model: db.Company}, {model: db.Tag}, {model:db.Event}]}).then(function(contact){
        if(!contact) {
            return next();
        } else {
            req.contact = contact;
            console.log("CONTACT");
           return next();            
        }
    }).catch(function(err){
        return next(err);
    });
};

/**
 * Create a contact
 */
exports.create = function(req, res) {
    req.body.UserId = req.user.id;
    console.log("req.bodyJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ");
    console.log(req.body);
    var companyid;
    var foundcompany;
    var contact; 
    var tagrows;

    // save and return an instance of contact on the res object. 
    db.Company.findOne({where:{Company_name: req.body.Company_name}, include: {model: db.Contact}})
        .then(function(company){
            foundcompany = company;
            companyid = company.id ;
            return db.Contact.create(req.body);
        }).then(function(contact){
            contact.setCompany(foundcompany);
            foundcompany.addContact(contact);
            return contact.updateAttributes({
                CompanyId: companyid
            });
        }).then(function(contact){
            if (req.body.Tag_name){
                var Tagnames = req.body.Tag_name;
                db.Tag.findAll({where:{Tag_name:{$in:Tagnames}}})
                    .then(function(rowoftags){
                        tagrows=rowoftags;
                        return contact.addTags(tagrows);
                    }); 

            } 
            return res.jsonp(contact);
        }).catch(function(err){
            return res.status(status).send('users/signup', {
                errors: err,
                status: 500
            });
        });
};

exports.search = function(req,res) {
    db.Contact.findAll({
        where: {Contact_name: {$like: '%' + req.query.contactname + '%'}},
        include: [{model: db.Company}, {model: db.Tag}], 
        order: 'Contact_name'
    }).then(function(contacts){
        return res.jsonp(contacts);
    });
};

/**
 * Update a contact
 */
exports.update = function(req, res) {
    // create a new variable to hold the contact that was placed on the req object.
    var contact = req.contact;
    var newcompany;
    var compid;
    var newtags = req.body.Tag_name.join(", ").split(", ");
    var tagrows;
    var oldcompany = req.body.Company;
    
    if(oldcompany){
        db.Company.findOne({where:{id: oldcompany.id}, include: {model: db.Contact}})
            .then(function(oc){
                oc.removeContact(contact);
                return db.Company.findOne({where:{Company_name: req.body.compname}, include: {model: db.Contact}});
            }).then(function(company){
                newcompany=company;
                compid = company.id;
                return contact.updateAttributes({
                    Contact_name: req.body.Contact_firstname + " " + req.body.Contact_lastname,
                    Contact_firstname: req.body.Contact_firstname,
                    Contact_lastname: req.body.Contact_lastname,
                    Contact_title: req.body.Contact_title,
                    Contact_email: req.body.Contact_email,
                    Contact_phone: req.body.Contact_phone,
                    Contact_notes: req.body.Contact_notes
                });
            }).then(function(contact){
                contact.setCompany(newcompany);
                newcompany.addContact(contact);
                db.Tag.findAll({where: {Tag_name: {$in:newtags}}})
                    .then(function(rowoftags){
                        contact.setTags(rowoftags);
                        return res.jsonp(contact);
                    }).catch(function(err){
                        return res.render('error', {
                            error: err, 
                            status: 500
                        });
                    });
        });
    } else {
        return db.Company.findOne({where:{Company_name: req.body.compname}, include: {model: db.Contact}
        }).then(function(company){
            newcompany=company;
            compid=company.id;
            return contact.updateAttributes({
                Contact_name: req.body.Contact_firstname + " " + req.body.Contact_lastname,
                Contact_firstname: req.body.Contact_firstname,
                Contact_lastname: req.body.Contact_lastname,
                Contact_title: req.body.Contact_title,
                Contact_email: req.body.Contact_email,
                Contact_phone: req.body.Contact_phone,
                Contact_notes: req.body.Contact_notes
            });
        }).then(function(contact){
                contact.setCompany(newcompany);
                newcompany.addContact(contact);
                db.Tag.findAll({where: {Tag_name: {$in:newtags}}})
                        .then(function(rowoftags){
                            contact.setTags(rowoftags);
                            return res.jsonp(contact);
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
 * Delete a contact
 */
exports.destroy = function(req, res) {
    // create a new variable to hold the company that was placed on the req object.
    var contact = req.contact;
    contact.destroy().then(function(){
        return res.jsonp(contact);
    }).catch(function(err){
        return res.render('error', {
            error: err,
            status: 500
        });
    });
};

/**

 * Show a contact
 */
exports.showy = function(req, res) {
    // Sending down the contact that was just preloaded by the contacts.contact function
    // and saves contact on the req object.
    return res.jsonp(req.contact);
};
/**
 * List of Contacts
 */
exports.all = function(req, res) {    
    db.Contact.findAll({include: [{model: db.Company}, {model: db.Tag}], order: "Contact_lastname"}).then(function(contacts){
        return res.jsonp(contacts);
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
    if (req.contact.id !== req.contact.id) {
      return res.send(401, 'User is not authorized');
    }
    next();
};


