var mongoConnectionTryinng = 0;
// Set DB in promise

const db = require('../common/db');
var fs = require('fs');
const mime = require('mime');
module.exports = function (app, middlewareFor = null) {
	// Check Mongodb connection is connected or not 
	app.use(async (req, res, next) => {
		let client = db.getClient();
		let _next = 0;
		// Check if mongodb connection is found and not closed or connected 
		if (!!client && !!client.topology && client.topology.isConnected()) {
			// Mongodb connection is connected
			// let user = await db.getDB().collection("user").find().toArray();
			if (_next == 0) {
				_next = 1;
				next();
			}
		} else {
			// Mongodb connection is closed or not found '
			if (mongoConnectionTryinng == 0) {
				//Connecting mongodb
				var connect = await db.connectDB();
				if (connect) {
					next();
				}
			}
		}
	});

	if (middlewareFor == 'panel' || middlewareFor == 'All') {
		app.use(require('./panel.api.validator').checkAPITokens);
		app.use(require('./download.validator').checkAPITokens);
	}
	if ([undefined, null, ''].indexOf(middlewareFor) > -1 || middlewareFor == 'All') {
		app.use(require('./sdk.api.validator').checkAPITokens);
		app.use(require('./3rdparty.api.validator').checkAPITokens);
		app.use(require('./setup.api.validator').checkAPITokens);
	}

	app.use('/uploads/*', async (req, res, next) => {
		if (process.env.S3_URL && process.env.S3_URL !== '') {
			var request = require('request');
			let url = process.env.S3_URL + encodeURI(req.params[0]);
			console.info('piped url', url);
			request(url).pipe(res);
		} else {
			try {
				let filePath = "./uploads/" + req.params[0];//+'/'+req.params.folderpath;
				if (fs.existsSync(filePath)) {
					let contentType = mime.getType(filePath);
					fs.readFile(filePath, function (error, content) {
						if (error) {
							if (error.code == 'ENOENT') {
								req.status = 404;
								next();
							} else {
								req.status = 500;
								console.log(error);
								next();
							}
						} else {
							res.writeHead(200, { 'Content-Type': contentType });
							res.end(content, 'utf-8');
						}
					});
				} else {
					req.status = 404;
					next();
				}
			} catch (err) {
				req.status = 500;
				console.log(err);
				next();
			}

		}
	})

	app.use(async (req, res, next) => {
		req.body = removeExtraSpaces(req.body);
		req.query = removeExtraSpaces(req.query);
		next();
	});
}

function removeExtraSpaces(arr) {
	let bodyKeys = Object.keys(arr);
	for (let i = 0; i < bodyKeys.length; i++) {
		if (Array.isArray(arr[bodyKeys[i]])) {
			arr[bodyKeys[i]] = removeExtraSpaces(arr[bodyKeys[i]]);
		} else if ((typeof arr[bodyKeys[i]] == 'string')) {
			arr[bodyKeys[i]] = arr[bodyKeys[i]].trim();
		}
	}
	return arr;
}