"use strict";

module.exports = class EventsFormatter {

    getEvents(req) {
        return {
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            app_key : req.app_key,
            showSegments: req.query.showSegments ? true : false,
        };
    }

    getAllEventsCount(req) {
        return {
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            app_key : req.app_key,
            event_id: req.query.event_id || '',
            event_type: req.query.event_type || '',
            // uniques ?
        };
    }

    getEventAnalysis(req) {
        return {
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            event_id: req.query.event_id,
            app_key : req.app_key,
            segmentOver: req.query.segmentOver,
            analysisType: req.query.analysisType,
            segmentSplit: req.query.segmentSplit,
        };
    }

}
