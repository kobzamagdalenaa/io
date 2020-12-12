import {db} from "../db";
import {extractAllWithId, extractWithId, omitId} from "./dbObjectsUtilities";

class PatientService {

    constructor() {
    }

    async load(id) {
        return extractWithId(await db.collection("patients").doc(id).get());
    }

    async loadAll() {
        return extractAllWithId(await db.collection("patients").get());
    }

    async upsert(id, patient) {
        await db.collection("patients").doc(id).set(omitId(patient));
    }
}

const patientService = new PatientService();
export default patientService;