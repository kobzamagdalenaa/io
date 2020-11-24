import React, {useEffect, useState} from 'react';
import {db} from "../db";
import * as _ from "lodash";

export default function DepartmentsView() {
  const [departments, setDepartments] = useState({});

  useEffect(() => {
    loadDepartments();
  }, [])

  async function loadDepartments() {
    const newDepartments = {};
    let hResponse = await db.collection("hospitals").get()
    const hospitals = _.map(hResponse.docs, $ => ({id: $.id, ...$.data()}));
    for (const hospital of hospitals) {
      const response = await db.collection("hospitals").doc(hospital.id).collection("department").get();
      const departments = _.map(response.docs, $ => ({...$.data()}.name));
      await updateDepartments(newDepartments, hospital, departments);
    }
    setDepartments(newDepartments);
  }

  async function updateDepartments(departments, hospital, hospitalDepartments) {
    for (const dep of hospitalDepartments) {
      if (!departments[dep]) {
        departments[dep] = []
      }
      departments[dep].push(hospital);
      const bedsIn = await loadFreeBedsIn(hospital, dep, "2020-11-14", "2020-11-15")
      console.log(hospital.name, hospitalDepartments, bedsIn);
    }
  }

  async function loadFreeBedsIn(hospital, departmentName, dateFrom, dateTo) {
    const departmentId = _.find(hospital.departments, $ => $.name === departmentName).id;

    const bedsResponse = await db.collection("hospitals").doc(hospital.id)
      .collection("department").doc(departmentId)
      .collection("beds").get();
    const beds = _.map(bedsResponse.docs, $ => $.id);

    const occupiedBeds = []
    for (let bed of beds) {
      const response = await db.collection("hospitals").doc(hospital.id)
        .collection("department").doc(departmentId)
        .collection("beds").doc(bed)
        .collection("occupation").get();
      const occupations = _.chain(response.docs)
        .map($ => $.data())
        .filter($ => ($.end.seconds + 3600) > (new Date(dateFrom).valueOf()/1000) && ($.start.seconds + 3600) < (new Date(dateTo).valueOf()/1000))
        .value();

      debugger
      if (occupations.length) {
        occupiedBeds.push(bed);
      }
    }

    return _.without(beds, ...occupiedBeds);
  }

  return (
    <div>
      <h2>Oddziały Szpitalne</h2>
      {_.keys(departments).map(key => (
        <div>{key} - {departments[key].map($ => $.name).toString()}</div>
      ))}
      {/*<div>{*/}
      {/*  patients.map((patient) => <Patient id={patient.id}/>*/}
      {/*  )*/}
      {/*}</div>*/}
    </div>
  );
}
