let express = require('express');
let router = express.Router();

let userController = new (require("../controllers/user.controller"))();

// Define your routes GET / POST / PUT / DELETE etc.
// router.post("/create", userController.createUser);
router.post("/edit", userController.modifyUser);
router.get("/getProfile", userController.getProfile);
router.get("/analyseUsers", userController.analyseUsers);
router.get("/list", userController.usersList);
router.get("/getAttributeMaster", userController.getAttributeMaster);
router.get("/getUserEvents", userController.getUserEvents);
router.post("/createUsersFromCsv", userController.createUsersFromCsv);

module.exports = router;