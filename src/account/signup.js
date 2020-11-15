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
        <label>Login
          <input type="text" value={signUpData.login} onChange={e => signUpData.login = e.target.value}/>
        </label>
        <label>Hasło
          <input type="password" value={signUpData.password} onChange={e => signUpData.password = e.target.value}/>
        </label>
        <label>Imię
          <input type="text" value={signUpData.name} onChange={e => signUpData.name = e.target.value}/>
        </label>
        <label>Nazwisko
          <input type="text" value={signUpData.surname} onChange={e => signUpData.surname = e.target.value}/>
        </label>
        <input type="submit" value="Zarejestruj"/>
      </form>
    </div>
  );
}
