'use strict';

module.exports = function(sequelize, DataTypes) {
	var Technology = sequelize.define('Technology', {
			Tech_RUNumber: DataTypes.INTEGER,
			Tech_name: DataTypes.STRING,
			Tech_inventor: DataTypes.STRING,
			isActive: DataTypes.BOOLEAN 
		},
		{
			associate: function(models) {
					Technology.belongsToMany(models.Tag, {through: 'TechTags'});
					Technology.belongsToMany(models.Event, {through: 'TechEvents'});
					Technology.belongsTo(models.User, {through: 'UserTechnologies'});
			}
		}
	);
	return Technology;
};
