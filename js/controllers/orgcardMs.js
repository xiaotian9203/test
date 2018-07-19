'use strict';
/* Controllers */
app.controller('orgcardMsCtrl',['$scope','$http','SweetAlert','$state','NgTableParams','$document','urlPort','Upload', function($scope,$http,SweetAlert,$state,NgTableParams,$document,urlPort,Upload) {
    var websid=sessionStorage.websid;
   	var orgid=sessionStorage.orgid;
    // 获取当前时间
	var date = new Date();
	var strYear=date.getFullYear();
    var strmonth = date.getMonth() + 1;
    var strDate = date.getDate();
    var days=new Date(strYear,strmonth,0);
    var cardCurrentPage=1,cardWxCurrentPage=1;
    // 页面大小
    $scope.showPages=[10,15,20,25];
        //刷卡导入类型
    $scope.creditCardTypeMs=[
	    {"cardType":1,"text":"手动添加"},
	    {"cardType":2,"text":"excel导入"}
    ]
    //卡号类型
    $scope.cardsQuerySelection=[
   		{"cardtype":1,"text":"Mifare_UltraLight"},
   		{"cardtype":2,"text":"Mifare_One(S50)"},
   		{"cardtype":3,"text":"Mifare_One(S70)"},
   		{"cardtype":4,"text":"Mifare_Pro(X)"},
   		{"cardtype":5,"text":"Mifare_DESFire"},
   		{"cardtype":6,"text":"身份证"},
   		{"cardtype":238,"text":"其他"},
   	]
  	//绑定状态
  	$scope.bindingsStatusSelection=[
  		{"bindingsStatus":0,"text":"未绑定"},
   		{"bindingsStatus":1,"text":"已绑定"},
  	]
  	//卡状态
  	$scope.cardStatusSelection=[
  		{"cardStatus":0,"text":"启用"},
   		{"cardStatus":1,"text":"禁用"},
  	]
  	//卡导入类型
  	$scope.creditCardTypeMs=[
  		{'CardType':0,text:'手动导入'},
  		{'CardType':1,text:'excel导入'}
  	]
  	 //用来根据类型判断显示哪个页面
    $scope.creditCardMs={};
    $scope.creditCardMs.cardType=0;
   
  	/************刷卡列表查询************/
  	$scope.wxFlag=false;
   	$scope.cardQueryMs={};
   	$scope.cardQueryMs.selectPage=$scope.showPages[0];
   	$scope.cardQueryMs.cardnumber=null;
    $scope.cardQueryMs.cardtype=-1;
    $scope.cardQueryMs.bindingsStatus=-1;
   	/************手动输入卡号添加************/
   	$scope.cardMs={};
   	$scope.cardMs.cardType=1;
   	$scope.cardMs.cardnumber=null;
   	$scope.cardMs.cardproperty=null;
   	$scope.cardMs.phone=null;
   	$scope.cardMs.email=null;
// 	/****************卡与微信**************/
//	$scope.cardWxRemindDisplay=false;
//	$scope.cardWxDisplay=true;
	$scope.cardQueryMs.wxCardSelectPage=$scope.showPages[0];
   	$scope.wxUniteList=[
   		{'type':0,text:'彻底解绑'},
   		{'type':1,text:'更换微信'}
   	]
   	$scope.EditUntieMs={};
   	$scope.EditUntieMs.phonenum=null;
   	$scope.EditUntieMs.email=null;
   	/*******************************卡号列表查询********************************/

   	$scope.cardQuery=function(index){
   		var currentPage,selectPage;
   		if($scope.wxFlag==true){
	    	$scope.cardQueryMs.bindingsStatus=1;
	    	cardCurrentPage=index || 1;
	    	currentPage=cardCurrentPage;
	    	selectPage=$scope.cardQueryMs.selectPage
   		}else{
   			cardWxCurrentPage=index || 1;
	    	currentPage=cardWxCurrentPage;
	    	selectPage=$scope.cardQueryMs.wxCardSelectPage;
//	    	$scope.cardQueryMs.bindingsStatus=
   		}
   		$http({
	        method: 'POST',
	        dataType:'json',   
	        url:urlPort.reqUrl+urlPort.queryCard,
	        data:{
	        	"orgId":orgid,
	        	"websId":websid,
	        	"pageSize":selectPage,
		        "currentPage":currentPage,
                "bindingsStatus":$scope.cardQueryMs.bindingsStatus,
                "cardNumber": $scope.cardQueryMs.cardnumber,
                "cardType":$scope.cardQueryMs.cardtype
	        },
            headers:{
              'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
            },
            transformRequest:function(data) {
              return $.param(data);
            }  
	    }).then(function successCallback(response) {  
	    	if($scope.wxFlag==false){
	    		$scope.cardQueryMs.cardnumber=null;
			    $scope.cardQueryMs.cardtype=-1;
			    $scope.cardQueryMs.bindingsStatus=-1;
			    $scope.wxFlag=false;
	    		if(response.data.card==null && index==undefined){
	            	$scope.cardRemindDisplay=true;
   					$scope.cardDisplay=false;
	            	$scope.cardRemind="提示：暂无卡号，请先添加卡号后再查询！";
	            }else if(index!=undefined && response.data.card==null){
	            	$scope.cardRemindDisplay=false;
   					$scope.cardDisplay=false;
		    		SweetAlert.swal({
	                    title:'提示',
	                    showCancel:false,
	                    text:"暂无数据，请重新查询！",
	              },function(isConfirm){
	                	$scope.cardQuery()               	
	                });
            	}else{
            		$scope.cardRemindDisplay=false;
   					$scope.cardDisplay=true;
   					$scope.cardRemind="";
	            	var page=Math.ceil(response.data.total/$scope.cardQueryMs.selectPage);	            	
	            	$scope.cards=eval(response.data.card);
	            	var pagesize=$scope.cardQueryMs.selectPage;
	            	$(".cardsQuery_pagediv").createPage({
		                pageNum:page,//总页码
		                current: currentPage,//当前页
		                shownum: pagesize,//每页显示个数
		                backfun: function(e) {
		                    $scope.cardQuery(e.current)
		                }
	          		});
	            }	
	           
	    	}else if($scope.wxFlag==true){
	    		$scope.wxFlag=false;
	    		$scope.cards={};
			  	$scope.cardQueryMs.cardnumber=null;
			  	$scope.cardQueryMs.cardtype=-1;
		    	$scope.cardQueryMs.bindingsStatus=-1;
	    		if(response.data.card==null && index==undefined){
	            	$scope.cardWxRemindDisplay=true;
   					$scope.cardWxDisplay=false;
	            	$scope.cardWxRemindText="提示：暂无卡号与微信绑定数据，请先绑定后再查询！";
	            }else if(index!=undefined &&  response.data.card==null){
	            	$scope.cardWxRemindDisplay=false;
   					$scope.cardDisplay=false;
   					$scope.cardWxDisplay=false;
		    		SweetAlert.swal({
	                    title:'提示',
	                    text:"暂无数据，请重新查询!",
	              },function(isConfirm){
	                	$scope.cardQuery()               	
	                });
            	}else{
            		$scope.cardWxRemindDisplay=false;
   					$scope.cardWxDisplay=true;
   					$scope.cardWxRemindText="";
	            	var page=Math.ceil(response.data.total/$scope.cardQueryMs.selectPage);	            	
	            	$scope.cards=eval(response.data.card);
	            	var wxpagesize=$scope.cardQueryMs.selectPage;
	            	$(".cardsWxQuery_pagediv").createPage({
		                pageNum:page,//总页码
		                current: currentPage,//当前页
		                shownum: wxpagesize,//每页显示个数
		                backfun: function(e) {
		                    $scope.cardQuery(e.current)
		                }
	          		});
	            }	         	
	    	}
       	}, function errorCallback(response) {           
			// 请求失败执行代码
            $scope.TimeOutAlert(response.data)
	    });
   	}
   	$scope.cardQuery();
   	//卡号注销
   	$scope.cardunRegister=function(data){
   		SweetAlert.swal({
		   title: "确定要注销该卡号吗?",
		   text: "注销后与该卡号关联的一切信息将不存在",
		   type: "warning",
		   showCancelButton: true,
		   confirmButtonColor: "#DD6B55",
		   confirmButtonText: "确定",
		   cancelButtonText: "取消",
		   closeOnConfirm: false,
   		},function(isConfirm){ 
   			var unRegData=data;
   			if(isConfirm){
   				if(!!unRegData.wxInfoId){
   					
   				}else{
   					unRegData.wxInfoId=-1;
   				}
   				$http({
			        method: 'POST',
			        dataType:'json',   
			        url:urlPort.reqUrl+urlPort.cardUnregister,
			        data:{
			        	"orgId":orgid,
			        	"websId":websid,
			        	"cardId":unRegData.cardId,
			        	"wxInfoId":unRegData.wxInfoId
			        },
		            headers:{
		              'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
		            },
		            transformRequest:function(data) {
		              return $.param(data);
		            }  
			    }).then(function successCallback(response) {  				
		            if(response.data.result==0){
		            	SweetAlert.swal({
		                    title:'提示',
		                    showCancel:false,
		                    text:"注销成功！",
		               	},function(isConfirm){
		                	$scope.cardQuery()               	
		                });
		            }else if(response.data.result==-1){
		            	SweetAlert.swal({
		                    title:'提示',
		                    showCancel:false,
		                    text:"注销失败，请重试！",
		               	});
		            }else if(response.data.result==-2){
		            	SweetAlert.swal({
		                    title:'提示',
		                    showCancel:false,
		                    text:"该卡号为管理员绑定，暂不支持注销!",
		               	});
		            }
		       	}, function errorCallback(response) {
		            // 请求失败执行代码
		            $scope.TimeOutAlert(response.data)
			    });
   			}   		
	    })
   	}
   	//卡状态修改
   	$scope.cardModifyState=function(data){
   		$http({
	        method: 'POST',
	        dataType:'json',   
	        url:urlPort.reqUrl+urlPort.cardModifyState,
	        data:{
	        	"orgId":orgid,
	        	"websId":websid,
	        	"cardId":data.cardId,
	        	"state":data.cardStatus
	        },
            headers:{
              'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
            },
            transformRequest:function(data) {
              return $.param(data);
            }  
	    }).then(function successCallback(response) {  				
            if(response.data.result==0){
            	SweetAlert.swal({
                    title:'提示',
                    showCancel:false,
                    text:"修改成功！",
               	},function(isConfirm){
                	$scope.cardQuery()               	
                });
            }else if(response.data.result==-1){
            	SweetAlert.swal({
                    title:'提示',
                    showCancel:false,
                    text:"修改失败，请重试!",
               	});
            }   	
       	}, function errorCallback(response) {
            // 请求失败执行代码
            $scope.TimeOutAlert(response.data)
	    });
   		
   	}
	/************************上传excel添加 start**************************/
	$scope.excelSubmit=function(file){
        if(!!(file.name)){
	        Upload.upload({
	            url: urlPort.reqUrl+urlPort.cardUpload,
	            data: {
	            	"websId":websid,
	            	"orgid":orgid
	            },
	            file: file, 
	        }).then(function (response) {
	        	//上传成功
	        	if(response.data.result>=0){
	        		//关闭上传文件弹框
					$scope.allWarn=null;
					SweetAlert.swal({
						title:'提示',
						text:"文件上传成功",
					},function(isConfirm){
						console.log("file=",file)
						file.name='';
						file={};					
					});
				}else if(response.data.result<0){
					//上传失败
					SweetAlert.swal({
						title:'提示',
						text:response.data.msg,
					});
				}
	        }, function (response) {
	        	//请求失败
	        	$scope.TimeOutAlert(response.data);
	        }, function (evt) {
	        	//获取上传进度
	            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	        });        
	    }else{
	    	$scope.setDeviceUseFlag.filenameWarn="上传的文件不能为空";
        }
	}
	/************************上传excel添加 end**************************/
	/*************************手动输入卡号添加 **************************/
    //刷卡提交请求
    $scope.addCard=function(){
    	if(!!$scope.cardMs.cardnumber && (!!$scope.cardMs.phone || !!$scope.cardMs.email)){
    		$http({
		        method: 'POST',
		        url:urlPort.reqUrl+urlPort.addCard,
		        data:{
		        	"orgId":orgid,
		        	"websId":websid,
		        	"cardNumber":$scope.cardMs.cardnumber,
		        	"cardType":$scope.cardMs.cardType,
		        	"cardProperty":$scope.cardMs.cardproperty,
		        	"phone":$scope.cardMs.phone,
		        	"email":$scope.cardMs.email
		        },
		        headers:{
	              'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
	            },
	            transformRequest:function(data) {
	              return $.param(data);
	            }  
		    }).then(function successCallback(response) {
	    		if(response.data.result==0){
	    			SweetAlert.swal({
	                    title:'提示',
	                    text:"卡号添加成功",
	                },function(isConfirm){
	                	if(isConfirm){
	                		$scope.cardMsInit();
	                	}               	
	                });
	    		}else if(response.data.result==-1){
	    			SweetAlert.swal({
	                    title:'提示',
	                    text:"卡号添加失败",
	                });
	    		}else if(response.data.result==-2){
	    			SweetAlert.swal({
	                    title:'提示',
	                    text:response.data.msg,
	                },function(isConfirm){
	                	if(isConfirm){
	                		$scope.cardMsInit()
	                	}
	                });
	    		}
	        }, function errorCallback(response) {
	       		$scope.TimeOutAlert(response.data)
		    });
    		
    	}else{
    		SweetAlert.swal({
                title:'提示',
                text:"除卡号外，手机号和邮箱必须二填一才能提交",
            });
    	}
    }
    //清空手动添加数据
    $scope.cardMsInit=function(){
    	$scope.cardMs.cardnumber=null;
		$scope.cardMs.cardType=1;
		$scope.cardMs.cardproperty=null;
		$scope.cardMs.phone=null;
		$scope.cardMs.email=null;
    }
    /*************************微信与卡模块**************************/
    //卡微信绑定查询
	$scope.cardWxQuery=function(index){
		$scope.wxFlag=true;
		$scope.cardQuery(index)
	}
    //卡与微信解绑，点击事件，显示弹框
    $scope.wxAndCardChose=function(data){
    	console.log("data=",data)
    	sessionStorage.wxUniteData=angular.toJson(data);
    	$scope.cardWxFadeDisplay=true;
    	$scope.wxUniteDisplay='flex';
    	$scope.wxUnite_Display=true;
    	$("#wxlistModal").addClass('in');
    }
    //卡微信解绑--选择解绑方式
	$scope.wxUniteListFun=function(data){
//		console.log("data=",data)
		if(data.type==0){
			$scope.cardWxFadeDisplay=false;
	    	$scope.wxUniteDisplay='none';
	    	$scope.wxUnite_Display=false;
	    	$("#wxlistModal").removeClass('in');
			$scope.wxAndCardUniteConfirm()
		}else if(data.type==1){
			$scope.cardWxFadeDisplay=false;
			$scope.wxUniteDisplay='none';
	    	$scope.wxUnite_Display=false;
	    	$("#wxlistModal").removeClass('in');
	    	
	    	$scope.cardWxFadeDisplay=true;
			$scope.uniteEdit_Display=true;
			$scope.uniteEditDisplay='flex';
			$('#uniteEditModal').addClass('in');
		}
	}
    $scope.wxAndCardUniteConfirm=function(){ 	
    	SweetAlert.swal({
		   title: "确定要解绑吗?",
		   text: "解绑后该卡号与微信关联的一切信息将不存在",
		   type: "warning",
		   showCancelButton: true,
		   confirmButtonColor: "#DD6B55",
		   confirmButtonText: "确定",
		   cancelButtonText: "取消",
		   closeOnConfirm: false,
   		},function(isConfirm){ 
   			if(isConfirm){
   				$scope.wxAnndCardUnite(0);
   			}   		
	    })
    }
	//修改微信与卡的方式解绑
	$scope.wxAndCardEditUntie=function(){
		var phoneFlag,emailFlag;
		if(!!$scope.EditUntieMs.phonenum){
			var phoneReg=/^[1][3,4,5,7,8][0-9]{9}$/;
			phoneFlag=phoneReg.test($scope.EditUntieMs.phonenum)
		}
		if(!!$scope.EditUntieMs.email){
			var emailReg=/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
			emailFlag=emailReg.test($scope.EditUntieMs.email)
		}
		if((!!$scope.EditUntieMs.phonenum && phoneFlag==true) || (!! $scope.EditUntieMs.email && emailFlag==true)){
			$scope.wxAnndCardUnite(1)
		}else{
			if($scope.EditUntieMs.phonenum==null && $scope.EditUntieMs.email==null){
				SweetAlert.swal({
		            title:'提示',
		            showCancel:false,
		            text:"手机号或邮箱至少填一个！",
		       	});
			}else{
				if(phoneFlag==false && emailFlag==true){
					SweetAlert.swal({
			            title:'提示',
			            showCancel:false,
			            text:"手机号格式错误！",
			       	});
				}else if(emailFlag==false && phoneFlag==true){
					SweetAlert.swal({
			            title:'提示',
			            showCancel:false,
			            text:"邮箱格式错误！",
			       	});
				}else{
					SweetAlert.swal({
			            title:'提示',
			            showCancel:false,
			            text:"邮箱或手机号格式错误！",
			       	});
				}
			}
			
		}
	}
	//微信与卡解绑请求  mark：0.删除卡号表的手机号与邮箱 1.修改卡号表的手机号与邮箱
	$scope.wxAnndCardUnite=function(mark){
		var data=angular.fromJson(sessionStorage.wxUniteData);
		console.log("session data=",data)
		$http({
	        method: 'POST',
	        dataType:'json',   
	        url:urlPort.reqUrl+urlPort.wxAndCardUntie,
	        data:{
	        	"orgId":orgid,
	        	"websId":websid,
	        	"cardId":data.cardId,
	        	"wxInfoId":data.wxInfoId,
	        	"mark":mark,
	        	"phone":$scope.EditUntieMs.phonenum,
	        	"email":$scope.EditUntieMs.email
	        },
            headers:{
              'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
            },
            transformRequest:function(data) {
              return $.param(data);
            }  
	    }).then(function successCallback(response) {  				
            if(response.data.result==0){
            	SweetAlert.swal({
                    title:'提示',
                    showCancel:false,
                    text:"注销成功！",
               	},function(isConfirm){
               		$scope.EditUntieMs.phonenum=null;
	        		$scope.EditUntieMs.email=null;
	        		$scope.cardWxFadeDisplay=false;
					$scope.uniteEdit_Display=false;
					$scope.uniteEditDisplay='none';
					$('#uniteEditModal').removeClass('in');
                	$scope.cardWxQuery()               	
                });
            }else if(response.data.result==-1){
            	SweetAlert.swal({
                    title:'提示',
                    showCancel:false,
                    text:"注销失败，请重试！",
               	},function(isConfirm){
               		if(isConfirm){
               			$scope.cardWxFadeDisplay=true;
						$scope.uniteEdit_Display=true;
						$scope.uniteEditDisplay='flex';
						$('#uniteEditModal').addClass('in');
               		}
               	});
            }   	
       	}, function errorCallback(response) {
            // 请求失败执行代码
            $scope.TimeOutAlert(response.data)
	    });
	}
	//弹框选择解绑方式关闭
	$scope.wxUniteChoseClose=function(){
		$scope.cardWxFadeDisplay=false;
    	$scope.wxUniteDisplay='none';
    	$scope.wxUnite_Display=false;
    	$("#wxlistModal").removeClass('in');
	}
	//关闭更改微信弹框
	$scope.uniteEditClose=function(){
		$scope.cardWxFadeDisplay=false;
		$scope.uniteEdit_Display=false;
		$scope.uniteEditDisplay='none';
		$('#uniteEditModal').removeClass('in');
		
		$scope.cardWxFadeDisplay=true;
    	$scope.wxUniteDisplay='flex';
    	$scope.wxUnite_Display=true;
    	$("#wxlistModal").addClass('in');
	}

}]);
app.filter("showAsHtml",function($sce){
    return function (text) { 
	   return $sce.trustAsHtml(text); 
	  }
});