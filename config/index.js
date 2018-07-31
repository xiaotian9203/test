var config = {
    local: {
        apiHost: '',
        assetsHost: 'http://localhost:4000'
    },
    staging: {
        apiHost: '',
        assetsHost: 'http://localhost:4400'
    },
    prod: {
        apiHost: '',
        assetsHost: 'http://localhost:4400'
    }
};
var localConfig = null;

try{
    localConfig = require('./local');
    Object.assign(config.local, localConfig);
}catch (e) {
    console.log('no local config found, skip'); // eslint-disable-line
}


exports.getConfig = function(argv){
    if(argv.prod){
        return config.prod;
    }else if(argv.staging){
        return config.staging;
    }
    return config.local;
};