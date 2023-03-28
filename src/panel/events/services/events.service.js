let eventsResponse = require("../responses/events.response");
let eventsModel = new (require("../models/events.model"))();
const db = require('../../../../common/db');

module.exports = class EventsService {

    constructor() {
        //
    }

    async getEvents(data) {
        let returnResult;
        let events = await eventsModel.getEvents(data);
        if (events.length > 0) {
            events.forEach((element) => {
                element.event_id = element._id;
                delete element._id;
            });
            returnResult = eventsResponse.success("events_found", events);
        } else {
            returnResult = eventsResponse.failed("event_not_found");
        }
        return returnResult;
    }

    async getAllEventsCount(data) {
        let returnResult, totalCount = {};
        /*
        if (data.start_data) {
            if (!data.end_date) {
                data.end_date = new Date();
            }
            data.monthList = this.monthDiff(data.start_date, data.end_date);
        }
        */
        let events_count = await eventsModel.getAllEventsCount(data);
        events_count.forEach(record => {
            if (!totalCount[record.event_id]) {
                totalCount[record.event_id] = 0;
            }
            if (record.days) {
                for (const day in record.days) {
                    totalCount[record.event_id] += (record.days[day] ? record.days[day] : 0);
                }
            }
        });
        returnResult = eventsResponse.success("events_found", totalCount);
        return returnResult;
    }

    async getEventAnalysis(data) {
        let returnResult, totalCount = [];
        /*
        if (data.start_data) {
            if (!data.end_date) {
                data.end_date = new Date();
            }
            data.monthList = this.monthDiff(data.start_date, data.end_date);
        }
        */
        if (data.segmentSplit || data.analysisType == 'unique') {
            let eventCursor = eventsModel.getEventAnalysisWithSplit(data);
            for await (const doc of eventCursor) {
               totalCount.push(doc);
            }
        } else {
            let mainObj = {};
            let eventCountCursor = eventsModel.getEventAnalysis(data);
            for await (const doc of eventCountCursor) {
                let alldays = doc['days'];
                const seg = (doc['type'] == 'master') ? 'master' : doc['segment'];
                if (!mainObj[seg]) {
                    mainObj[seg] = 0;
                }
                if (alldays) {
                    Object.keys(alldays).forEach(day => {
                        const values = alldays[day];
                        values.forEach(val => {
                            mainObj[seg] += (val['count'] || 0);
                        })
                    });
                }
            }
            for (const seg in mainObj) {
                totalCount.push({ _id: { over: seg } ,count: (mainObj[seg] || 0) });
            }
        }
        returnResult = eventsResponse.success("events_found", totalCount);
        return returnResult;
    }

    monthDiff(d1, d2) {
        d1 = new Date(d1);
        d2 = new Date(d2);
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        let start_year = d1.getFullYear();
        let end_year = d2.getFullYear();
        let start_month = d1.getMonth() + 1;
        let monthList = [];
        for( let i = start_year; i < end_year + 1; i++) {
          for (let j = 0; j < months + 1; j++) {
            monthList.push(i + ":" + (start_month));
            start_month += 1;
            if (start_month > 12) {
                start_month = 1;
                i += 1;
            }
          }
        }
        return monthList;
    }

}
