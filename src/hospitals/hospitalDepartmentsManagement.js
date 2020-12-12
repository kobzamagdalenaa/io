import React, {useEffect, useState} from 'react';
import * as _ from "lodash";
import accountService from "../services/account.service";
import Input from "../components/input.component";
import Select from "../components/select.component";
import departmentsService from "../services/departments.service";
import {Route, Switch, useHistory, useParams, useRouteMatch} from "react-router-dom";
import Section from "../components/section.component";
import Search from "../components/search.component";
import bedsService from "../services/beds.service";
import DateTimePicker from "../components/dateTimePicker.component";
import moment from "moment";

export default function HospitalDepartmentsManagement() {
  const {path, url} = useRouteMatch();

  return (
    <div className="w-100 px-3">
      <h2 className="text-center">Zarządzanie oddziałami szpitala</h2>
      <Switch>
        <Route exact path={path}>
          <DepartmentsList/>
        </Route>
        <Route path={`${path}/add`}>
          <AddDepartment/>
        </Route>
        <Route path={`${path}/:departmentId/add-bed`}>
          <AddBed/>
        </Route>
        <Route path={`${path}/:departmentId/:bedId`}>
          <ManageBed/>
        </Route>
        <Route path={`${path}/:departmentId`}>
          <EditDepartment/>
        </Route>
      </Switch>
    </div>
  )
}

function DepartmentsList() {
  const history = useHistory();
  const {path, url} = useRouteMatch();
  const [departments, setDepartments] = useState([]);
  const [currentHospitalId] = useState(accountService.hospital.id);

  useEffect(() => {
    reloadDepartments();
  }, []);

  async function reloadDepartments() {
    setDepartments(await departmentsService.loadAll());
  }

  return (
    <div style={{display: "flex", flexWrap: "wrap"}}>
      {
        departments
          .filter($ => _.includes($.hospitals, currentHospitalId))
          .map(department => <DepartmentTile department={department} onClick={() => history.push(`${url}/${department.id}`)} />)
      }
      {
        departments.filter($ => _.includes($.hospitals, currentHospitalId)).length === departments.length ? '' : (
          <DepartmentTile department={{name: "+", extra: "Dodaj nowy"}} onClick={() => history.push(`${url}/add`)} />
        )
      }
    </div>
  )
}

function AddDepartment() {
  const history = useHistory();
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState();

  async function loadAvailableDepartments() {
    const departments = await departmentsService.loadAll();
    setAvailableDepartments(departments.filter(department => !_.includes(department.hospitals, accountService.hospital.id)))
  }

  useEffect(() => {
    loadAvailableDepartments()
  }, []);

  async function addToDepartment(departmentId) {
    if (departmentId === undefined) {
      alert("Wybierz oddział do dodania");
      return;
    }
    await departmentsService.addHospitalTo(departmentId, accountService.hospital.id);
    history.goBack();
  }

  return (
    <div className="container" style={{maxWidth: "500px"}}>
      <h3 className="text-center">Dodaj nowy</h3>
      <Select value={selectedDepartmentId} onChange={v => setSelectedDepartmentId(v)} label="Oddział"
              nameMapper={$ => $.name} valueMapper={$ => $.id} options={availableDepartments} customLabelWidth="100px"/>
      <div className="text-center mt-3">
        <button className="btn btn-light" style={{marginRight: "20px"}} onClick={() => history.goBack()}>Anuluj</button>
        <button className="btn btn-primary" onClick={() => addToDepartment(selectedDepartmentId)}>Zapisz</button>
      </div>
    </div>
  );
}

function EditDepartment() {
  const { departmentId } = useParams();
  const [managedDepartment, setManagedDepartment] = useState({});

  async function loadDepartment(departmentId) {
    setManagedDepartment(await departmentsService.load(departmentId));
  }

  useEffect(() => {
    if (departmentId) {
      loadDepartment(departmentId);
    }
  }, [departmentId]);

  return (
    <div>
      <div className="container" style={{maxWidth: "500px"}}>
        <h3 className="text-center">Oddział: {managedDepartment.name}</h3>
      </div>
      <BedsManagement department={managedDepartment} />
      <RemoveDepartment department={managedDepartment}/>
    </div>
  )
}

