'use strict';

/**
* Module dependencies.
*/
var passport = require('passport');

module.exports = function(app) {
// User Routes
var users = require('../../app/controllers/users');

// User Routes
app.route('/users/:usersid')
    .put(users.update)

app.get('/signout', users.signout);
app.get('/users/me', users.me);
app.get('/showusers', users.getall);
app.get('/isadmin', users.isadmin);
app.get('/getadmins', users.getadmins);
app.get('/user/id', users.findOne);
app.get('/currentuser', users.user);
app.put('/updateuser', users.update);
app.delete('/deleteuser', users.delete);
app.post('/changepassword', users.changepassword);

// Setting up the users api
app.post('/users', users.create);

// Setting the local strategy route
app.post('/users/session', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
}), users.session);

// Finish with setting up the userId param
app.param('userId', users.user);
};

