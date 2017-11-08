'use strict';

/**
* Module dependencies.
*/
var users = require('../../app/controllers/users'),
events = require('../../app/controllers/events');

module.exports = function(app) {
// Company Routes
app.route('/events')
    .get(events.all)
    .post(users.requiresLogin, events.create);

app.route('/events/:eventid')
    .get(events.show)
    .put(events.update)
    .delete(users.requiresLogin, events.destroy);
//app.route('/companies/create')
//	.get(companies.all);

app.route('/companiesforevent')
	.get(events.findcompanies);
app.route('/findcompanycontacts')
	.get(events.getcontacts);
app.route('/findnewuser')
	.get(events.newuser);
app.route('/findtech')
	.get(events.findtech);
app.route('/geteventsneedingfollowup')
	.get(events.getem);
app.route('/geteventsneedingfollowupfornonadmin')
	.get(events.getemfornonadmin);
app.route('/getusers')
	.get(events.getusers);
app.route('/getcontactsforevents')
	.get(events.getcontactsforevents);
app.route('/findteck')
	.get(events.findteck);
app.route('/findkomp')
	.get(events.findkomp);
app.route('/geteventinfo')
	.get(events.geteventinfo);



// Finish with setting up the id param
// Note: the events.event function will be called everytime then it will call the next function.
//app.param(':id', events.event);
app.param('eventid', events.event);
};

