'use strict';

/**
	* User Model
	*/

var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {

	var User = sequelize.define('User', 
		{
			first_name: DataTypes.STRING,
			last_name: DataTypes.STRING,
			name: DataTypes.STRING,
			email: DataTypes.STRING,
			username: DataTypes.STRING,
			hashedPassword: DataTypes.STRING,
			provider: DataTypes.STRING,
			salt: DataTypes.STRING, 
			//facebookUserId: DataTypes.INTEGER,
			//twitterUserId: DataTypes.INTEGER,
			//twitterKey: DataTypes.STRING,
			//twitterSecret: DataTypes.STRING,
			//github: DataTypes.STRING,
			openId: DataTypes.STRING,
			admin: DataTypes.BOOLEAN,
			intern: DataTypes.BOOLEAN
		},
		{
			instanceMethods: {
				toJSON: function () {
					var values = this.get();
					delete values.hashedPassword;
					delete values.salt;
					return values;
				},
				makeSalt: function() {
					return crypto.randomBytes(16).toString('base64'); 
				},
				authenticate: function(plainText){
					return this.encryptPassword(plainText, this.salt) === this.hashedPassword;
				},
				encryptPassword: function(password, salt) {
					if (!password || !salt) {
                        return '';
                    }
					salt = new Buffer(salt, 'base64');
					return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
				}

			},
			associate: function(models) {
				User.belongsToMany(models.Technology, {through: 'UserTechnologies'});
				User.belongsTo(models.User, {as: 'Advisor', foreignKey: "AdvisorId"});
				User.hasMany(models.User, {as: 'Interns', foreignKey: 'AdvisorId'});
				//User.belongsToMany(models.Events, {through: 'UserEvents'})
			},
			get fullName(){
				return (this.first_name + " " + this.last_name);
			}

		}
	);

	return User;
};
