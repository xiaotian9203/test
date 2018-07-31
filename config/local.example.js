/**
 * 在index.js文件中，已经配置好了local的配置
 * 但是如果每个开发者本地的配置稍有不同的话，不要直接去改index.js中的配置，因为那样会被上传
 * 而是应该在该目录下仿照local.example.js的格式新建一本local.js文件，把本地配置写在里面
 */
module.exports = {
    apiHost: '',
};