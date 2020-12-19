import React, {useEffect, useState} from 'react';
import * as _ from "lodash";
import Input from "../components/input.component";
import hospitalsService from "../services/hospitals.service";
import {Route, Switch, useHistory, useParams, useRouteMatch} from "react-router-dom";

export default function HospitalsManagement() {
  const {path, url} = useRouteMatch();

  return (
    <div className="w-100 px-3">
      <h2 className="text-center">Zarządzanie szpitalami</h2>
      <Switch>
        <Route exact path={path}>
          <HospitalsList/>
        </Route>
        <Route path={`${path}/add`}>
          <AddOrEditHospital/>
        </Route>
        <Route path={`${path}/:hospitalId`}>
          <AddOrEditHospital/>
        </Route>
      </Switch>
    </div>
  )
}

function HospitalsList() {
  const history = useHistory();
  const {path, url} = useRouteMatch();
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    reloadHospitals();
  }, []);

  async function reloadHospitals() {
    setHospitals(await hospitalsService.loadAll());
  }

  return (
    <div style={{display: "flex", flexWrap: "wrap"}}>
      {
        hospitals.map(hospital => <HospitalTile hospital={hospital} onClick={() => history.push(`${url}/${hospital.id}`)} />)
      }
      <HospitalTile hospital={{name: "+", address: "Dodaj nowy"}} onClick={() => history.push(`${url}/add`)} />
    </div>
  )
}

function AddOrEditHospital() {
  const history = useHistory();
  const { hospitalId } = useParams();
  const [managedHospital, setManagedHospital] = useState({});

  async function loadHospital(hospitalId) {
    setManagedHospital(await hospitalsService.load(hospitalId));
  }

  useEffect(() => {
    if (hospitalId) {
      loadHospital(hospitalId);
    }
  }, [hospitalId]);

  function verify(hospital) {
    const errors = [
      hospital.name ? null : "Nazwa szpitala jest wymagana!",
      hospital.address ? null : "Adres szpitala jest wymagany!"
    ].filter($ => !!$)
      .join("\n");
    if (errors) {
      alert(errors);
      return false;
    }
    return true;
  }

  async function saveManagedHospital() {
    if (!verify(managedHospital)) {
      return;
    }
    await hospitalsService.upsert(managedHospital);
    history.goBack();
  }

  async function removeHospital(hospital) {
    if (confirm(`Czy na pewno chcesz usunąć ${hospital.name}?`)) {
      await hospitalsService.remove(hospital.id);
      history.goBack();
    }
  }

  return (
    <div className="container" style={{maxWidth: "500px"}}>
      <HospitalManagement hospital={managedHospital} />
      <div className="text-center mt-3">
        <button className="btn btn-light" style={{marginRight: "20px"}} onClick={() => history.goBack()}>Anuluj</button>
        {managedHospital.id ? <button className="btn btn-danger" style={{marginRight: "20px"}} onClick={() => removeHospital(managedHospital)}>Usuń</button> : ''}
        <button className="btn btn-primary" onClick={() => saveManagedHospital()}>Zapisz</button>
      </div>
    </div>
  )
}

function HospitalTile({hospital, onClick}) {

  return (
    <div style={{margin: "10px", width: "240px", height: "200px", border: "1px solid lightgray", cursor: "pointer"}}
         onClick={onClick}>
      <h5 className="text-center" style={{margin: "60px 0 10px"}}>{hospital.name}</h5>
      <p className="text-center">{hospital.address}</p>
    </div>
  )
}

function HospitalManagement({hospital}) {
  return (
    <div>
      <Input label="Nazwa" value={hospital.name} onChange={v => hospital.name = v} type="text" />
      <Input label="Adres" value={hospital.address} onChange={v => hospital.address = v} type="text" />
    </div>
  );
}
