let express = require('express');
let router = express.Router();

router.use("/panel/",require("./panel/routes.js"));
router.use("/sdk/",require("./sdk/routes.js"));
router.use("/pushNotifi/",require("./pushNotifi/routes/pushNotifi.routes"));
// 

module.exports = router;