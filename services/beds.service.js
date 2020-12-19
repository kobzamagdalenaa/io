import {db} from "../db";

class BedsService {

  async loadAll(hospitalId, departmentId) {
    return (await db.collection("beds")
      .where('hospitalId', '==', hospitalId)
      .where('departmentId', '==', departmentId)
      .get()).docs.map($ => $.data())
  }

  async load(id) {
    return (await db.collection("beds").doc(id).get()).data();
  }

  async exists(id) {
    return _.filter(this.beds, $ => $.id === id).length > 0;
  }

  async update(id, bed) {
    const bedCandidate = this.load(id);
    if (bedCandidate) {
      _.assign(bedCandidate, bed);
    }
  }

  async upsert(bed) {
    await db.collection("beds").doc(bed.id).set(bed);
  }

  async remove(id, removalTimestamp) {
    const bed = this.load(id);
    bed.removedAt = removalTimestamp;
  }

}

const bedsService = new BedsService();
export default bedsService;