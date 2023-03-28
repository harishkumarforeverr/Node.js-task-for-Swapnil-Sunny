let express = require('express');
let router = express.Router();

router.use("/apps/",require("./apps/routes/apps.routes"));
router.use("/user/",require("./user/routes/user.routes"));
router.use("/events/",require("./events/routes/events.routes"));
router.use("/admin-user/",require("./admin-user/routes/admin-user.routes"));
router.use("/admin-user-role/",require("./admin-user-role/routes/admin-user-role.routes"));

module.exports = router;

