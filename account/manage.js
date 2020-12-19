import React, {useEffect, useState} from 'react';
import {db} from "../db";
import * as _ from "lodash";
import Patient from "./patient";

export default function PatientsList() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    db.collection("patients").get().then(patients => {
      setPatients(_.map(patients.docs, $ => ({id: $.id, ...$.data()})));
    })
  }, [])

  return (
    <div>
      <h2>Pacjenci</h2>
      <div>{
        patients.map((patient) => <Patient id={patient.id}/>
        )
      }</div>
    </div>
  );
}
