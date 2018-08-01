
window.CONFIG = window.CONFIG || {};

/**
 * @name MyAPP
 * @type {angular.Module}
 */
window.MyAPP = angular.module('MyAPP', ['ngRoute', 'templates']);

MyAPP.config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        templateUrl: 'routes/login/template.html',
        controller: 'LoginController'
    }).when('/main', {
        templateUrl: 'routes/main/template.html',
        controller: 'MainController'
    });
    $locationProvider.html5Mode(false);
});