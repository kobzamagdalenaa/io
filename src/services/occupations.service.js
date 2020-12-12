import {db} from "../db";
import {uuid} from "./dbObjectsUtilities";

class OccupationsService {

  // async loadAll(hospitalId, departmentId) {
  //   return (await db.collection("beds")
  //     .where('hospitalId', '==', hospitalId)
  //     .where('departmentId', '==', departmentId)
  //     .get()).docs.map($ => $.data())
  // }
  //
  // async load(id) {
  //   return (await db.collection("beds").doc(id).get()).data();
  // }
  //
  // async exists(id) {
  //   return _.filter(this.beds, $ => $.id === id).length > 0;
  // }

  async upsert(occupation) {
    occupation.id = occupation.id || uuid();
    await db.collection("occupations").doc(occupation.id).set(occupation);
  }

  async loadAll(hospitalId, departmentId) {
    return (await db.collection("occupations")
      .where('hospitalId', '==', hospitalId)
      .where('departmentId', '==', departmentId)
      .get()).docs.map($ => $.data())
  }

  async loadForBed(hospitalId, departmentId, bedId) {
    return (await db.collection("occupations")
      .where('hospitalId', '==', hospitalId)
      .where('departmentId', '==', departmentId)
      .where('bedId', '==', bedId)
      .get()).docs.map($ => $.data())
  }

  async load(pesel) {
    return (await db.collection("occupations")
      .where('pesel', '==', pesel)
      .get()).docs.map($ => $.data())
  }

  async remove(id) {
    await db.collection("occupations").doc(id).delete();
  }

}

const occupationService = new OccupationsService();
export default occupationService;