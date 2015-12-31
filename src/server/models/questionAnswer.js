'use strict';

module.exports = function(sequelize, DataTypes) {
  const questionAnswer = sequelize.define('questionAnswer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        questionAnswer.belongsToMany(models.clientQnA, {
          through: models.clientQnA
        });
      }
    }
  });

  return questionAnswer;
};
