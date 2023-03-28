// using validator library is  Validatorjs
module.exports = class EventsValidator {

    getEvents() {
        return {};
    }

    getAllEventsCount() {
        return {};
    }

    getEventAnalysis() {
        return {
            event_id: "required",
            analysisType: "required",
        };
    }

}
