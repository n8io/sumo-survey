(function() {
  'use strict';

  angular.module('surveyApp', ['ngMaterial']);

  angular
    .module('surveyApp')
    .controller('AnswerController', [function() {
      var vm = this;

      vm.onSubmitClick = onSubmitClick;

      vm.possibleAnswers = [
        {
          id: 1,
          text: 'Red'
        },
        {
          id: 2,
          text: 'Green'
        },
        {
          id: 3,
          text: 'Blue'
        }
      ];

      function onSubmitClick(ev) {

      }
    }])
    .controller('QuestionController', [function() {
      var vm = this;

      vm.question = {
        answers: []
      };
      vm.question.answers.push(getEmptyOption());
      vm.question.answers.push(getEmptyOption());

      vm.isValid = isValid;
      vm.onAddOptionClick = onAddOptionClick;
      vm.onRemoveItemClick = onRemoveItemClick;

      function onRemoveItemClick(index) {
        vm.question.answers.splice(index, 1);
      }

      function onAddOptionClick(ev) {
        vm.question.answers.push(getEmptyOption());
      }

      function getEmptyOption() {
        return {text: ''};
      }

      function isValid() {
        var valid = true;

        if (!vm.question.text) {
          return false;
        }

        if (!vm.question.answers || vm.question.answers.length < 2) {
          return false;
        }

        vm.question.answers.forEach(function(a) {
          if (!a.text || !a.text.length) {
            valid = false;
          }
        });

        if (!valid) {
          return false;
        }

        return true;
      }
    }])
    ;
})();
