'use strict';
/* Controllers */
app.controller('orgconfigMsCtrl',  ['$scope','$http','$state','$document','SweetAlert','NgTableParams','urlPort','device_allflag_service', function($scope, $http,$state,$document,SweetAlert,NgTableParams,urlPort,device_allflag_service) {
    // 获取缓存数据
    var websid=sessionStorage.websid; 
    var orgid=sessionStorage.orgid;
    //查询配置信息参数
    $scope.OrgConfigKeys=new Array();
   //配置信息为空显示标识
    $scope.remindDisplay=false;
    //单个编辑标识
    $scope.editDisabled=false;
    //批量编辑标识
    $scope.BatchEditFlag=false;
    $scope.BatchEditDisabled=false;   
    // 编辑配置对象
    $scope.editMessage={};
	$scope.editMessage.websid=websid;
	$scope.editMessage.orgid=sessionStorage.orgid;
	$scope.display=false;
	$scope.orgEditDisplay=false;
	$scope.orgEdit_Display="none";
	
	//缺省配置字段
	$scope.defaultSettingMs={};
	$scope.defaultSettingMs.orgtimerangeid="";
	$scope.defaultSettingMs.orgdeviceids=[];
	//设置按钮对象
	$scope.setBtnDisabled=true;
	$scope.setBtnName='';
	//一键还原按钮显示对象
	$scope.clearBtnFlag=false;
	//选择弹框查询对象
	$scope.orgSerachMs={};
	$scope.orgSerachMs.orgtimerangename=null;
	$scope.orgSerachMs.orgdevicename=null;
	//时段对象
	$scope.orgtimerangeMs={};
	$scope.orgtimerangeMs.orgtimerangename="";
	$scope.orgtimerangeMs.orgtimerangeid="";
	var timerangeQuery_index=1;
	$scope.orgtimerangeid="";
	//设备对象
	$scope.orgdeviceMs={};
	$scope.orgdeviceMs.orgdevicename=null;
	$scope.orgdeviceMs.orgdeviceids=[];
    var DeviceQuery_index=1;
    // 设备类型
	$scope.devicetypesQuery=[
		{text:"WIFI",devicetype:0},
		{text:"有线以太网",devicetype:1}
	];
	//页面大小
	var pagesize=20;
    //存放选中项的数组
	$scope.selectedArr = [];
	//访客审核配置标识，默认为true，表示需要审核
	$scope.setChecked;
	//访客二维码配置标识，默认为true，表示静态二维码
	$scope.setQrCodeChecked;

    /**************************获取系统参数函数****************************/ 
	$scope.getorgconfig=function(num){
		if(num==''){
			$scope.OrgConfigKeys=null;
		}else if(num=='defaultset'){
			$scope.OrgConfigKeys=['ORGTIMERANGE','ORGDEVICE'];
		}else if(num=='visitorset'){
			$scope.OrgConfigKeys=['ORGAPPROVESET','DYNAMICCODE'];
		}
		//获取设备参数配置请求
    	$http({
	        method: 'POST',
	        url:urlPort.reqUrl+urlPort.getorgconfig,
	        data:{	        	
	        	"websid":websid,
	        	"orgid":$scope.editMessage.orgid,
	        	"OrgConfigKeys":$scope.OrgConfigKeys
	        },
	        headers:{
              'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
            },
            transformRequest:function(data) {
              return $.param(data);
            }  
	    }).then(function successCallback(response) {
	    	//获取configs数据
			$scope.configMs=eval(response.data.configs);
    	    if(num==''){
    	    	if(!!$scope.configMs){
					$scope.remindDisplay=false;
				}else{
					$scope.remindDisplay=true;
				}
				$scope.setBtnDisabled=false;
				$scope.setBtnName='设置';
    	    }else if(num=='defaultset'){
    	    	$scope.defaultSettingMs.orgdeviceids=[];
    	    	if($scope.configMs.length>0){
    	    		$scope.setBtnDisabled=true;
					$scope.setBtnName='重新设置';
					for(var i=0;i<$scope.configMs.length;i++){
	    	    		if($scope.configMs[i].orgconfigkey=='ORGDEVICE'){
	    	    			$scope.orgdeviceMs.orgdevicename=$scope.configMs[i].orgconfigdesc.substring(1,$scope.configMs[i].orgconfigdesc.length-1);
	    	    			$scope.deviceOrgConfigDesc=$scope.orgdeviceMs.orgdevicename;
	    	    			$scope.configMs[i].orgconfigvalue=$scope.configMs[i].orgconfigvalue.replace(/\ +/g,"");	 
	    	    			$scope.orgdeviceMs.orgconfigvalue=$scope.configMs[i].orgconfigvalue.substring(1,$scope.configMs[i].orgconfigvalue.length-1);
	    	    			$scope.defaultSettingMs.orgdeviceids=$scope.orgdeviceMs.orgconfigvalue.split(",");
	    	    		}else if($scope.configMs[i].orgconfigkey=='ORGTIMERANGE'){
	    	    			$scope.timerangeOrgConfigDesc=$scope.configMs[i].orgconfigdesc;
	    	    			$scope.orgtimerangeMs.orgtimerangename=$scope.configMs[i].orgconfigdesc;
	    	    			$scope.defaultSettingMs.orgtimerangeid=$scope.configMs[i].orgconfigvalue;   	    			
	    	    		}else{
	    	    			continue;
	    	    		}
	    	    	}   	 
    	    	}else{
    	    		$scope.setBtnDisabled=false;
					$scope.setBtnName='设置';
    	    	}   	    	   	
    	    }else if(num=='visitorset'){
    	    	if($scope.configMs[0].orgconfigvalue==0){
    	    		$scope.setChecked=true;
    	    	}else{
    	    		$scope.setChecked=false;
    	    	}
    	    	if($scope.configMs[1].orgconfigvalue==0){
    	    		$scope.setQrCodeChecked=true;
    	    	}else{
    	    		$scope.setQrCodeChecked=false;
    	    	}
    	    }
       	}, function errorCallback(response) {
       		//调用main.js的会话超时函数
    		$scope.TimeOutAlert(response.data)
	    });
	}
	$scope.getorgconfig();

	/*************************系统参数修改********************************/ 
    $scope.edit=function(row){
    	$scope.editData=angular.copy(row);
    	$("#systemEditModal").addClass("in");
    	$scope.display=true;
    	$scope.orgEditDisplay=true;
    	$scope.orgEdit_Display="block";
    	setTimeout(function(){
			$(".modal-body  input.configvalue").focus();
		},300)	
    }
    //关闭编辑弹框
    $scope.close=function(){ 
    	$("#systemEditModal").removeClass("in");
    	$scope.display=false;
    	$scope.orgEditDisplay=false;
    	$scope.orgEdit_Display="none";
    }
    //确定编辑
    $scope.editConfirm=function(){
    	$scope.editMessage.configs=$scope.editData;
		$http({
	        method: 'POST',
	        url:urlPort.reqUrl+urlPort.modorgconfig,
	        dataType:"json",
	        data:JSON.stringify($scope.editMessage),
	  	}).then(function successCallback(response) {
			if(response.data.result==true){
    			$("#systemEditModal").removeClass("in");
		    	$scope.display=false;
		    	$scope.orgEditDisplay=false;
		    	$scope.orgEdit_Display="none";
				SweetAlert.swal({
					title:'提示',
					text:"系统配置信息修改成功！",
				});
				$scope.getorgconfig();
			}else{
				SweetAlert.swal({
					title:'提示',
					text:"系统配置信息修改失败，请重试！",
				});
			}
	    }, function errorCallback(response) {
	    	//调用main.js的会话超时函数
    		$scope.TimeOutAlert(response.data)
    	});
    }
    //时段查询
     /**************************查询时段****************************/ 
	$scope.searchTime=function(index){
		timerangeQuery_index=index|| 1;
    	$http({
	        method: 'POST',
	        url:urlPort.reqUrl+urlPort.ctimerangequery,
	        data:{
	        	"orgid":orgid,
	        	"websid":websid,
	        	"pagesize":pagesize,
	        	"currentpage":timerangeQuery_index,
	        	"orgtimerangename":$scope.orgSerachMs.orgtimerangename,
	        	"begintime":'',
	        	"endtime":'',
	        	"repeatflag":''
	        },
	        headers:{
              'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
            },
            transformRequest:function(data) {
              return $.param(data);
            }  	  
        }).then(function successCallback(response) {
    		if(response.data.timeranges==null){
	    		SweetAlert.swal({
                    title:'提示',
                    showCancel:false,
                    text:"暂无数据，请重新查询！",
               });
	    	}else{	    		
	    		var page=Math.ceil(response.data.total/pagesize);
	    		$("#timerangeSearchModal").addClass("in");
    			$scope.display=true;
    			$scope.timerangeSearchModal_Display="block";
    			$scope.timerangeSearchModalDisplay=true;
				//遍历数据，把自定义描述的数字改为相应文字显示
				var zero='',customArr=[];
				for (var i = 0; i <response.data.timeranges.length; i++) {
					if(response.data.timeranges[i].customdesc!="" && response.data.timeranges[i].customdesc!=null ){					
						var customdesc=response.data.timeranges[i].customdesc.toString(2);
						for (var j = customdesc.length - 1; j >= 0; j--) {
							customArr+=customdesc[j];
						}
						var customText='';
						for (var m= 0; m<= customArr.length; m++) {		
							if(customArr[m]==1){
								if(m<customArr.length-1){
									customText+=(m+1);
									customText+=',';
								}else{
									customText+=(m+1);
								}
							}
						}
						response.data.timeranges[i].customdesc=customText;
					}
				}				
				$scope.timerangeMs=eval(response.data.timeranges);
				// 分页
			    $(".configTimerange_pagediv").createPage({
					pageNum:page,//总页码
					current: timerangeQuery_index,//当前页
					shownum: pagesize,//每页显示个数
					backfun: function(e) {
						$scope.searchTime(e.current)
					}
				});	
			}
	    }, function errorCallback(response) {
       		$scope.TimeOutAlert(response.data);
	    }); 
	}
	//关闭默认设置弹框
	$scope.chooseClose=function(num){
		if(num==0){
			//清空数据
//			$scope.defaultSettingMs.orgtimerangeid='';	
//			$scope.orgtimerangeMs={};
//			$scope.orgtimerangeMs.orgtimerangename="";
//		    $scope.orgtimerangeMs.orgtimerangeid="";
			$scope.orgSerachMs.orgtimerangename=null;			
		    //关闭弹框
			$("#timerangeSearchModal").removeClass("in");
			$scope.display=false;
			$scope.timerangeSearchModal_Display="none";
			$scope.timerangeSearchModalDisplay=false;
		}else if(num==1){
			 //关闭弹框
			 $scope.orgSerachMs.orgdevicename=null;
			$("#deviceSearchModal").removeClass("in");
			$scope.display=false;
			$scope.deviceSearchModal_Display="none";
			$scope.deviceSearchModalDisplay=false;			
		}
    }
	//获取默认缺省时段id
	$scope.radioChange=function(orgtimerangeRow){
		$scope.orgtimerangeMs.orgtimerangeid=orgtimerangeRow.orgtimerangeid;
		$scope.orgtimerangename=orgtimerangeRow.orgtimerangename;
	}	
	//时段选择确定事件
	$scope.timerangeComfirm=function(){
		if(!!$scope.orgtimerangeMs.orgtimerangeid){
			if($scope.defaultSettingMs.orgtimerangeid==''){
				$scope.timerangeRestoreFlag=false;
				$scope.orgtimerangeMs.orgtimerangename=$scope.orgtimerangename;
				$scope.defaultSettingMs.orgtimerangeid=$scope.orgtimerangeMs.orgtimerangeid;
				$scope.setBtnName='设置'
				$scope.clearBtnFlag=false;
			}else{
				if($scope.defaultSettingMs.orgtimerangeid==$scope.orgtimerangeMs.orgtimerangeid){
					$scope.timerangeRestoreFlag=false;
					$scope.clearBtnFlag=false;
					$scope.setBtnDisabled=true;
				}else{
					$scope.timerangeRestoreFlag=true;
					$scope.orgtimerangeMs.orgtimerangename=$scope.orgtimerangename;
					$scope.defaultSettingMs.orgtimerangeid=$scope.orgtimerangeMs.orgtimerangeid;
					$scope.setBtnName='重新设置'
					$scope.clearBtnFlag=true;
					$scope.setBtnDisabled=false;
				}		
			}							
			$("#timerangeSearchModal").removeClass("in");
			$scope.display=false;
			$scope.timerangeSearchModal_Display="none";
			$scope.timerangeSearchModalDisplay=false;
		}else{
			$scope.defaultSettingMs.orgtimerangeid='';			
			$scope.orgtimerangeMs={};
			$scope.orgtimerangeMs.orgtimerangename="";
		    $scope.orgtimerangeMs.orgtimerangeid="";
		}		
	}
	//一键还原事件
	$scope.oneClear=function(){
		$scope.clearBtnFlag=false;
		$scope.orgtimerangeMs.orgtimerangename=$scope.timerangeOrgConfigDesc;
		$scope.orgdeviceMs.orgdevicename=$scope.deviceOrgConfigDesc;
		if($scope.timerangeRestoreFlag){
			$scope.timerangeRestoreFlag=false;
		}
		if($scope.deviceRestoreFlag){
			$scope.deviceRestoreFlag=false;
		}
		$scope.setBtnDisabled=true;
	}
	/**********************缺省设备************************/
	$scope.searchDevice=function(indexd){
        DeviceQuery_index=indexd|| 1;
    	$http({
	        method: 'POST',
	        dataType:'json',   
	        url:urlPort.reqUrl+urlPort.cdevicequery,
	        data:{
	        	"orgid":orgid,
	        	"websid":websid,
	        	"pagesize":pagesize,
		        "currentpage":DeviceQuery_index,
                "orgdevicename": $scope.orgSerachMs.orgdevicename,
                "deviceaddress": null,
                "devicetype":null
	        },
            headers:{
              'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
            },
            transformRequest:function(data) {
              return $.param(data);
            }  
	    }).then(function successCallback(response) {
			if(response.data.devices==null){
   				SweetAlert.swal({
                    title:'提示',
                    showCancel:false,
                    text:"暂无数据，请重新查询！",
               });
   			}else{
   				$scope.selectedArr=[];
   				$("#deviceSearchModal").addClass("in");
   				$scope.display=true;
   				$scope.deviceSearchModal_Display="block";
			    $scope.deviceSearchModalDisplay=true;
                var page=Math.ceil(response.data.total/pagesize);
                $scope.devices=eval(response.data.devices);
                $scope.devicesCopy=angular.copy($scope.devices);
                 $(".configDevice_pagediv").createPage({
                    pageNum:page,//总页码
                    current: DeviceQuery_index,//当前页
                    shownum: pagesize,//每页显示个数
                    backfun: function(e) {
                        $scope.searchDevice(e.current)
                    }
               	}); 
               	 //选择人员所根据的主键字段
			    $scope.key = 'orgdeviceid';	    
			    //点击非全选框时，更新选中项
			    $scope.updateSelection = device_allflag_service.updateSelection;			
			    //全选
			    $scope.selectAll = device_allflag_service.selectAll;			
			    //判断是否选中
			    $scope.isSelected = device_allflag_service.isSelected;			
			    //全选按钮判断是否全选
			    $scope.isAllSelected = device_allflag_service.isAllSelected;
           	}
       	}, function errorCallback(response) {
            // 请求失败执行代码
            $scope.TimeOutAlert(response.data)  
	    });
    }
	//选择设备确定按钮
	$scope.deviceChoiceConfirm=function(){
		if(!!sessionStorage.allflag){
			if(!!$scope.orgSerachMs.orgdevicename){
				$scope.allflag=1;
				sessionStorage.allflag=1;
			}else if($scope.selectedArr.length==$scope.devices.length){
				$scope.allflag=0;
				sessionStorage.allflag=0;
			}else{
				$scope.allflag=sessionStorage.allflag;
			}
			if($scope.allflag==0){
				$scope.orgdeviceMs.orgdevicename="全部设备";
				$scope.setBtnDisabled=false;
				$scope.defaultSettingMs.orgdeviceids=[];
			}else{
				var count=0;
				var orgdeviceArr=new Array();
				//循环，通过count的length与$scope.defaultSettingMs的orgdeviceids的比较
				//判断选择的设备id数组与之前设置的是否一样
                for(var i=0;i<$scope.selectedArr.length;i++){
                	for(var j=0;j<$scope.defaultSettingMs.orgdeviceids.length;j++){
                		if($scope.selectedArr[i]==$scope.defaultSettingMs.orgdeviceids[j]){
                			count++;
                		}else{
                			continue;
                		}
                	}
                }
                if(count != $scope.defaultSettingMs.orgdeviceids.length){
                	$scope.clearBtnFlag=true;
                	$scope.deviceRestoreFlag=true;
                	$scope.defaultSettingMs.orgdeviceids=$scope.selectedArr;
                	$scope.setBtnName="重新配置";
                	$scope.setBtnDisabled=false;
                	for(var i=0;i<$scope.selectedArr.length;i++){
						for(var j=0;j<$scope.devicesCopy.length;j++){
							if($scope.selectedArr[i]==$scope.devicesCopy[j].orgdeviceid){
								orgdeviceArr[i]=$scope.devicesCopy[j];
								break;
							}else{
								continue;
							}
						}
					}
              		if($scope.selectedArr.length==1){
						$scope.orgdeviceMs.orgdevicename=orgdeviceArr[0].orgdevicename;
					}else if($scope.selectedArr.length>1){
						$scope.orgdeviceMs.orgdevicename=orgdeviceArr[0].orgdevicename+'等设备';
					}
                }else{
                	$scope.deviceRestoreFlag=false;
                }
			}
		}
		$("#deviceSearchModal").removeClass("in");
   		$scope.display=false;
		$scope.deviceSearchModal_Display="none";
	    $scope.deviceSearchModalDisplay=false;		
	}
	//确定配置事件
	$scope.defaultSettingFun=function(){
		$scope.allflag=sessionStorage.allflag;
		if((!!$scope.orgtimerangeMs.orgtimerangename && (!!$scope.defaultSettingMs.orgtimerangeid)) && (!!$scope.orgdeviceMs.orgdevicename || ($scope.selectedArr.length>0))){
			$http({
    			method:"POST",
    			url:urlPort.reqUrl+urlPort.orgdefaultsetting,
    			data:{
    				"websid":websid,
    				'orgid':orgid,
    				"orgtimerangeid":$scope.defaultSettingMs.orgtimerangeid,
    				"orgdeviceids":$scope.defaultSettingMs.orgdeviceids,
    				"allflag":$scope.allflag
    			},
    			headers:{
	              	'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
	            },
	            transformRequest:function(data) {
	              	return $.param(data);
	            },
	        }).then(function successCallback(response) {
				if(response.data.result==true){
					SweetAlert.swal({
	                    title:'提示',
	                    text:"配置成功",
	                },function(isConfirm){
	                	$scope.clearBtnFlag=false;
	                	$scope.defaultSettingMs.orgtimerangeid='';
	                	$scope.defaultSettingMs.orgdeviceids=[];
	                	$scope.allflag='';
	                	$scope.orgdeviceMs.orgdevicename=null;
	                	$scope.orgtimerangeMs.orgtimerangename=null;
	                	$scope.selectedArr=[];
	                	//重新查询配置信息
	                	$scope.getorgconfig('defaultset');                	
	                })
				}else if(response.data.result==false){
					SweetAlert.swal({
	                    title:'提示',
	                    text:"设置失败",
	               	},function(){
	                })
				}
	       	}, function errorCallback(response) {
	       		//调用main.js的会话超时弹框函数
	    		$scope.TimeOutAlert(response.data);
		    });    	
		}else{
			$scope.authError="请把设置字段补充完整"
		}
	}
	/*************************访客设置*****************************/
	$scope.approveset=function(e){
		console.log("approveset e=",e)
		if(e.currentTarget.checked==true){
			$scope.approveflag=0
		}else if(e.currentTarget.checked==false){
			$scope.approveflag=1;
		}
		$http({
			method:"POST",
			url:urlPort.reqUrl+urlPort.approveset,
			data:{
				"websid":websid,
				'orgid':orgid,
				"approveflag":$scope.approveflag
			},
			headers:{
              	'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
            },
            transformRequest:function(data) {
              return $.param(data);
            },
        }).then(function successCallback(response) {
			if(response.data.result==0){
				if($scope.approveflag==0){
					$scope.setChecked=true;
					SweetAlert.swal({
						title:'提示',
						text:"访客审核开启成功！"
					});
				}else if($scope.approveflag==1){
					$scope.setChecked=false;
					SweetAlert.swal({
						title:'提示',
						text:"访客审核关闭成功！",
					});
				}
			}else if(response.data.result==-1){
				SweetAlert.swal({
                    title:'提示',
                    text:"访客审核配置失败",
            	},function(isConfirm){
            		if(isConfirm){
            			if($scope.approveflag==0){
							$scope.setChecked=true;
						}else if($scope.approveflag==1){
							$scope.setChecked=false;
						}
            		}
            	});
			}
       	}, function errorCallback(response){
       		//调用main.js的会话超时弹框函数
    		$scope.TimeOutAlert(response.data);
	    });    		
	}
	/**********************************访客静态/动态二维码配置************************************/
	$scope.dynamiccodeSet=function(e){
		if(e.currentTarget.checked==true){
			$scope.dynamiccodeflag=0
		}else if(e.currentTarget.checked==false){
			$scope.dynamiccodeflag=1;
		}
		$http({
			method:"POST",
			url:urlPort.reqUrl+urlPort.dynamiccode,
			data:{
				"websid":websid,
				'orgid':orgid,
				"approveflag":$scope.dynamiccodeflag
			},
			headers:{
              	'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
            },
            transformRequest:function(data) {
              return $.param(data);
            },
        }).then(function successCallback(response) {
			if(response.data.result==0){ 
				if($scope.dynamiccodeflag==0){
		            SweetAlert.swal({
	                    title:'提示',
	                    text:"静态二维码配置成功",
	            	},function(isConfirm){
	            		if(isConfirm){
	            			$scope.setQrCodeChecked=true;
	            		}
	            	});
				}else if($scope.dynamiccodeflag==1){
					SweetAlert.swal({
	                    title:'提示',
	                    text:"动态二维码配置成功",
	            	},function(isConfirm){
	            		if(isConfirm){
	            			$scope.setQrCodeChecked=false;
	            		}
	            	});
				}
			}else if(response.data.result==-1){
				$scope.dynamiccodeflag=0;
				$scope.setQrCodeChecked=true;
				SweetAlert.swal({
					title:'提示',
					text:"二维码配置失败！",
				},function(isConfirm){
					if($scope.dynamiccodeflag==0){
						SweetAlert.swal({
							title:'提示',
							text:"静态二维码配置成功！"
						},function(isConfirm){
							if(isConfirm){
								$scope.setQrCodeChecked=true;
							}
						});
					}else if($scope.dynamiccodeflag==1){
						SweetAlert.swal({
							title:'提示',
							text:"动态二维码配置成功！"
						},function(isConfirm){
							if(isConfirm){
								$scope.setQrCodeChecked=false;
							}
						});
					}
				});
			}
       	}, function errorCallback(response) {
       		//调用main.js的会话超时弹框函数
    		$scope.TimeOutAlert(response.data);
	    });    		
	}
}]); 