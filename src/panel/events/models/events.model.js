'use strict';
const db = require('../../../../common/db');

module.exports = class EventsModel {
    // Define Methods for communicate with database
    getEvents(data) {
        return db.getDB().collection(global.apps[data.app_key].app_name + '_events').find().toArray();
    }

    getAllEventsCount(data) {
        let find = {};
        if (data.monthList) {
            find['month'] = { $in: data.monthList };
        }
        if (data.event_type) {
            find['event_type'] = data.event_type;
        } else if (data.event_id) {
            find['event_id'] = data.event_id;
        }
        console.info(find);
        return db.getDB().collection(global.apps[data.app_key].app_name + '_Meta_events').find(find).toArray();
    }

    getEventAnalysis(data) {
        let collection = `${global.apps[data.app_key].app_name}_${data.event_id.toString()}_record`;
        let find = {};
        if (data.monthList && data.monthList.length) {
            find['month'] = { $in: data.monthList };
        }
        if (data.segmentOver) {
            find['segment'] = data.segmentOver;
        } else {
            find['segment'] = { $exists: true };
        }
        return db.getDB().collection(collection).find(find);
    }

    getEventAnalysisWithSplit(data) {
        let collection = `${global.apps[data.app_key].app_name}_${data.event_id.toString()}_drill_events`;
        let aggregate = [];
        aggregate.push({ $match: {[`segmentation.${data.segmentOver}`]: { $exists: true } } });
        if (data.segmentSplit) {
            aggregate.push({ $group: { _id: { 'over': `$segmentation.${data.segmentOver}`, 'split': `$segmentation.${data.segmentSplit}` }, count: { $sum: 1 } } });
        } else {
            aggregate.push({ $group: { _id: { 'over': `$segmentation.${data.segmentOver}` }, count: { $sum: 1 } } });
        }
        return db.getDB().collection(collection).aggregate(aggregate, { allowDiskUse: true });
    }

}