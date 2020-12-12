import {db} from "../db";
import departmentsService from "./departments.service";
import * as _ from "lodash";

class HospitalsService {

  constructor() {
  }

  async load(id) {
    return (await db.collection("hospitals").doc(id).get()).data();
  }

  async loadAll() {
    return (await db.collection("hospitals").get()).docs.map($ => $.data());
  }

  async upsert(hospital) {
    hospital.id = hospital.id || await this.nextId();
    await db.collection("hospitals").doc(hospital.id).set(hospital);
  }

  async nextId() {
    const hospitals = await this.loadAll();
    return hospitals.length === 0 ? "PL1" : "PL" + (_.chain(hospitals)
      .map(hospital => hospital.id)
      .map(id => +id.substr(2))
      .max() + 1);
  }


  async remove(id) {
    await db.collection("hospitals").doc(id).delete();
    await departmentsService.removeHospitalFromAll(id);
  }

}

const hospitalsService = new HospitalsService();
export default hospitalsService;