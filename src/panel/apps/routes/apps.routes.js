let express = require('express');
let router = express.Router();

let appsController = new (require("../controllers/apps.controller"))();

// Define your routes GET / POST / PUT / DELETE etc.
router.get("/list", appsController.getApps);
router.get("/checkInstallation", appsController.checkInstallation);
router.get("/initial_info", appsController.init);
router.post("/createApp", appsController.createApp);
router.post("/setstatuscreateApp", appsController.setstatuscreateApp);
router.post("/updateApp",appsController.updateApp);
router.get("/", appsController.getAppDatails);
module.exports = router;