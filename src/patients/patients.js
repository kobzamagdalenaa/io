import React, {useEffect, useState} from 'react';
import {useHistory} from "react-router-dom";
import patientService from "../services/patients.service";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  useRouteMatch
} from "react-router-dom";
import AddOrEditPatient from "./addOrEditPatient";
import Search from "../components/search.component";
import Input from "../components/input.component";
import Radio from "../components/radio.component";

export default function Patients() {
  const { path, url } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path}>
        <PatientsList />
      </Route>
      <Route path={`${url}/:pesel/edit`}>
        <AddOrEditPatient />
      </Route>
      <Route path={`${url}/:pesel`}>
        <ViewPatient />
      </Route>
      <Route path={`${url}/add`}>
        <AddOrEditPatient />
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
      <div className="text-center" style={{marginTop: "50px"}}>
        {/*<button className="btn btn-light" style={{marginRight: "20px"}} onClick={() => history.goBack()}>Anuluj</button>*/}
        {/*{managedDepartment.id ? <button className="btn btn-danger" style={{marginRight: "20px"}} onClick={() => removeDepartment(managedDepartment)}>Usuń</button> : ''}*/}
        <button className="btn btn-primary" onClick={() => history.push(`${url}/edit`)}>Edytuj</button>
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
