const config = {
    local: {
        apiHost: 'localhost:4000'
    },
    staging: {
        apiHost: ''
    },
    prod: {
        apiHost: ''
    }
};
let localConfig = null;

try{
    localConfig = require('./local');
    Object.assign(config.local, localConfig);
}catch (e) {
    console.log('no local config found, skip'); // eslint-disable-line
}


exports.getConfig = (argv) => {
    if(argv.prod){
        return config.prod;
    }else if(argv.staging){
        return config.staging;
    }
    return config.local;
};