import React, {useEffect, useState} from 'react';
import {db} from "../db";
import accountService from "../services/account.service";

  export const loginAs=(evt)=> {
    evt.preventDefault();
    return db.collection("users")
      .where(firebase.firestore.FieldPath.documentId(), '==', loginData.login)
      .where('password', '==', loginData.password)
      .get()
      .then(users => {
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
        setAvailableHospitals(_.omitBy(users.docs[0].data().permissions, $ => $.length === 0));
      })
    }
  }, [])



  function switchHospital(hospitalId, hospitalName) {
    accountService.switchHospital({id: hospitalId, name: hospitalName}, availableHospitals[hospitalId]);
    setCurrentHospital(accountService.hospital);
    document.dispatchEvent(new Event('organizationChanged'));
  }

  return accountService.isLoggedIn() ? (
    <div className="mt-5 text-center">
      {(currentHospital ? `Obecna organizacja: ${accountService.hospital.name}` : '')}
      Wybierz organizację
      <div >
        {_.keys(availableHospitals).sort().map(hospitalId => {
          var hospitalCandidates = _.filter(allHospitals, $ => $.id === hospitalId);
          const hospitalName = hospitalCandidates.length ? hospitalCandidates[0].name : "ADMIN";
          return (<button className="btn btn-outline-success ml-1 mr-1" onClick={() => switchHospital(hospitalId, hospitalName)}>{hospitalName}</button>)
        })}
        {_.keys(availableHospitals).length === 0 ? 'Twoje konto nie jest powiązane z żadnym szpitalem. Zgłoś się do administratora szpitala.' : ''}
      </div>
    </div>
  ) : (
    <div className="">

      <form onSubmit={loginAs}>
        <div className="form-row justify-content-center align-items-baseline mt-3">
          <div className="form-group col-md-2">
            <div className="row">
              <label className="sr-only" htmlFor="inlineFormInputGroup">Login</label>
              <div className="input-group mb-2">
              <div className="input-group-prepend">
                <div className="input-group-text">Login</div>
              </div>
              <input type="text" className="form-control" value={loginData.login} onChange={e => loginData.login = e.target.value} />
              </div>
            </div>
          </div> &nbsp;&nbsp;
          <div className="form-group col-md-2">
            <label className="sr-only" htmlFor="inlineFormInputGroup">Hasło</label>
            <div className="input-group mb-2">
              <div className="input-group-prepend">
                <div className="input-group-text">Hasło</div>
              </div>
            <input type="password" className="form-control" type="password" value={loginData.password} onChange={e => loginData.password = e.target.value}/>
            </div>
          </div>
          <input className="btn btn-info" type="submit" value="Zaloguj"/>
        </div>
      </form>
    </div>
  );
}
