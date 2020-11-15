import React, {useEffect, useState} from 'react';
import {db} from "../db";
import * as _ from "lodash";
import firebase from "firebase";
import accountService from "../account.service";

export default function LoginForm() {
  const [loginData] = useState({login: undefined, password: undefined});
  const [availableHospitals, setAvailableHospitals] = useState();
  const [allHospitals, setAllHospitals] = useState([]);
  const [currentHospital, setCurrentHospital] = useState(accountService.hospital);

  useEffect(() => {
    db.collection('hospitals').get().then(response => {
      setAllHospitals(_.map(response.docs, $ => ({id: $.id, name: $.data().name})));
    })
    if (accountService.isLoggedIn()) {
      db.collection("users")
        .where(firebase.firestore.FieldPath.documentId(), '==', accountService.login)
        .get().then(users => {
        setAvailableHospitals(users.docs[0].data().permissions);
      })
    }
  }, [])

  function loginAs(evt) {
    evt.preventDefault();
    db.collection("users")
      .where(firebase.firestore.FieldPath.documentId(), '==', loginData.login)
      .where('password', '==', loginData.password)
      .get().then(users => {
      if (users.docs.length === 0) {
        alert('złe dane');
      } else {
        const login = users.docs[0].id;
        accountService.loginAs(login);
        setAvailableHospitals(users.docs[0].data().permissions);
        document.dispatchEvent(new Event('loggedIn'));
      }
    })
  }

  function switchHospital(hospitalId, hospitalName) {
    accountService.switchHospital({id: hospitalId, name: hospitalName}, availableHospitals[hospitalId]);
    setCurrentHospital(accountService.hospital);
    document.dispatchEvent(new Event('organizationChanged'));
  }

  return accountService.isLoggedIn() ? (
    <div>
      {(currentHospital ? `Obecna organizacja: ${accountService.hospital.name}` : '')}
      Wybierz organizację
      <div>
        {_.keys(availableHospitals).map(hospitalId => {
          const hospitalName = _.filter(allHospitals, $ => $.id === hospitalId)[0].name;
          return (<button onClick={() => switchHospital(hospitalId, hospitalName)}>{hospitalName}</button>)
        })}
        {_.keys(availableHospitals).length === 0 ? 'Twoje konto nie jest powiązane z żadnym szpitalem. Zgłoś się do administratora szpitala.' : ''}
      </div>
    </div>
  ) : (
    <div>
      <form onSubmit={loginAs}>
        <label>Login
          <input type="text" value={loginData.login} onChange={e => loginData.login = e.target.value}/>
        </label>
        <label>Hasło
          <input type="password" value={loginData.password} onChange={e => loginData.password = e.target.value}/>
        </label>
        <input type="submit" value="Zaloguj"/>
      </form>
    </div>
  );
}
