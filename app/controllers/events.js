'use strict';

/**
 * Module dependencies.
 */
var StandardError = require('standard-error');
var db = require('../../config/sequelize');
var sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.gridemail = function(req, res){
    var msg = req.params.msg;
    sgMail.send(msg);
    return res.jsonp(msg);
};
/**
 * List of Events
 */
exports.all = function(req, res) {
    console.log("exports.all events happened WHEN IT SHOULDNT");
    
    db.Event.findAll().then(function(events){
        //console.log("EVVVVVVENNNNTTTSSS");
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
    //console.log("REQ>BODY.company", req.body.Company);
    var comptofind = req.body.Company;
    console.log("REQBODYCONTACTS", req.body.Contacts);
    //console.log("comptofind.CONTACTS", comptofind.Contacts);
    var user;
    var tek;
    var comp;

    db.Company.findOne({where: {Company_name: comptofind.Company_name}
        }).then(function(cmp){
            comp = cmp;
            //console.log("COMAONY", comp);
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

                    //req.body.Contacts.forEach(function(cont){
                      //  console.log("CONTACT", cont);
                        //event.createContact(cont, {through: 'ContactEvents'});


                    //});

                    for(var i=0; i<req.body.Contacts.length; i++){
                        console.log("req.body.Contacts[i]", req.body.Contacts[i]);
                        db.Contact.findOne({where: {id: req.body.Contacts[i].id}
                            }).then(function(cont){
                                console.log("CTONCTAFOUND", cont);
                                cont.addEvent(event);
                            });
                       // event.setContact(req.body.Contacts[i]);
                    }

                    //event.setContacts(req.body.Contacts, {through: 'ContactEvents'});
                    if(!event){
                        console.log("NOTANEVENT!!!!");
                        return res.send('users/signup', {errors: new StandardError('EVENT could not be created')});
                    } else {
                        return res.jsonp(event);
                    }
            }).catch(function(err){
                console.log("THROWING AN ERROR MESSAGE", err);
                return res.render('error', {
                    error: err,
                    status: 500
                });
            });
        });
};

exports.destroy = function(req, res) {
    console.log("DESTROYEVENT");
    // create a new variable to hold the event that was placed on the req object.
    var event = req.event;

    event.destroy().then(function(){
        console.log("MADEITTHISFAR");
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
   // console.log('eventid => ' + id);
   // console.log("EVENTS.EVENT");
    db.Event.find({where: {id: id}, include: [{model: db.User}, {model: db.Technology}, {model: db.Contact}, {model: db.Company}]}).then(function(event){
        //console.log(id);
        if(!event) {
     //       console.log("not an event");
            //return next(new Error('Failed to load company ' + id));
            return next();
        } else {
            req.event = event;
       //     console.log("EVENT");
       //     console.log(event);
            //return res.jsonp(company);
           return next();            
        }
    }).catch(function(err){
        return next(err);
    });
};

exports.findcompanies = function(req,res){
    console.log("FINDDDCOMPPPSSS");
    db.Company.findAll({include: [{model: db.Contact}], order: 'Company_name'})
        .then(function(comps){
            //console.log("COMMPS", comps);
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
    //console.log("FINDDDTECCCCC");
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
    //console.log("GETTTTCONTACTSSSS", req.query);
    db.Company.findOne({where: {Company_name: req.query.Company_name}, include: {model: db.Contact}})
        .then(function(company){
            return res.jsonp(company);
            
        });
};

exports.getcontactsforevents = function(req,res){
    console.log("E:TLKJER:LKJEWT:KLWEJT:LWTEJ:WLTJK:WLTJ:WETJKW:ETJHEEEEEEEEEEEEEEEEEEEE");
    db.Contact.getEvents({
            where: {Event_rowId: req.query.id}
        }).then(function(cntcs){
            console.log("CATAAGDFADFG", cntcs);
            return res.jsonp(cntcs);
        }).catch(function(err){
            return res.render('error', {
                error: err,
                status: 500
            });
        });
};

exports.getem = function(req,res){
   // console.log("THEHEHTHT:SWEKT", req.query, req.user);
  // console.log("REQqqqqqqqqqqqqqqq.query", req.query);
    var internid = [];
    //console.log(typeof req.query.internid);
    if(typeof req.query.internid==="string"){
      //  console.log("number!!!!");

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
              //  UserId: req.user.id, 
                Event_followupdate: {$ne:null}, 
                Event_flag: true}, 
            include: [{model: db.Contact}, {model: db.User}, {model:db.Company}, {model:db.Technology}], 
            order: 'Event_date'})
        .then(function(evnts){
            //console.log("EVENTSEVENTSEVENTSEVETNTSEVENTESEVENTS", evnts);
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
            console.log("EVENTSEVENTSEVENTSEVETNTSEVENTESEVENTS", evnts);
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
    //console.log("REQ.QUERY", req.query);
    db.User.findOne({where: {id: req.query.id}})
    .then(function(user){
        //console.log("Found USer", user);
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
   // console.log("REQ.PARMSxxxxxxxxxxxxxxxxxxx", req.params);
   // console.log("ReQ.QUERY", req.query);
    db.User.findOne({where: {name: req.query.name}})
        .then(function(user){
            return res.jsonp(user);
        });
};
/* Show an event
 */
exports.show = function(req, res) {
 //   console.log("EVENTS.SHOW");
  //  console.log("LOOKEVENT!! SHOW!!!");
        // Sending down the event that was just preloaded by the events.event function
    // and saves event on the req object.
    return res.jsonp(req.event);
};

exports.update = function(req, res) {
    //console.log("REQ.BODYORRRRRREVVVENT", req.body);
   console.log("REQ.BODYYYYYYYYYYYYYYYYYY", req.body);
   console.log("THISGOTCSLELELELELELDDDDDDDDDDDDDDDDDDDDD");
    // create a new variable to hold the company that was placed on the req object.
    var event = req.event;
    var newuser;
    var newcomp;
        //return user;
      //  return res.jsonp(user)
    //}).then(function(){
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
        //  console.log("TOLDYOUSOOOOOOOOOOOOOOOO");
            db.User.findOne({where: {name: req.body.newusername}})
            .then(function(user){
                console.log("USER: ", user);
                newuser = user;
            }).then(function(){
                event.setUser(newuser, {through: 'UserEvents'});
            });
        }

        console.log("REQ.BODY.CONTACTidS>LENGTH:", req.body.contactids.length);
        //modify contacts if the company has been changed or contactids exist
        if(req.body.company || req.body.contactids.length!==0){
            
            console.log("HELET:LTKE:WLTK:LWTEJ:WLTJa;sldkjf;aslkdjf;saldkjf");
            
            db.Contact.findAll({where: {id: req.body.contactids}})
            .then(function(contact){
                if(contact.length===0){
                    event.setContacts([], {through: 'ContactEvents'});
                }

                console.log("THISISWHatCONTACTSLOOKSLIKE: ", contact);
                for (var j=0; j<contact.length; j++){
                    event.setContacts([contact[j]], {through: 'ContactEvents'});
                }
           // console.log("event.Contactsfor the seconddangtimealready", event.Contacts);
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
    







