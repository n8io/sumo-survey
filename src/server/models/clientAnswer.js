'use strict';

module.exports = function(sequelize, DataTypes) {
  const clientAnswer = sequelize.define('clientAnswer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  });

  return clientAnswer;
};
