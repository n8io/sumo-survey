'use strict';

module.exports = function(sequelize, DataTypes) {
  const question = sequelize.define('question', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    text: {
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        question.belongsToMany(models.questionAnswer, {
          through: models.questionAnswer
        });
      }
    }
  });

  return question;
};
