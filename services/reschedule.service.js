import {uuid} from "./dbObjectsUtilities";
import {db} from "../db";
import bedsService from "./beds.service";
import moment from "moment";
import occupationService from "./occupations.service";

class RescheduleService {

  async tryReschedule(managedOccupation) {
    const bed = await bedsService.load(`${managedOccupation.hospitalId}X${managedOccupation.departmentId}_${managedOccupation.bedId}`);
    const occupations = await occupationService.loadForBed(managedOccupation.hospitalId, managedOccupation.departmentId, managedOccupation.bedId);
    const firstToReschedule = this.getCollidingOccupations(managedOccupation, occupations)[0];
    if (firstToReschedule.from < managedOccupation.from) {
      alert("Łóżko jest aktualnie zajęte. Nie można przeplanować.");
      return;
    }
    const managedOccupationEndTime = moment(managedOccupation.to);
    const firstRescheduledOccupationStartTime = moment(firstToReschedule.from);
    const rescheduleDuration = moment.duration(managedOccupationEndTime.diff(firstRescheduledOccupationStartTime)).add(30, "minutes");
    const rescheduled = [];
    const toReschedule = this.getCollidingOccupations(managedOccupation, occupations);
    while (toReschedule.length) {
      const next = toReschedule.shift();
      next.from = this.addDuration(next.from, rescheduleDuration);
      next.to = this.addDuration(next.to, rescheduleDuration);
      if (!this.verifyNotCollidingWithRemoved(next, bed)) {
        return;
      }
      rescheduled.push(next);
      toReschedule.push(..._.filter(this.getCollidingOccupations(next, occupations), $ => !_.find(rescheduled, $) && !_.find(toReschedule, $)));
    }
    for (const $ of rescheduled) {
      await occupationService.upsert($);
    }
  }

  addDuration(from, rescheduleDuration) {
    return moment(from).add(rescheduleDuration).format('YYYY-MM-DD HH:mm:ss');
  }



  getCollidingOccupations(managedOccupation, occupations) {
    const period = {
      from: moment(managedOccupation.from),
      to: moment(managedOccupation.to)
    }
    return _.sortBy(occupations.filter($ => $.id !== managedOccupation.id && moment($.from).isSameOrBefore(period.to) && moment($.to).isSameOrAfter(period.from)), 'from');
  }

  verifyNotCollidingWithRemoved(managedOccupation, bed) {
    function activeAt(bed, period) {
      const activenessPeriods = _.chunk([bed.addedAt, ..._.flatMap(bed.removingPeriods, $ => [$.from, $.to]), bed.removedAt]
        .filter($ => $)
        .sort($ => $)
        .map($ => moment($)), 2)
        .map($ => ({from: $[0], to: $[1]}))
      return _.some(activenessPeriods, activePeriod =>
        activePeriod.from.isSameOrBefore(period.from) && (!activePeriod.to || activePeriod.to.isSameOrAfter(period.to)))
    }

    const period = {
      from: moment(managedOccupation.from),
      to: moment(managedOccupation.to)
    }
    const isActive = activeAt(bed, period);
    if (!isActive) {
      alert("Nie można przeplanować. Łóżko będzie zlikwidowane!");
    }
    return isActive;
  }
}

const rescheduleService = new RescheduleService();
export default rescheduleService;