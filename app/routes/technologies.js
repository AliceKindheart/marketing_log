'use strict';

/**
* Module dependencies.
*/
var technologies = require('../../app/controllers/technologies'),
users = require('../../app/controllers/users'),
companies = require('../../app/controllers/companies');

module.exports = function(app) {
// Tech Routes
app.route('/technologies')
    .get(technologies.all)
    .post(users.requiresLogin, technologies.create);
    
app.route('/technologies/:technologyid')
    .get(technologies.show)
    .put(users.requiresLogin, technologies.update)
    .delete(users.requiresLogin, technologies.destroy);

app.route('/mymarketing')
	.get(technologies.searchformine);

app.route('/mymarketingfornonadmins')
	.get(technologies.searchforjustmine);

app.route('/allcampaigns')
	.get(technologies.all);

app.route('/active')
	.get(technologies.active);

app.route('/usercampaigns')
	.get(technologies.usercampaigns);

app.route('/getrunumbers')
	.get(technologies.runumbers);

app.route('/getcompanies')
	.get(technologies.getcompanies);

app.route('/geteventsforonetechnology')
	.get(technologies.geteventsforonetechnology);

app.route('/findsuggestedcompanies')
	.get(technologies.findsuggestedcompanies);

app.route('/searchfortech')
	.get(technologies.searchfortech);

app.route('/unloved')
	.get(technologies.unloved);

app.route('/getinterninfo')
	.get(technologies.getinterninfo);

// Finish with setting up the id param
// Note: the techs.tech function will be called everytime then it will call the next function.
app.param('technologyid', technologies.technology);
};

