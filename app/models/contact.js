'use strict';

module.exports = function(sequelize, DataTypes) {
	var Contact = sequelize.define('Contact', {
			Contact_name: DataTypes.STRING,
			Contact_firstname: DataTypes.STRING,
			Contact_lastname: DataTypes.STRING,
			Contact_title: DataTypes.STRING,
			Contact_email: DataTypes.STRING,
			Contact_phone: DataTypes.STRING,
			Contact_notes: DataTypes.STRING
		},
		{
			associate: function(models) {
					Contact.belongsTo(models.Company, {through: "CompanyContacts"});
					Contact.belongsToMany(models.Event, {
						through: "ContactEvents",
						foreignKey: "Contact_rowId"
					});
					Contact.belongsToMany(models.Tag, {through: 'ContactTags'});

			}
		}
	);
	return Contact;
};
