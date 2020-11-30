import React, {useEffect, useState} from 'react';
import * as _ from "lodash";
import Input from "../components/input.component";
import departmentsService from "../services/departments.service";

export default function DepartmentsManagement() {
  const [managedDepartment, setManagedDepartment] = useState();
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    reloadDepartments();
  }, []);

  async function reloadDepartments() {
    setDepartments(await departmentsService.loadAll());
  }

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
    await departmentsService.upsert(managedDepartment.id || nextId(), managedDepartment);
    setManagedDepartment(undefined);
    await reloadDepartments();
  }

  function nextId() {
    return departments.length === 0 ? "1" : "" + (_.chain(departments)
      .map(departments => departments.id)
      .map(id => +id)
      .max() + 1);
  }

  async function removeDepartment(department) {
    if (confirm(`Czy na pewno chcesz usunąć ${department.name}?`)) {
      await departmentsService.remove(department.id);
      setManagedDepartment(undefined);
      await reloadDepartments();
    }
  }

  return (
    <div className="w-100">
      <h2 className="text-center">Zarządzanie oddziałami</h2>
      {
        managedDepartment ? (
          <div className="container" style={{maxWidth: "500px"}}>
            <DepartmentManagement department={managedDepartment} />
            <div className="text-center" style={{marginTop: "50px"}}>
              <button className="btn btn-light" style={{marginRight: "20px"}} onClick={() => setManagedDepartment(undefined)}>Anuluj</button>
              {managedDepartment.id ? <button className="btn btn-danger" style={{marginRight: "20px"}} onClick={() => removeDepartment(managedDepartment)}>Usuń</button> : ''}
              <button className="btn btn-primary" onClick={() => saveManagedDepartment()}>Zapisz</button>
            </div>
          </div>
        ) : (
          <div style={{display: "flex", flexWrap: "wrap"}}>
            {
              departments.map(department => <DepartmentTile department={department} onClick={() => setManagedDepartment(_.assign({}, department))} />)
            }
            <DepartmentTile department={{name: "+", extra: "Dodaj nowy"}} onClick={() => setManagedDepartment({name: "", hospitals: []})} />
          </div>
        )
      }
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