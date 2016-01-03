(function() {
  'use strict';

  angular.module('surveyApp', ['ngMaterial']);

  angular
    .module('surveyApp')
    .config(['$httpProvider', function($httpProvider) {
      $httpProvider.defaults.xsrfCookieName = 'XSRF-TOKEN';
      $httpProvider.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
    }])
    .controller('AnswerController', [function() {
      var vm = this;

      vm.onSubmitClick = onSubmitClick;

      vm.question = window.__question || null;

      function onSubmitClick(ev) {

      }
    }])
    .controller('QuestionController', ['$timeout', '$http', function($timeout, $http) {
      var vm = this;

      if (!window.__question) {
        vm.question = {
          answers: []
        };
        vm.question.answers.push(getEmptyOption());
        vm.question.answers.push(getEmptyOption());
      }
      else {
        vm.question = angular.fromJson(angular.toJson(window.__question));
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
        var url = vm.question.key ? '/admin/question/' + vm.question.key : '/admin/question/create';

        vm.isSubmitting = true;

        $http
          .post(url, data)
          .success(function(data, status) {
            // TODO: Set view state to submitted.

            window.location = '/admin';
          })
          .error(function(err) {
            console.log(err);

            vm.isSubmitting = false;
          })
          ;
      }

      function getEmptyOption() {
        return {text: ''};
      }

      function isValid() {
        var valid = true;

        if (vm.isSubmitting) {
          return false;
        }

        if (window.__question && angular.equals(vm.question, window.__question)) {
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
        $timeout(function() {
          $('input.question').focus();
        }, 300);
      }
    }])
    ;

    setTimeout(function() {
      $('body').addClass('resolved');
    }, 300);
})();
