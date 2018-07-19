// 'use strict';
/**
 * Config for the router
 */
angular.module('myapp')
  	.config(
	    ['$stateProvider','$urlRouterProvider','$controllerProvider',
	    function ($stateProvider,$urlRouterProvider,$controllerProvider) {
	    	app.registerController = $controllerProvider.register;
		    app.loadJs = function(js) {
		      return function($rootScope, $q) {
		        var def = $q.defer(),
		        deps = [];
		        angular.isArray(js) ? (deps = js) : deps.push(js);
		        require(deps, function() {
		          $rootScope.$apply(function() {
		            def.resolve();
		          });
		        });
		        return def.promise;
		      };
		    }
	        $urlRouterProvider
	            .otherwise('/login');
	        $stateProvider
	          	.state('app', {
	              	abstract: true,
	              	url: '/app',
	              	templateUrl:'app.html',
	              	resolve: {
	                  	deps: ['uiLoad',
	                    	function( uiLoad ){
		                      	return uiLoad.load([
		                      		'vendor.css',
		                      		'bundle.css',
		                      		'controllers/header.js',
		                      	]);
	                  		}
	                	]
	                }	              	
	          	})
                // 登录
                .state('login', {
	              	url: '/login',
	              	templateUrl: 'html/login.html',
	              	controller:'loginController',
	              	resolve: {
	                  	deps: ['uiLoad',
	                    	function( uiLoad ){
		                      	return uiLoad.load([
		                      		'bundle.css',
		                        	'controllers/login.js',
		                        	'style/header.css',
		                        	'style/login.css'
		                        	
		                      	]);
		                  	}
	                	]
	                }
	            })
                 /*************************卡管理*************************/ 
		        .state('app.orgcardMs', {
		          	url: '/orgcardMs',
		          	templateUrl: 'html/orgcardMs.html',
		          	controller:"orgcardMsCtrl",
		          	resolve: {
	                  	deps: ['uiLoad',
	                    	function( uiLoad ){
		                      	return uiLoad.load([
		                        	'controllers/orgcardMs.js?ranparam='+new Date(),
		                        	'bundle.js',
		                        	'vendor.css',
		                        	'style/header.css?ranparam='+new Date(),
			                        'style/orgcardMs.css?ranparam='+new Date(),
		                      	]);
		                  	}
	                	]
	                }
             	})
		        /*************************组织配置管理*************************/ 
		        .state('app.orgconfigMs', {
		          	url: '/orgconfig',
		          	templateUrl: 'html/config.html',
		          	controller:"orgconfigMsCtrl",
		          	resolve: {
	                   	deps: ['uiLoad',
	                     	function( uiLoad ){
		                       	return uiLoad.load([
			                        'controllers/mycontrol/config.js?ranparam='+new Date(),
			                        'style/header.css?ranparam='+new Date(),
			                        'style/orgconfig.css?ranparam='+new Date(),
		                       ]);
	                   	}]
	               	}
             	})
	}]
);