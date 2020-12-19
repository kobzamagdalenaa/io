import {db} from "../db";

class PatientService {

    constructor() {
    }

    async load(id) {
        return (await db.collection("patients").doc(id).get()).data();
    }

    async loadAll() {
        return (await db.collection("patients").get()).docs.map($ => $.data());
    }

    async upsert(patient) {
        patient.id = patient.pesel;
        await db.collection("patients").doc(patient.id).set(patient);
    }
}

const patientService = new PatientService();
export default patientService;