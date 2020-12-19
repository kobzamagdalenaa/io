import React, {useEffect, useState} from 'react';
import LoginForm from "./login";
import SignUpForm from "./signup";


export default function AccountForm() {
  const [form, setForm] = useState('LOGIN');


  function renderForm() {
    switch (form) {
      case "LOGIN" :
        return <LoginForm/>
      case "REGISTER":
        return <SignUpForm/>
      default:
        return <LoginForm/>
    }
  }

  return (
    <div className="text-center">
      <div className="">

        <button className="btn btn-primary" onClick={() => setForm('LOGIN')}>Zaloguj</button> &nbsp;
        <button className="btn btn-outline-primary" onClick={() => setForm('REGISTER')}>Załóż konto</button>
      </div>
      {renderForm()}
    </div>
  )
}