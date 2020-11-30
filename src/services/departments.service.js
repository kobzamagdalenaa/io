import {db} from "../db";
import {extractAllWithId, extractWithId, omitId} from "./dbObjectsUtilities";
import accountService from "./account.service";
import * as _ from "lodash";

class DepartmentsService {

  constructor() {
  }

  async loadAll() {
    const query = await db.collection("departments").get();
    return extractAllWithId(query);
  }

  async load(id) {
    const query = await db.collection("departments").doc(id).get();
    return extractWithId(query);
  }

  async loadForHospital(hospitalId) {
    const query = await db.collection("departments").where("hospitals", "array-contains", hospitalId).get();
    return extractAllWithId(query);
  }

  async upsert(id, department) {
    await db.collection("departments").doc(id).set(omitId(department));
  }

  async remove(id) {
    await db.collection("departments").doc(id).delete();
  }

  async removeHospitalFrom(departmentId, hospitalId) {
    const department = await this.load(departmentId);
    department.hospitals = _.remove(department.hospitals, hospitalId);
    await this.upsert(department.id, department);
  }

  async removeHospitalFromAll(hospitalId) {
    const departments = await this.loadForHospital(hospitalId);
    for (let department of departments) {
      await this.removeHospitalFrom(department.id, hospitalId);
    }
  }

  async addHospitalTo(departmentId, hospitalId) {
    const department = await this.load(departmentId);
    if (!_.includes(department.hospitals, hospitalId)) {
      department.hospitals.push(hospitalId);
      await this.upsert(department.id, department);
    }
  }

}

const departmentsService = new DepartmentsService();
export default departmentsService;