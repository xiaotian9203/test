'use strict';
/* Controllers */
angular.module('myapp')
  .controller('AppCtrl', ['$scope','$http','$translate','$state','$localStorage','$window','urlPort','SweetAlert',
    function($scope,$http,$translate,$state,$localStorage,$window ,urlPort,SweetAlert) {
      // add 'ie' classes to html
      var isIE = !!navigator.userAgent.match(/MSIE/i);
      isIE && angular.element($window.document.body).addClass('ie');
      isSmartDevice( $window ) && angular.element($window.document.body).addClass('smart');
      // config
      $scope.app = {
        name: '新版门禁组织管理系统',
        version: '1.0.0',
        // for chart colors
        color: {
          primary: '#7266ba',
          info:    '#23b7e5',
          success: '#27c24c',
          warning: '#fad733',
          danger:  '#f05050',
          light:   '#e8eff0',
          dark:    '#3a3f51',
          black:   '#1c2b36'
        },
        settings: {
          themeID: 1,
          navbarHeaderColor: 'bg-black',
          navbarCollapseColor: 'bg-white-only',
          asideColor: 'bg-black',
          headerFixed: true,
          asideFixed: false,
          asideFolded: false,
          asideDock: false,
          container: false
        }
      }
      // save settings to local storage
      if ( angular.isDefined($localStorage.settings) ) {
        $scope.app.settings = $localStorage.settings;
      } else {
        $localStorage.settings = $scope.app.settings;
      }
      $scope.$watch('app.settings', function(){
        if( $scope.app.settings.asideDock  &&  $scope.app.settings.asideFixed ){
          // aside dock and fixed must set the header fixed.
          $scope.app.settings.headerFixed = true;
        }
        // save to local storage
        $localStorage.settings = $scope.app.settings;
      }, true);

      // angular translate
      $scope.lang = { isopen: false };
      $scope.langs = {en:'English', de_DE:'German', it_IT:'Italian'};
      $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "English";
      $scope.setLang = function(langKey, $event) {
        // set the current lang
        $scope.selectLang = $scope.langs[langKey];
        // You can change the language during runtime
        $translate.use(langKey);
        $scope.lang.isopen = !$scope.lang.isopen;
      };

      function isSmartDevice( $window )
      {
          // Adapted from http://www.detectmobilebrowsers.com
          var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
          // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
          return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
      }
      //退出结束会话请求
	 		$scope.logout=function(){
	   		var websid=sessionStorage.websid;
	   		$http({		       
		        url:urlPort.reqUrl+urlPort.weblogout,
		        data:{
		        	"websid":websid,        	     	
		        },
		        method: 'POST',
		        headers:{
              'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
            },
            transformRequest:function(data) {
              return $.param(data);
            }  
		    }).then(function successCallback(response) {
		    	if(response.data.result==true){
		    		sessionStorage.websid=undefined;
		    		sessionStorage.permissionList=undefined;
		    		sessionStorage.orgid=undefined;
		    		sessionStorage.orgname=undefined;
		    		sessionStorage.fullname=undefined;
		    		sessionStorage.funcRoleId=undefined;
		    		sessionStorage.removeItem('orgBindPersonId');
						sessionStorage.removeItem('orgBindDeviceId');
						sessionStorage.removeItem('unbindDeviceAllFlag');
						sessionStorage.removeItem('unbindPersonAllFlag');
		    		$state.go("login");
		    	}
		    }, function errorCallback(response) {
		    	$scope.TimeOutAlert(response.data)
	    });
   	}
    //会话超时异常弹框
 		$scope.TimeOutAlert=function(msg){
 			SweetAlert.swal({
		        title:msg.code,
		        text: msg.message,
		    },function(isConfirm){
		    	if(msg.code==601){
		    		sessionStorage.websid=undefined;
		    		sessionStorage.permissionList=undefined;
		    		sessionStorage.orgid=undefined;
		    		sessionStorage.orgname=undefined;
		    		sessionStorage.fullname=undefined;
		    		sessionStorage.funcRoleId=undefined;
		    		$state.go("login");
		    	}
		    });
 		}
 		//刷新页面
	  $scope.reloadRoute = function () {
		  $window.location.reload();
		};
 	 //密码眼睛显示与隐藏
    $scope.glyphiconChange=function(){
   		if($scope.passwordType=="password"){
   			$scope.passwordType="text";
   			$scope.glyphicon="glyphicon glyphicon-eye-open";
   		}else if($scope.passwordType=="text"){
   			$scope.passwordType="password";
   			$scope.glyphicon="glyphicon glyphicon-eye-close";
   		}
   	}
}]);