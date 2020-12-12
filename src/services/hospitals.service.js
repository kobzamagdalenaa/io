import {db} from "../db";
import {extractAllWithId, extractWithId, omitId} from "./dbObjectsUtilities";
import departmentsService from "./departments.service";

class HospitalsService {

  constructor() {
  }

  async load(id) {
    const query = await db.collection("hospitals").doc(id).get();
    return extractWithId(query);
  }

  async loadAll() {
    const query = await db.collection("hospitals").get();
    return extractAllWithId(query);
  }

  async upsert(id, hospital) {
    await db.collection("hospitals").doc(id).set(omitId(hospital));
  }

  async remove(id) {
    await db.collection("hospitals").doc(id).delete();
    await departmentsService.removeHospitalFromAll(id);
  }

}

const hospitalsService = new HospitalsService();
export default hospitalsService;