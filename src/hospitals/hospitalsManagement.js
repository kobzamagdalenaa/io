import React, {useEffect, useState} from 'react';
import * as _ from "lodash";
import Input from "../components/input.component";
import hospitalsService from "../services/hospitals.service";

export default function HospitalsManagement() {
  const [managedHospital, setManagedHospital] = useState();
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    reloadHospitals();
  }, []);

  async function reloadHospitals() {
    setHospitals(await hospitalsService.loadAll());
  }

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
    await hospitalsService.upsert(managedHospital.id || nextId(), managedHospital);

    setManagedHospital(undefined);
    await reloadHospitals();
  }

  function nextId() {
    return hospitals.length === 0 ? "PL1" : "PL" + (_.chain(hospitals)
      .map(hospital => hospital.id)
      .map(id => +id.substr(2))
      .max() + 1);
  }

  async function removeHospital(hospital) {
    if (confirm(`Czy na pewno chcesz usunąć ${hospital.name}?`)) {
      await hospitalsService.remove(hospital.id);
      setManagedHospital(undefined);
      await reloadHospitals();
    }
  }

  return (
    <div className="w-100">
      <h2 className="text-center">Zarządzanie szpitalami</h2>
      {
        managedHospital ? (
          <div className="container" style={{maxWidth: "500px"}}>
            <HospitalManagement hospital={managedHospital} />
            <div className="text-center" style={{marginTop: "50px"}}>
              <button className="btn btn-light" style={{marginRight: "20px"}} onClick={() => setManagedHospital(undefined)}>Anuluj</button>
              {managedHospital.id ? <button className="btn btn-danger" style={{marginRight: "20px"}} onClick={() => removeHospital(managedHospital)}>Usuń</button> : ''}
              <button className="btn btn-primary" onClick={() => saveManagedHospital()}>Zapisz</button>
            </div>
          </div>
        ) : (
          <div style={{display: "flex", flexWrap: "wrap"}}>
            {
              hospitals.map(hospital => <HospitalTile hospital={hospital} onClick={() => setManagedHospital(_.assign({}, hospital))} />)
            }
            <HospitalTile hospital={{name: "+", address: "Dodaj nowy"}} onClick={() => setManagedHospital({name: "", departments: [], address: ""})} />
          </div>
        )
      }
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
