let express = require('express');
let router = express.Router();

let userroleController = new (require("../controller/admin-user-role.controller"))();

// Define your routes GET / POST / PUT / DELETE etc.
router.post("/", userroleController.createRole);
router.get("/list", userroleController.getAdminuser);
router.get("/getRoleById", userroleController.getRoleById);
router.post("/editRole", userroleController.editRole);
router.get("/getAllModules", userroleController.getmastermodule);
router.get("/getBaseRoutes", userroleController.getBaseRoutes);
router.get("/getMasterRoutes", userroleController.getMasterRoutes);
router.post("/editBaseRoutes", userroleController.editBaseRoutes);
router.post("/setPrivilege", userroleController.setPrivilege);

module.exports = router;