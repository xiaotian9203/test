'use strict';
/* Controllers */
var timer;
app.controller('loginController',  ["$cookies",'$scope', '$http', '$state','SweetAlert','urlPort', function($cookies, $scope, $http, $state,SweetAlert,urlPort) {
    $scope.authError = null;
    $scope.fadeDisplay=false;
	$scope.display="none";
	$scope.loginPerson={};
  	$scope.loginPerson.accountname="";
	$scope.loginPerson.accountpassword="";
	$scope.loginPerson.captchavlue="";
	$scope.loginPerson.captchaId='';
	$scope.glyphicon="glyphicon glyphicon-eye-close";
   	$scope.passwordType="password";
   	$scope.ValidateCodeImg='';
/*******************************登录测试请求**************************************/
	$scope.login=function(){
		if($scope.loginPerson.accountname=="" && $scope.loginPerson.accountpassword!=""){
			$scope.authError="帐号不能为空"
		}else if($scope.loginPerson.accountpassword=="" && $scope.loginPerson.accountname!=""){
			$scope.authError="密码不能为空"
		}else if($scope.loginPerson.accountname!="" && $scope.loginPerson.accountpassword!=""){
//			$http({
//	            method:'POST', 
//	            url:urlPort.reqUrl+urlPort.login,
//	            data:{
//	                "accountName":$scope.loginPerson.accountname,
//	                "accountPassword":$scope.loginPerson.accountpassword,
//	                'captchaValue':$scope.loginPerson.captchavalue,
//	                "captchaId":$scope.loginPerson.captchaId
//	            },
//	            headers:{
//	              'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
//	            },
//	            transformRequest:function(data) {
//	              return $.param(data);
//	            }  
//	       }).then(function successCallback(response) {
//		       	if(response.data.resultCode ==0){
//		       		//缓存websid
//		        	sessionStorage.websid=response.data.websid;
//		        	//缓存公司信息，现阶段默认选择第一个公司
//	        		sessionStorage.orgid=response.data.orgs[0].orgId;
//	        		sessionStorage.orgname=response.data.orgs[0].orgName;
//		        	sessionStorage.fullname=response.data.fullname;
//		        	$state.go("app.orgcardMs");	
//		       	}else if(response.data.resultCode==-1){
//		       		SweetAlert.swal({
//	                    title:'提示',
//	                    text:response.data.resultMsg,
//	                });
//		       	}else if(response.data.resultCode==-2){
//		       		SweetAlert.swal({
//	                    title:'提示',
//	                    text:response.data.resultMsg,
//	                },function(isConfirm){
//	                	if(isConfirm){
//	                		//重新获取验证码
//	                		$scope.getCaptcha()
//	                	}
//	                });
//		       	}
//	       }, function errorCallback(response) {
////		       	if(response.data.code==602){
////		       		$scope.authError=response.data.message
////		       	}else{
////		       		$scope.TimeOutAlert(response.data)
////		       	}
//	        });
$state.go("app.orgcardMs");	
		}else{
			$scope.authError="帐号和密码都不能为空"
		}
	}
	/*******************************请求验证码**************************************/
	$scope.getCaptcha=function(){
		$http({
	        method: 'POST',
	        dataType:'json',   
	        url:urlPort.reqUrl+urlPort.getCaptcha,
	        data:{
	        },
	        headers:{
	          	'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
	        },
	        transformRequest:function(data) {
	        	return $.param(data);
	        }  
	   }).then(function successCallback(response) {
	   	console.log("urlPort.imgurl+'/'+response.data.capUrl=",urlPort.imgurl+'/'+response.data.capUrl)
	       	if(!!response.data.capUrl){
	       		$scope.ValidateCodeImg=urlPort.imgurl+'/'+response.data.capUrl;
	       		$scope.loginPerson.captchaId=response.data.captchaId;
	       	}	
	    }, function errorCallback(response) {        	
	        // 请求失败执行代码
	        $scope.TimeOutAlert(response.data);
	    });
	}
	$scope.getCaptcha()
}]);
