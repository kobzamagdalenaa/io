import React, {useEffect, useState} from 'react';
import {Route, Switch, useHistory, useParams, useRouteMatch} from "react-router-dom";
import patientService from "../services/patients.service";
import AddOrEditPatient from "./addOrEditPatient";
import Search from "../components/search.component";
import Section from "../components/section.component";
import moment from "moment";
import departmentsService from "../services/departments.service";
import hospitalsService from "../services/hospitals.service";
import Select from "../components/select.component";
import bedsService from "../services/beds.service";
import DateTimeRangePicker from "../components/dateTimeRangePicker.component";
import occupationService from "../services/occupations.service";
import Textarea from "../components/textarea.component";

export default function Patients() {
  const { path, url } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path}>
        <PatientsList />
      </Route>
      <Route path={`${path}/add`}>
        <AddOrEditPatient />
      </Route>
      <Route path={`${path}/:pesel/edit`}>
        <AddOrEditPatient />
      </Route>
      <Route path={`${path}/:pesel`}>
        <ViewPatient />
      </Route>
    </Switch>
  )
}

function ViewPatient() {
  const history = useHistory();
  const [patient, setPatient] = useState({});
  const { pesel } = useParams();
  const { path, url } = useRouteMatch();

  async function loadPatient(pesel) {
    setPatient(await patientService.load(pesel));
  }

  useEffect(() => {
    if (pesel) {
      loadPatient(pesel);
    }
  }, [pesel]);

  return (
    <div>
      <h2 className="text-center">{patient.name} {patient.surname}</h2>
      <div className="container" style={{maxWidth: "500px"}}>
        <table>
          <tr>
            <th>PESEL</th>
            <td>{patient.pesel}</td>
          </tr>
          <tr>
            <th>Płeć</th>
            <td>{patient.gender}</td>
          </tr>
          <tr>
            <th>Adres email</th>
            <td>{patient.email}</td>
          </tr>
        </table>
      </div>
      <div className="text-center mt-3">
        {/*<button className="btn btn-light" style={{marginRight: "20px"}} onClick={() => history.goBack()}>Anuluj</button>*/}
        {/*{managedDepartment.id ? <button className="btn btn-danger" style={{marginRight: "20px"}} onClick={() => removeDepartment(managedDepartment)}>Usuń</button> : ''}*/}
        <button className="btn btn-primary" onClick={() => history.push(`${url}/edit`)}>Edytuj</button>
      </div>
      <PatientOccupations />
    </div>
  )
}

