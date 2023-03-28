let express = require('express');
let router = express.Router();

let pushNotifiController = new (require("../controllers/pushNotifi.controller"))();

router.post("/create", pushNotifiController.createPushNotifi);

module.exports = router;