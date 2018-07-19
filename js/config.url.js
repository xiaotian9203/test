/*
 * 生产版：/product
 * 测试版:/test
 * 开发版:/develop
 */
/***********************后台url接口路径配置***********************************/
app.constant("urlPort",{
	/**********************开发版***************************/
	/**请求头部公共部分**/
	'reqUrl':window.location.protocol+'//'+window.location.host+window.location.port+window.location.pathname.substring(0,window.location.pathname.indexOf("/",window.location.pathname.lastIndexOf('/')))+'/web',	
	//二维码图片路径
	'imgurl':window.location.protocol+'//'+window.location.host,
	
	/**退出路径**/
	'logoutReq':window.location.protocol+'//'+window.location.host+window.location.port+window.location.pathname.substring(0,window.location.pathname.indexOf("/",window.location.pathname.indexOf('/')+1)),

	/**************************登录************************/
	//帐号登录接口
	'login':'/login',
	//验证码
	'queryValidateCode':'/queryValidateCode'
	
})
