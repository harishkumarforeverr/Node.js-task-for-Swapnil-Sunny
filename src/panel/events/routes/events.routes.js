let express = require('express');
let router = express.Router();

let eventsController = new (require("../controllers/events.controller"))();

// Define your routes GET / POST / PUT / DELETE etc.
router.get("/getEvents", eventsController.getEvents);
router.get("/getAllEventsCount", eventsController.getAllEventsCount);
router.get("/getEventAnalysis", eventsController.getEventAnalysis);

module.exports = router;