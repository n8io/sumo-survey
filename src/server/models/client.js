'use strict';

module.exports = function(sequelize, DataTypes) {
  const client = sequelize.define('client', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    }
  }, {
    classMethods: {
      associate: function(models) {
        client.belongsToMany(models.clientQnA, {
          through: models.clientQnA
        });
      }
    }
  });

  return client;
};
