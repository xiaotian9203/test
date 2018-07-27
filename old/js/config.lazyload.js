// lazyload config
angular.module('myapp')
    /**
   * jQuery plugin config use ui-jq directive , config the js and css files that required
   * key: function name of the jQuery plugin
   * value: array of the css js file located
   */
  .constant('JQ_CONFIG', {
    })
  // oclazyload config
  .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
      // We configure ocLazyLoad to use the lib script.js as the async loader
      $ocLazyLoadProvider.config({
          debug:  false,
          events: true,
          modules: [
              {
                  name: 'ui.select',
                  files: [
                      'node_modules/angular-ui-select/select.min.js',
                      'node_modules/angular-ui-select/select.min.css'
                  ]
              }
              
          ]
      });
  }]);