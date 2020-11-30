import React, {useEffect, useState} from 'react';
import * as _ from "lodash";
import accountService from "../services/account.service";
import Input from "../components/input.component";
import Select from "../components/select.component";
import departmentsService from "../services/departments.service";

export default function HospitalDepartmentsManagement() {
  const [departments, setDepartments] = useState([]);
  const [managedDepartment, setManagedDepartment] = useState();
  const [currentHospitalId] = useState(accountService.hospital.id);

  useEffect(() => {
    reloadDepartments();
  }, []);

  async function reloadDepartments() {
    setDepartments(await departmentsService.loadAll());
  }

  async function addToDepartment(departmentId) {
    if (departmentId === undefined) {
      alert("Wybierz oddział do dodania");
      return;
    }
    await departmentsService.addHospitalTo(departmentId, currentHospitalId);
    setManagedDepartment(undefined);
    await reloadDepartments();
  }

  async function removeFromDepartment(department) {
    await departmentsService.removeHospitalFrom(department.id, currentHospitalId);
    setManagedDepartment(undefined);
    await reloadDepartments();
  }

  return (
    <div className="w-100 px-3">
      <h2 className="text-center">Zarządzanie oddziałami szpitala</h2>
      {
        managedDepartment ? (
          <div className="container" style={{maxWidth: "500px"}}>
            {
              managedDepartment.id ? (
                <RemoveDepartment department={managedDepartment}
                                  cancelAction={() => setManagedDepartment(undefined)}
                                  removeAction={() => removeFromDepartment(managedDepartment)}/>
              ) : (
                <AddDepartment departments={departments} hospitalId={currentHospitalId}
                               cancelAction={() => setManagedDepartment(undefined)}
                               addAction={(departmentId) => addToDepartment(departmentId)}/>
              )
            }
          </div>
        ) : (
          <div style={{display: "flex", flexWrap: "wrap"}}>
            {
              departments
                .filter($ => _.includes($.hospitals, currentHospitalId))
                .map(department => <DepartmentTile department={department} onClick={() => setManagedDepartment(_.assign({}, department))} />)
            }
            {
              departments.filter($ => _.includes($.hospitals, currentHospitalId)).length === departments.length ? '' : (
                <DepartmentTile department={{name: "+", extra: "Dodaj nowy"}} onClick={() => setManagedDepartment({})} />
              )
            }
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

function AddDepartment({departments, hospitalId, addAction, cancelAction}) {
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState();

  useEffect(() => {
    setAvailableDepartments(departments.filter(department => !_.includes(department.hospitals, hospitalId)));
  }, [departments]);

  return (
    <div>
      <Select value={selectedDepartmentId} onChange={v => setSelectedDepartmentId(v)} label="Oddział"
              nameMapper={$ => $.name} valueMapper={$ => $.id} options={availableDepartments} customLabelWidth="100px"/>
      <div className="text-center" style={{marginTop: "50px"}}>
        <button className="btn btn-light" style={{marginRight: "20px"}} onClick={() => cancelAction()}>Anuluj</button>
        <button className="btn btn-primary" onClick={() => addAction(selectedDepartmentId)}>Zapisz</button>
      </div>
    </div>
  );
}

function RemoveDepartment({department, removeAction, cancelAction}) {

  function confirmAndThen(removeAction) {
    if (confirm("Na pewno usunąć?")) {
      removeAction();
    }
  }

  return (
    <div>
      <p>{department.name}</p>
      <div className="text-center" style={{marginTop: "50px"}}>
        <button className="btn btn-light" style={{marginRight: "20px"}} onClick={() => cancelAction()}>Anuluj</button>
        <button className="btn btn-danger" onClick={() => confirmAndThen(removeAction)}>Usuń</button>
      </div>
    </div>
  );
}

function DepartmentManagement({hospital}) {

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    setDepartments([...hospital.departments]);
  }, [hospital])

  function addDepartment() {
    const newDepartments = [...departments, {name: "", id: nextId()}];
    setDepartments(newDepartments);
    hospital.departments = newDepartments;
  }

  function nextId() {
    return departments.length === 0 ? "1" : "" + (_.chain(departments)
      .map(departments => departments.id)
      .map(id => +id)
      .max() + 1);
  }

  function removeDepartment(departmentId) {
    const newDepartments = _.filter(departments, $ => $.id !== departmentId);
    console.log(departmentId, departments, newDepartments);
    setDepartments(newDepartments);
    hospital.departments = newDepartments;
  }

  return (
    <div className="container" style={{marginTop: "15px"}}>
      <span>Oddziały:</span>
      <table className="table">
        {
          departments.map(department => (
            <tr key={department.id}>
              <td style={{paddingTop: 0, paddingBottom: 0, borderTop: "none"}}>
                <Input value={department.name} onChange={newValue => department.name = newValue} label="Nazwa" type="text"/>
              </td>
              <td style={{paddingTop: 0, paddingBottom: 0, borderTop: "none"}}>
                <button className="btn btn-sm btn-outline-danger"
                        style={{marginTop: "4px", padding: 0, width: "30px", height: "30px", borderRadius: "50%"}}
                        onClick={() => removeDepartment(department.id)}>X</button>
              </td>
            </tr>
          ))
        }
      </table>
      <button className="btn btn-info" onClick={() => addDepartment()}>Dodaj</button>
    </div>
  )
}