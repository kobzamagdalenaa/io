import {db} from "../db";
import * as _ from "lodash";

class DepartmentsService {

  constructor() {
  }

  async loadAll() {
    return (await db.collection("departments").get()).docs.map($ => $.data());
  }

  async load(id) {
    return (await db.collection("departments").doc(id).get()).data();
  }

  async loadForHospital(hospitalId) {
    return (await db.collection("departments").where("hospitals", "array-contains", hospitalId).get()).docs.map($ => $.data());
  }

  async upsert(department) {
    department.id = department.id || await nextId();
    await db.collection("departments").doc(department.id).set(department);
  }

  async nextId() {
    const departments = await this.loadAll();
    return departments.length === 0 ? "1" : "" + (_.chain(departments)
      .map(departments => departments.id)
      .map(id => +id)
      .max() + 1);
  }

  async remove(id) {
    await db.collection("departments").doc(id).delete();
  }

  async removeHospitalFrom(departmentId, hospitalId) {
    const department = await this.load(departmentId);
    department.hospitals = _.remove(department.hospitals, hospitalId);
    await this.upsert(department);
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
      await this.upsert(department);
    }
  }

}

const departmentsService = new DepartmentsService();
export default departmentsService;