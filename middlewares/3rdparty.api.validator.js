
exports.checkAPITokens = async function (req, res, next) {
    let url = req._parsedUrl.pathname.split("/");
    if (url[2] == "thirdparty") {
        let API_KEY = req.headers.api_key;
        if (API_KEY && API_KEY == global.API_KEYS['thirdparty']) {
            if(global.apps[req.headers.app_key] !== undefined){
                next();
            }else{
                res.status(401);
                res.json({ 'message': 'Invalid app key.' })    
            }
        } else {
            res.status(401);
            res.json({ 'message': 'Invalid request to Server.' })
        }
    } else {
        next();
    }
};


