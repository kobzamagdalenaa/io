import React, {useEffect, useState} from 'react';
import {db} from "../db";
import * as _ from "lodash";
import accountService from "../account.service";


export default function ManageUsers() {
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    loadAllUsers();
  }, []);

  function loadAllUsers() {
    db.collection("users").get().then(users => {
      setAllUsers(_.map(users.docs, $ => ({id: $.id, ...$.data()})));
    });

  }

  function hasPermission(user, role) {
    return _.includes(user.permissions[accountService.hospital.id] || [], role);
  }

  function switchPermission(user, role) {
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

  return (
    <div>
      <h2>Pracownicy Szpitala XXX</h2>
      <table>
        <tr>
          <th>Login</th>
          <th>Imię</th>
          <th>Nazwisko</th>
          <th>Czy lekarz</th>
          <th>Czy administrator</th>
        </tr>
        {
          allUsers.map(user => (
            <tr>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.surname}</td>
              <td><input type="checkbox" checked={hasPermission(user, 'doctor')} onClick={() => switchPermission(user, 'doctor')}/></td>
              <td><input type="checkbox" checked={hasPermission(user, 'admin')} onClick={() => switchPermission(user, 'admin')}/></td>
            </tr>
          ))
        }
      </table>
    </div>
  )
}