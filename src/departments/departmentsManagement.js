import React, {useEffect, useState} from 'react';
import * as _ from "lodash";
import Input from "../components/input.component";
import departmentsService from "../services/departments.service";
import {Route, Switch, useHistory, useParams, useRouteMatch} from "react-router-dom";
import occupationService from "../services/occupations.service";
import moment from "moment";
import bedsService from "../services/beds.service";

export default function DepartmentsManagement() {
  const {path, url} = useRouteMatch();

  return (
    <div className="w-100 px-3">
      <h2 className="text-center">Zarządzanie oddziałami</h2>
      <Switch>
        <Route exact path={path}>
          <DepartmentsList/>
        </Route>
        <Route path={`${path}/add`}>
          <AddOrEditDepartment/>
        </Route>
        <Route path={`${path}/:departmentId`}>
          <AddOrEditDepartment/>
        </Route>
      </Switch>
    </div>
  )
}

function DepartmentsList() {
  const history = useHistory();
  const {path, url} = useRouteMatch();
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    reloadDepartments();
  }, []);

  async function reloadDepartments() {
    setDepartments(await departmentsService.loadAll());
  }

  return (
    <div style={{display: "flex", flexWrap: "wrap"}}>
      {
        departments.map(department => <DepartmentTile department={department}
                                                      onClick={() => history.push(`${url}/${department.id}`)}/>)
      }
      <DepartmentTile department={{name: "+", extra: "Dodaj nowy"}} onClick={() => history.push(`${url}/add`)}/>
    </div>
  )
}

function AddOrEditDepartment() {
  const history = useHistory();
  const { departmentId } = useParams();
  const [managedDepartment, setManagedDepartment] = useState({hospitals: []});

  async function loadDepartment(departmentId) {
    setManagedDepartment(await departmentsService.load(departmentId));
  }

  useEffect(() => {
    if (departmentId) {
      loadDepartment(departmentId);
    }
  }, [departmentId]);

  function verify(department) {
    const errors = [
      department.name ? null : "Nazwa oddziału jest wymagana!"
    ].filter($ => !!$)
      .join("\n");
    if (errors) {
      alert(errors);
      return false;
    }
    return true;
  }

  async function saveManagedDepartment() {
    if (!verify(managedDepartment)) {
      return;
    }
    await departmentsService.upsert(managedDepartment);
    history.goBack();
  }

  async function removeDepartment(department) {
    if (confirm(`Czy na pewno chcesz usunąć ${department.name}?`)) {
      await departmentsService.remove(department.id);
      history.goBack();
    }
  }

  return (
    <div className="container" style={{maxWidth: "500px"}}>
      <DepartmentManagement department={managedDepartment} />
      <div className="text-center mt-3">
        <button className="btn btn-light" style={{marginRight: "20px"}} onClick={() => history.goBack()}>Anuluj</button>
        {managedDepartment.id ? <button className="btn btn-danger" style={{marginRight: "20px"}} onClick={() => removeDepartment(managedDepartment)}>Usuń</button> : ''}
        <button className="btn btn-primary" onClick={() => saveManagedDepartment()}>Zapisz</button>
      </div>
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

function DepartmentManagement({department}) {
  return (
    <div>
      <Input label="Nazwa" value={department.name} onChange={v => department.name = v} type="text" />
    </div>
  );
}