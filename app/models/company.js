'use strict';

module.exports = function(sequelize, DataTypes) {

	var Company = sequelize.define('Company', {	
			Company_name: DataTypes.STRING,
			Company_email: DataTypes.STRING,
			Company_phone: DataTypes.STRING,
			Notes: DataTypes.STRING,
		},{
			associate: function(models) {
					Company.belongsToMany(models.Tag, {through: 'CompanyTags'});
					Company.belongsToMany(models.Contact, {through: 'CompanyContacts'});
					Company.belongsToMany(models.Event, {through: 'CompanyEvents'});
			}
		},{
			indexes: [
				{type: 'FULLTEXT', name: 'text_idx', fields: ['Company_name']}
			]
		}	
	);
	
	return Company;
};
