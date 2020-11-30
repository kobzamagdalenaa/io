import {db} from "../db";
import {extractAllWithId, omitId} from "./dbObjectsUtilities";

class BedsService {

  constructor() {
    this.beds = [
      {
        id: "PL1#4_325",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_324",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_323",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_322",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_1",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_2",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_3",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_4",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_5",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_6",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_7",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_8",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_9",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_10",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_11",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_12",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_13",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_14",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_15",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_16",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_17",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_18",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_19",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      },
      {
        id: "PL1#4_20",
        hospital: "PL1",
        department: "4",
        addedAt: "2020-06-01 00:00",
        removedAt: "2020-10-10 12:00",
        removingPeriods: [
          {
            from: "2020-08-01 00:00",
            to: "2020-08-10 00:00"
          },
          {
            from: "2020-09-01 00:00",
            to: "2020-09-10 00:00"
          }
        ]
      }
    ]
  }

  async loadAll() {
    return this.beds;
  }

  async load(id) {
    return _.find(this.beds, $ => $.id === id)[0];
  }

  async update(id, bed) {
    const bedCandidate = this.load(id);
    if (bedCandidate) {
      _.assign(bedCandidate, bed);
    }
  }

  async add(id, creatingTimestamp) {
    const bed = this.load(id);
    if (bed) {
      if (bed.removedAt) {
        bed.removingPeriods.push({
          from: bed.removedAt,
          to: creatingTimestamp
        });
        delete bed.removedAt;
      }
    } else {
      bed.addedAt = creatingTimestamp;
    }
  }

  async remove(id, removalTimestamp) {
    const bed = this.load(id);
    bed.removedAt = removalTimestamp;
  }

}

const bedsService = new BedsService();
export default bedsService;