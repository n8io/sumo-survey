(function() {
  'use strict';

  angular.module('surveyApp', [
    'ngResource',
    'ngMaterial'
  ]);

  angular
    .module('surveyApp')
    .config(['$httpProvider', function($httpProvider) {
      $httpProvider.defaults.xsrfCookieName = 'XSRF-TOKEN';
      $httpProvider.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
    }])
    .filter('uuid8', function() {
      return function(val) {
        return typeof val === 'string' ? val.substring(0, 8) : val;
      };
    })
    .factory('QuestionService', ['$resource', function($resource) {
      return $resource('/api/questions/:id');
    }])
    .factory('QuestionResultsService', ['$resource', function($resource) {
      return $resource('/api/questions/:id/results');
    }])
    .controller('AnswerController', [function() {
      var vm = this;

      vm.onSubmitClick = onSubmitClick;

      vm.question = window.__question || null;

      function onSubmitClick(ev) {

      }
    }])
    .controller('QuestionController', ['$timeout', '$http', 'QuestionService', function($timeout, $http, QuestionService) {
      var vm = this;

      vm.isLoading = true;

      if (!window.__key) {
        vm.question = {
          answers: []
        };
        vm.question.answers.push(getEmptyOption());
        vm.question.answers.push(getEmptyOption());
        vm.isLoading =  false;
      }
      else {
        QuestionService.get({id: window.__key}).$promise.then(function(question) {
          vm.question = question;
          vm.originalQuestion = angular.copy(question);
          vm.isLoading =  false;
        });
      }

      vm.isValid = isValid;
      vm.onAddOptionClick = onAddOptionClick;
      vm.onRemoveItemClick = onRemoveItemClick;
      vm.onSubmitClick = onSubmitClick;

      init();

      function onRemoveItemClick(index) {
        vm.question.answers.splice(index, 1);
      }

      function onAddOptionClick(ev) {
        if (!vm.question.answers) {
          vm.question.answers = [];
        }

        vm.question.answers.push(getEmptyOption());

        $timeout(function() {
          $('.option').last().focus();
        }, 300);
      }

      function onSubmitClick(ev) {
        // Made it this far, client side validation passed
        var data = angular.fromJson(angular.toJson(vm.question));

        QuestionService.save(data, function(question) {
          window.location = '/questions';
        }, function(err) {
            console.log(err);

            vm.isSubmitting = false;
        });
      }

      function getEmptyOption() {
        return {text: ''};
      }

      function isValid() {
        var valid = true;

        if (vm.isLoading || vm.isSubmitting) {
          return false;
        }

        if (vm.originalQuestion && angular.equals(vm.question, vm.originalQuestion)) {
          return false;
        }

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

      function init() {
        if (!window.__key) {
          $timeout(function() {
            $('.question').focus();
          }, 300);
        }
      }
    }])
    .controller('QuestionAdminController', ['$mdDialog', 'QuestionService', function($mdDialog, QuestionService) {
      var vm = this;

      vm.onDeleteClick = onDeleteClick;

      init();

      function init() {
        vm.questions = QuestionService.query();
      }

      function onDeleteClick(ev, question) {
        var confirm = $mdDialog.confirm()
          .title('Are you sure you want to delete this question?')
          .textContent('This cannot be undone. All responses will be lost.')
          .ariaLabel('Are you sure?')
          .targetEvent(ev)
          .ok('CANCEL')
          .cancel('DELETE');

        $mdDialog.show(confirm).then(function() { /* cancelled */ }, function() {
          deleteQuestion(question);
        });
      }

      function deleteQuestion(question) {
        QuestionService.delete({id: question.key.substring(0, 8)}, function() {
          QuestionService.query().$promise.then(function(questions) {
            vm.questions = questions;
          });
        });
      }
    }])
    ;

    setTimeout(function() {
      $('body').addClass('resolved');
    }, 300);
})();
