'use strict';

module.exports = function(sequelize, DataTypes) {
	var Event = sequelize.define('Event', {
			Event_date: DataTypes.DATE,
			Event_notes: DataTypes.STRING,
			Event_outcome: DataTypes.STRING,
			Event_method: DataTypes.STRING,
			Event_flag: DataTypes.BOOLEAN,
			Event_followupdate: DataTypes.DATE,
			FollowedUp: DataTypes.BOOLEAN
		},
		{
			associate: function(models) {
				Event.belongsTo(models.User, {through: 'UserEvents'});
				Event.belongsTo(models.Company, {through: 'CompanyEvents'});
				Event.belongsTo(models.Technology, {through: 'TechEvents'});
				Event.belongsToMany(models.Contact, {
					through: 'ContactEvents',
					foreignKey: "Event_rowId"
				});
			}
		}

	);
	return Event;
};
