import React, {useEffect, useState} from 'react';
import {db} from "../db";
import * as _ from "lodash";
import accountService from "../services/account.service";
import Search from "../components/search.component";
import hospitalsService from "../services/hospitals.service";


export default function ManageUsers() {
  const isAdmin = _.some(accountService.roles, $ => $ === "admin")
  return (isAdmin ? <AdminManageUsers/> : <HospitalManageUsers/>);
}

function HospitalManageUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAllUsers();
  }, []);

  useEffect(() => {
    if (filter.length) {
      setUsers(_.filter(allUsers, $ => $.id.indexOf(filter) >= 0))
    } else {
      setUsers([])
    }
  }, [filter, allUsers]);

  function loadAllUsers() {
    db.collection("users").get().then(users => {
      setAllUsers(_.map(users.docs, $ => ({id: $.id, ...$.data()})));
      setUpdating(false);
    });
  }

  function hasPermission(user, role) {
    return _.includes(user.permissions[accountService.hospital.id] || [], role);
  }

  function switchPermission(user, role) {
    setUpdating(true);
    if (hasPermission(user, role)) {
      db.collection("users").doc(user.id)
        .update(`permissions.${accountService.hospital.id}`, _.filter(user.permissions[accountService.hospital.id] || [], $ => $ !== role))
        .then(() => {
          loadAllUsers();
        });
    } else {
      db.collection("users").doc(user.id)
        .update(`permissions.${accountService.hospital.id}`, _.concat(_.filter(user.permissions[accountService.hospital.id] || [], $ => $ !== role), role))
        .then(() => {
          loadAllUsers();
        });
    }
  }

  function searchUsers(value) {
    setFilter(value);
  }

  return (
    <div className="container">
      <h2>{accountService.hospital.name}</h2>
      <Search placeholder="login..." onChange={(value) => {searchUsers(value)}} />
      <table className="table">
        <tr>
          <th>Login</th>
          <th>Imię</th>
          <th>Nazwisko</th>
          <th>Czy lekarz</th>
          <th>Czy administrator szpitala</th>
        </tr>
        {
          users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.surname}</td>
              <td><input type="checkbox" disabled={updating} checked={hasPermission(user, 'doctor')} onClick={() => switchPermission(user, 'doctor')}/></td>
              <td><input type="checkbox" disabled={updating} checked={hasPermission(user, 'hospital_admin')} onClick={() => switchPermission(user, 'hospital_admin')}/></td>
            </tr>
          ))
        }
      </table>
    </div>
  )
}

function AdminManageUsers() {
  const [allHospitals, setAllHospitals] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAllUsers();
    loadAllHospitals();
  }, []);

  useEffect(() => {
    if (filter.length) {
      setUsers(_.filter(allUsers, $ => $.id.indexOf(filter) >= 0))
    } else {
      setUsers([])
    }
  }, [filter, allUsers]);

  function loadAllUsers() {
    db.collection("users").get().then(users => {
      setAllUsers(_.map(users.docs, $ => ({id: $.id, ...$.data()})));
      setUpdating(false);
    });
  }

  function loadAllHospitals() {
    hospitalsService.loadAll().then($ => setAllHospitals($));
  }

  function hasPermission(user, role, hospitalId) {
    return _.includes(user.permissions[hospitalId] || [], role);
  }

  function switchPermission(user, role, hospitalId) {
    setUpdating(true);
    if (hasPermission(user, role, hospitalId)) {
      db.collection("users").doc(user.id)
        .update(`permissions.${hospitalId}`, _.filter(user.permissions[hospitalId] || [], $ => $ !== role))
        .then(() => {
          loadAllUsers();
        });
    } else {
      db.collection("users").doc(user.id)
        .update(`permissions.${hospitalId}`, _.concat(_.filter(user.permissions[hospitalId] || [], $ => $ !== role), role))
        .then(() => {
          loadAllUsers();
        });
    }
  }

  function searchUsers(value) {
    setFilter(value);
  }

  return (
    <div className="container">
      <h2>{accountService.hospital.name}</h2>
      <Search placeholder="login..." onChange={(value) => {searchUsers(value)}} />
      <table className="table">
        <tr>
          <th>Login</th>
          <th>Imię</th>
          <th>Nazwisko</th>
          <th>Czy Administrator</th>
          <th>Czy zarządca szpitala</th>
        </tr>
        {
          users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.surname}</td>
              <td><input type="checkbox" disabled={updating} checked={hasPermission(user, 'admin', 'PL0')} onClick={() => switchPermission(user, 'admin', 'PL0')}/></td>
              <td>
                <table>
                  {
                    allHospitals.map($ => <tr key={$.id}>
                      <td>{$.name}</td>
                      <td><input type="checkbox" disabled={updating} checked={hasPermission(user, 'hospital_admin', $.id)} onClick={() => switchPermission(user, 'hospital_admin', $.id)}/></td>
                    </tr>)
                  }
                </table>
              </td>
            </tr>
          ))
        }
      </table>
    </div>
  )
}