function AddBed() {
  const history = useHistory();
  const { departmentId } = useParams();
  const [managedDepartment, setManagedDepartment] = useState({});
  const [newBed] = useState({
    number: "",
    departmentId: departmentId,
    removingPeriods: [],
    hospitalId: accountService.hospital.id,
    addedAt: moment().format("YYYY-MM-DD 00:00:00")
  });

  async function loadDepartment(departmentId) {
    setManagedDepartment(await departmentsService.load(departmentId));
  }

  useEffect(() => {
    if (departmentId) {
      loadDepartment(departmentId);
    }
  }, [departmentId]);

  function validate() {
    const errors = [
      newBed.number === "" || +newBed.number < 0 ? "Niepoprawny numer łóżka" : null,
      isNaN(newBed.number) ? "Numer łóżka musi być liczbą!" : null,
      newBed.addedAt ? null : "Data dodania jest wymagana"
    ].filter($ => !!$)
      .join("\n");
    if (errors) {
      alert(errors)
      return false;
    }
    return true;
  }

  async function save() {
    if (validate()) {
      newBed.id = `${newBed.hospitalId}X${newBed.departmentId}_${newBed.number}`;
      if (await bedsService.exists(newBed.id)) {
        alert("Łóżko o tym numerze już istnieje!");
      } else {
        await bedsService.upsert(newBed);
        history.goBack();
      }
    }
  }

  return (
    <div className="container" style={{maxWidth: "500px"}}>
      <Section>Dodawanie łóżka na oddziale: {managedDepartment.name}</Section>
      <Input label="Numer" value={newBed.number} onChange={v => newBed.number = v} type="text" customLabelWidth="100px" />
      <DateTimePicker label="Data dodania" onChange={v => newBed.addedAt = v} value={newBed.addedAt} customLabelWidth="100px" />
      <div className="text-center mt-3">
        <button className="btn btn-light" style={{marginRight: "20px"}} onClick={() => history.goBack()}>Anuluj</button>
        <button className="btn btn-primary" onClick={() => save()}>Zapisz</button>
      </div>
    </div>
  )
}

function ManageBed() {
  const history = useHistory();
  const { departmentId, bedId } = useParams();
  const [managedBed, setManagedBed] = useState({});
  const [managedDepartment, setManagedDepartment] = useState({});
  const [newDate, setNewDate] = useState();
  const [minDate, setMinDate] = useState();

  useEffect(() => {
    if (departmentId) {
      loadDepartment(departmentId);
    }
  }, [departmentId]);

  useEffect(() => {
    loadManagedBed(bedId);
  }, [bedId]);

  async function loadManagedBed(bedId) {
    const bed = await bedsService.load(bedId);
    const minDate = _.chain([bed.addedAt, bed.removedAt, ..._.flatMap(bed.removingPeriods, $ => [$.from, $.to])])
      .filter($ => $)
      .max()
      .value();
    setMinDate(minDate);
    setManagedBed(bed);
  }

  async function loadDepartment(departmentId) {
    setManagedDepartment(await departmentsService.load(departmentId));
  }

  async function save() {
    //TODO collisions with occupation
    if (!managedBed.removedAt) {
      const removed = _.remove(managedBed.removingPeriods, $ => $.to === newDate);
      managedBed.removedAt = removed.length > 0 ? removed[0].from : newDate;
      await bedsService.upsert(managedBed);
      history.goBack();
    } else {
      if (managedBed.removedAt !== newDate) {
        managedBed.removingPeriods.push({
          from: managedBed.removedAt,
          to: newDate
        });
      }
      delete managedBed.removedAt;
      await bedsService.upsert(managedBed);
      history.goBack();
    }
  }

  return (
    !managedBed.number ? null :
    <div className="container" style={{maxWidth: "500px"}}>
      <Section>Łóżko {managedBed.number} na oddziale {managedDepartment.name}</Section>
      <DateTimePicker label="Data dodania" value={managedBed.addedAt} disabled={true} customLabelWidth="155px" />

      {managedBed.removingPeriods.map(removingPeriod => (
        <Input label="Okres likwidacji" value={`${removingPeriod.from} do ${removingPeriod.to}`} disabled={true} customLabelWidth="155px"/>
      ))}

      {
        !managedBed.removedAt ? null :
          <DateTimePicker label="Data likwidacji" value={managedBed.removedAt} disabled={true} customLabelWidth="155px" />
      }

      <Section>{managedBed.removedAt ? "Przywróć" : "Zlikwiduj"}</Section>
      <DateTimePicker label={managedBed.removedAt ? "Data przywrócenia" : "Data likwidacji"} onChange={v => setNewDate(v)} value={newDate} minDate={minDate} customLabelWidth="155px" />
      <div className="text-center mt-3">
        <button className="btn btn-light" style={{marginRight: "20px"}} onClick={() => history.goBack()}>Anuluj</button>
        <button className="btn btn-primary" onClick={() => save()}>Zapisz</button>
      </div>
    </div>
  )
}