function PatientOccupations() {
  const history = useHistory();
  const { path, url } = useRouteMatch();
  const { pesel, departmentId, hospitalId, bedId, dateRange } = useParams();
  const [managedOccupation, setManagedOccupation] = useState();
  const [departments, setDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [beds, setBeds] = useState([]);
  const [occupations, setOccupations] = useState([]);

  useEffect(() => {
    loadDictionaries()
    loadOccupations()
  }, []);

  useEffect(() => {
    loadBeds();
  }, [managedOccupation]);

  useEffect(() => {
    if (pesel !== undefined && departmentId !== undefined && hospitalId !== undefined && bedId !== undefined && dateRange !== undefined) {
      setManagedOccupation({
        pesel, departmentId, hospitalId, bedId,
        from: moment(dateRange.split("_")[0], "YYYYMMDDHHmmss").format("YYYY-MM-DD HH:mm:ss"),
        to: moment(dateRange.split("_")[1], "YYYYMMDDHHmmss").format("YYYY-MM-DD HH:mm:ss")
      })
    }
  }, [pesel, departmentId, hospitalId, bedId, dateRange]);

  async function loadDictionaries() {
    const [departments, hospitals] = await Promise.all([
      departmentsService.loadAll(),
      hospitalsService.loadAll()
    ]);
    setHospitals(hospitals);
    setDepartments(departments);
  }

  async function loadOccupations() {
    setOccupations((await occupationService.load(pesel)).sort($ => $.from).reverse())
  }

  async function loadBeds() {
    if (managedOccupation && managedOccupation.hospitalId !== undefined && managedOccupation.departmentId !== undefined
        && managedOccupation.from !== undefined && managedOccupation.to !== undefined) {
      const period = {
        from: moment(managedOccupation.from),
        to: moment(managedOccupation.to)
      }
      const beds = await bedsService.loadAll(managedOccupation.hospitalId, managedOccupation.departmentId);
      const filter = beds.filter(bed => dateRange ? activeAt(bed, period) : true);
      setBeds(filter);
    }
  }

  async function saveManagedOccupation() {
    if ((await verifyNotCollidingWithRemoved()) && (await verifyNotCollidingWithOccupations())) {
      await occupationService.upsert(managedOccupation);
      setManagedOccupation(undefined);
      await loadOccupations();
    }
  }

  async function verifyNotCollidingWithOccupations() {
    const occupations = await occupationService.loadForBed(managedOccupation.hospitalId, managedOccupation.departmentId, managedOccupation.bedId);
    const period = {
      from: moment(managedOccupation.from),
      to: moment(managedOccupation.to)
    }
    const colliding = occupations.filter($ => $.id !== managedOccupation.id && moment($.from).isSameOrBefore(period.to) && moment($.to).isSameOrAfter(period.from));
    console.log(colliding)
    if (colliding.length) {
      alert("W wybranym terminie łóżko jest zajęte!");
    }
    return !colliding.length;
  }

  async function verifyNotCollidingWithRemoved() {
    const bed = (await bedsService.load(`${managedOccupation.hospitalId}X${managedOccupation.departmentId}_${managedOccupation.bedId}`));
    const period = {
      from: moment(managedOccupation.from),
      to: moment(managedOccupation.to)
    }
    const isActive = activeAt(bed, period);
    if (!isActive) {
      alert("W wybranym terminie łóżko nie jest dostępne!");
    }
    return isActive;
  }

  function activeAt(bed, period) {
    const activenessPeriods = _.chunk([bed.addedAt, ..._.flatMap(bed.removingPeriods, $ => [$.from, $.to]), bed.removedAt]
      .filter($ => $)
      .sort($ => $)
      .map($ => moment($)), 2)
      .map($ => ({from: $[0], to: $[1]}))
    return _.some(activenessPeriods, activePeriod =>
      activePeriod.from.isSameOrBefore(period.from) && (!activePeriod.to || activePeriod.to.isSameOrAfter(period.to)))
  }

  function confirmAndThen(removeAction) {
    if (confirm("Na pewno usunąć?")) {
      removeAction();
    }
  }

  async function removeOccupation(id) {
    await occupationService.remove(id);
    await loadOccupations();
  }

  return (
    <div className="mt-5">
      {
        !managedOccupation ? null :
          <div className="container" style={{maxWidth: "500px"}}>
            <Section>Hospitalizacja</Section>
            <DateTimeRangePicker label="Termin" start={managedOccupation.from} end={managedOccupation.to} disabled={dateRange}
                                 onChange={(start, end) => setManagedOccupation({...managedOccupation, from: start, to: end})} />
            <Select label="Szpital" options={hospitals} value={managedOccupation.hospitalId}
                    onChange={$ => setManagedOccupation({...managedOccupation, hospitalId: $, departmentId: null, bedId: null})}
                    nameMapper={$ => $.name} valueMapper={$ => $.id} disabled={hospitalId}/>
            <Select label="Oddział" options={departments.filter($ => _.includes($.hospitals, managedOccupation.hospitalId))}
                    value={managedOccupation.departmentId} onChange={$ => setManagedOccupation({...managedOccupation, departmentId: $, bedId: null})}
                    nameMapper={$ => $.name} valueMapper={$ => $.id} disabled={departmentId}/>
            <Select label="Łóżko" options={beds} value={managedOccupation.bedId}
                    onChange={$ => managedOccupation.bedId = $}
                    nameMapper={$ => $.number} valueMapper={$ => $.number} disabled={bedId || !managedOccupation.from || !managedOccupation.hospitalId || !managedOccupation.departmentId}/>
            <Textarea label="Opis" onChange={$ => managedOccupation.description = $} value={managedOccupation.description} />
            <div className="text-center mt-3">
              <button className="btn btn-primary" onClick={() => {saveManagedOccupation()}}
                      disabled={!managedOccupation.bedId || !managedOccupation.pesel || !managedOccupation.from || !managedOccupation.hospitalId || !managedOccupation.departmentId}>
                Zapisz
              </button>
            </div>
          </div>
      }
      <div className="container" style={{maxWidth: "500px"}}>
        <Section>Historia</Section>
        {
          occupations.map(occupation => (
            <table className="table mb-3" style={{border: "1px solid darkgray"}}>
              <tr>
                <th>Okres</th>
                <td>{occupation.from} - {occupation.to}</td>
              </tr>
              <tr>
                <th>Szpital</th>
                <td>{hospitals.filter($ => $.id === occupation.hospitalId)[0].name}</td>
              </tr>
              <tr>
                <th>Oddział</th>
                <td>{departments.filter($ => $.id === occupation.departmentId)[0].name}</td>
              </tr>
              <tr>
                <th>Łóżko</th>
                <td>{occupation.bedId}</td>
              </tr>
              <tr>
                <th>Opis</th>
                <td><pre>{occupation.description}</pre></td>
              </tr>
              <tr style={bedId ? {display: "none"} : {}}>
                <th>Akcje</th>
                <td>
                  <button className="btn btn-danger mr-3" onClick={() => confirmAndThen(() => removeOccupation(occupation.id))}>Usuń</button>
                  <button className="btn btn-primary mr-3" onClick={() => {setManagedOccupation(occupation)}}>Edytuj</button>
                </td>
              </tr>
            </table>
          ))
        }
      </div>
    </div>
  )
}

function PatientsList() {
  const history = useHistory();
  const [allPatients, setAllPatients] = useState([]);
  const [patients, setPatients] = useState([]);
  const { path, url } = useRouteMatch();

  async function loadPatients() {
    let patients = await patientService.loadAll();
    setPatients(patients);
    setAllPatients(patients);
  }

  async function searchPatients(value) {
    if (value.length >= 3) {
      setPatients(_.filter(allPatients, $ => $.pesel.indexOf(value) >= 0))
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  return (
    <div>
      <h2 className="text-center">Pacjenci</h2>
      <div className="container" style={{maxWidth: "750px"}}>
        <div className="row mb-2">
          <div className="col-9">
            <Search placeholder="Szukaj..." onChange={(value) => {searchPatients(value)}} />
          </div>
          <button className="col-2 btn btn-primary float-right" onClick={() => history.push(`${url}/add`)}>Dodaj</button>
        </div>
        <div>
          {
            patients.map(patient => (
              <div>
                {`${patient.name} ${patient.surname}, ${patient.gender}, PESEL: ${patient.pesel}, Email: ${patient.email}`}
                <button onClick={() => history.push(`${url}/${patient.pesel}`)} className="btn btn-primary">Wybierz</button>
              </div>))
          }
        </div>
      </div>
    </div>
  )
}
