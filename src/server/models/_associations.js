'use strict';

module.exports = function(models) {
  models.answer.belongsTo(models.question, {onDelete: 'cascade'});
  models.question.hasMany(models.answer, {onDelete: 'cascade'});
  models.clientAnswer.belongsTo(models.client, {through: models.client});
  models.clientAnswer.belongsTo(models.answer, {through: models.answer});
};
