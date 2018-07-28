/**
 * @name Pratice
 * @type {angular.Module}
 */
window.Pratice = angular.module('Pratice', ['ngRoute']);

Pratice.config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        templateUrl: 'routes/login/template.html',
        controller: 'LoginController'
    }).when('/main', {
        templateUrl: 'routes/main/template.html',
        controller: 'MainController'
    });
    $locationProvider.html5Mode(false);
});