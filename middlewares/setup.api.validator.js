// const db = require("../common/db");
exports.checkAPITokens = async function (req, res, next) {
	let url = req._parsedUrl.pathname.split('/');
	if (url[2] === 'setup') {
		let API_KEY = req.headers.api_key;
		if (API_KEY === global.API_KEYS['setup']) {
			// //
			// let users = await db.getDB().collection('admin_users').find({
			// }).toArray();
			// if (users || users.length > 0) {
			// 	res.status(400);
			// 	res.json({ 'message': 'Not Allowed.' })
			// } else {
				next();
			// }
		} else {
			res.status(401);
			res.json({ 'message': 'Unautherized user.' })
		}
	} else {
		next();
	}
}