function BedsManagement() {
  const history = useHistory();
  const {path, url} = useRouteMatch();
  const { departmentId } = useParams();
  const [beds, setBeds] = useState([]);
  const [bedsFilter, setBedsFilter] = useState("");

  useEffect(() => {
    reloadBeds();
  }, []);

  async function reloadBeds() {
    setBeds(_.sortBy(await bedsService.loadAll(accountService.hospital.id, departmentId), $ => +$.number))
  }

  return (
    <div>
      <div className="container" style={{maxWidth: "500px"}}>
        <Section>Zarządzanie łóżkami</Section>
        <div className="row mb-2">
          <div className="col-9">
            <Search placeholder="Numer łóżka..." onChange={(value) => {setBedsFilter(value)}} />
          </div>
          <button className="col-2 btn btn-primary float-right" onClick={() => history.push(`${url}/add-bed`)}>Dodaj</button>
        </div>
      </div>
      <div style={{display: "flex", flexWrap: "wrap"}}>
        {
          beds.filter(bed => bed.number.indexOf(bedsFilter) >= 0).map(bed => <BedTile bed={bed} onClick={() => history.push(`${url}/${bed.id}`)} />)
        }
      </div>
    </div>
  );
}

function BedTile({bed, onClick}) {
  return (
    <div style={{margin: "10px", width: "240px", height: "50px", border: "1px solid lightgray", cursor: "pointer"}}
         onClick={onClick}>
      <h5 className="text-center" style={{margin: "12px 0 10px"}}>{bed.number}</h5>
      {/*<p className="text-center">{bed.id}</p>*/}
    </div>
  )
}

function DepartmentTile({department, onClick}) {

  return (
    <div style={{margin: "10px", width: "240px", height: "200px", border: "1px solid lightgray", cursor: "pointer"}}
         onClick={onClick}>
      <h5 className="text-center" style={{margin: "60px 0 10px"}}>{department.name}</h5>
      <p className="text-center">{department.extra}</p>
    </div>
  )
}

function RemoveDepartment({department}) {
  const history = useHistory();

  async function removeFromDepartment() {
    await departmentsService.removeHospitalFrom(department.id, accountService.hospital.id);
    history.goBack();
  }

  function confirmAndThen(removeAction) {
    if (confirm("Na pewno usunąć?")) {
      removeAction();
    }
  }

  return (
    <div className="container" style={{maxWidth: "500px"}}>
      <Section style="danger">Usuwanie oddziału {department.name} ze szpitala</Section>
      <div className="text-center mt-1">
        <button className="btn btn-danger" onClick={() => confirmAndThen(() => removeFromDepartment())}>Usuń</button>
      </div>
    </div>
  );
}