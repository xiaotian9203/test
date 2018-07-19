'use strict';
/* Controllers */
app.controller('headerController',["$cookies",'$scope',function($cookies,$scope) {
	$scope.orgname=sessionStorage.orgname;
	$scope.fullname=sessionStorage.fullname;
	if($scope.fullname=='undefined' || $scope.fullname==undefined){
		$scope.fullname=''
	}
}]);
