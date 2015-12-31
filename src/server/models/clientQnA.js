'use strict';

module.exports = function(sequelize, DataTypes) {
  const clientQnA = sequelize.define('clientQnA', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  });

  return clientQnA;
};
