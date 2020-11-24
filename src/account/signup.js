import React, {useEffect, useRef, useState} from 'react';
import {db} from "../db";
import * as _ from "lodash";
import firebase from "firebase";
import accountService from "../account.service";

export default function SignUpForm() {
  const [signUpData, setSignUpData] = useState({login: undefined, password: undefined, name: undefined, surname: undefined});

  function register(evt) {
    evt.preventDefault();
    db.collection("users").doc(signUpData.login).get().then(response => {
      if (response.data()) {
        alert("Konto już istnieje. Wybierz inny login");
      } else {
        db.collection("users").doc(signUpData.login).set({
          password: signUpData.password,
          name: signUpData.name,
          surname: signUpData.surname,
          permissions: {}
        }).then(() => {
          alert("Konto utworzone");
          setSignUpData({login: undefined, password: undefined, name: undefined, surname: undefined})
          Array.from(document.querySelectorAll("#registerForm label input")).forEach(
            input => (input.value = "")
          );
        })
      }
    })
  }

  return (
    <div ref={signUpData}>
      <form id="registerForm" onSubmit={register}>
        <div className="form-row justify-content-center align-items-baseline mt-3">
          <div className="form-group col-md-2 mr-4">
            <div className="row">
              <label className="sr-only" htmlFor="inlineFormInputGroup">Login</label>
              <div className="input-group mb-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">Login</div>
                </div>
                <input type="text" className="form-control" value={signUpData.login} onChange={e => signUpData.login = e.target.value} />
              </div>
            </div>
          </div>
          <div className="form-group col-md-2 mr-4">
            <div className="row">
              <label className="sr-only" htmlFor="inlineFormInputGroup">Hasło</label>
              <div className="input-group mb-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">Hasło</div>
                </div>
                <input type="password" className="form-control" value={signUpData.password} onChange={e => signUpData.password = e.target.value} />
              </div>
            </div>
          </div>
          <div className="form-group col-md-2 mr-4">
            <div className="row">
              <label className="sr-only" htmlFor="inlineFormInputGroup">Imię</label>
              <div className="input-group mb-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">Imię</div>
                </div>
                <input type="text" className="form-control" value={signUpData.name} onChange={e => signUpData.name = e.target.value} />
              </div>
            </div>
          </div>
          <div className="form-group col-md-2 mr-4">
            <div className="row">
              <label className="sr-only" htmlFor="inlineFormInputGroup">Nazwisko</label>
              <div className="input-group mb-2">
                <div className="input-group-prepend">
                  <div className="input-group-text">Nazwisko</div>
                </div>
                <input type="text" className="form-control" value={signUpData.surname} onChange={e => signUpData.surname = e.target.value} />
              </div>
            </div>
          </div>
          <input className="btn btn-info" type="submit" value="Zarejestruj"/>
        </div>
      </form>
    </div>
  );
}
