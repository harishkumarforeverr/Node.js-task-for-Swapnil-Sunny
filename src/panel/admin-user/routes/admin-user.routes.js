let express = require('express');
let router = express.Router();

let userController = new (require("../controllers/admin-user.controller"))();

// Define your routes GET / POST / PUT / DELETE etc.
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/loginWithOTP", userController.loginWithOTP);
router.post("/add", userController.addUser);
router.post("/edit", userController.editUser);
router.get("/list", userController.getUser);
router.get("/", userController.getUserByID);
router.get('/profile', userController.profile);
router.get("/getActiveroles", userController.getActiveroles);
router.post("/checkDuplicate", userController.checkDuplicate);
router.post("/editPassword", userController.editPassword);
router.post("/editProfilePassword", userController.editProfilePassword);
router.post("/verify_otp", userController.verifyOTP);
router.post("/generate_otp", userController.generateOTP);
router.post("/setstatuscreateApp", userController.setstatuscreateApp);


module.exports = router;