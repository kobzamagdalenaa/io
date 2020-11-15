import React, {useEffect, useState} from 'react';
import {db} from "../db";


export default function Patient({id}) {
  const [patient, setPatient] = useState();

  useEffect(() => {
    if (id) {
      db.collection("patients").doc(id).get().then(patient => {
        setPatient(patient.data());
      });
    }
  }, [id])

  const sex = {
    "M": "Mężczyzna",
    "F": "Kobieta"
  }

  function goToPatientCard(id) {

  }

  function renderPatient(patient) {
    return (
      <table>
        <tr>
          <th>Imię</th>
          <td>{patient.name}</td>
          <td rowSpan="4">
            <button onClick={goToPatientCard(patient.id)}>Idź do karty pacjenta</button>
          </td>
        </tr>
        <tr>
          <th>Nazwisko</th>
          <td>{patient.surname}</td>
        </tr>
        <tr>
          <th>Data urodzenia</th>
          <td>{patient.birthDate.toString()}</td>
        </tr>
        <tr>
          <th>Płeć</th>
          <td>{sex[patient.sex]}</td>
        </tr>
      </table>
    )
  }

  return patient ? renderPatient(patient) : null;
}