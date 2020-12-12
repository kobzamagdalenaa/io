import React, {useEffect, useState} from 'react';
import {render} from 'react-dom';
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
import {db} from "./db";
import * as _ from 'lodash';
import Patients from "./patients/patients";
import accountService from "./services/account.service";
import AccountForm from "./account/accountForm";
import LoginForm from "./account/login";
import ManageUsers from "./mangeUsers/manageUsers";
import LandingPage from "./landingPage/landingPage";
import HospitalsManagement from "./hospitals/hospitalsManagement";
import DepartmentsManagement from "./departments/departmentsManagement";
import HospitalDepartmentsManagement from "./hospitals/hospitalDepartmentsManagement";
import BedsManagement from "./beds/bedsManagement";
import '../style.css';
import AddPatient from "./patients/addOrEditPatient";


render(<Root/>, document.getElementById('root'));

function Root() {
  const [fullyLoggedId, setFullyLoggedIn] = useState(accountService.isFullyLoggedIn());
  const [loggedId, setLoggedIn] = useState(accountService.isLoggedIn());

  useEffect(() => {
    document.addEventListener('organizationChanged', () => {
      setFullyLoggedIn(accountService.isFullyLoggedIn());
    });
    document.addEventListener('loggedIn', () => {
      setLoggedIn(accountService.isLoggedIn());
    });
  }, []);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="#">NAZWA APLIAKCJI</a>

        <div className="w-100" id="navbarSupportedContent">
          <div>{loggedId ? <AccountToolbar/> : <AccountForm/>  }</div>
        </div>
      </nav>
      <div>{fullyLoggedId ? <App/> : (loggedId ? <LoginForm/> : '')}</div>
      {(!loggedId ? <LandingPage/> : '')}
    </div>
  )
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    document.addEventListener('organizationChanged', () => {
      checkIfAdmin();
    });
    checkIfAdmin();
  }, []);

  function checkIfAdmin() {
    setIsAdmin(_.includes(accountService.roles || [], 'admin'));
  }

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/patients">Pacjenci</Link>
            </li>
            {/*<li>*/}
            {/*  <Link to="/users">Users</Link>*/}
            {/*</li>*/}
            <li>
              <Link to="/departments">Oddziały Szpitalne</Link>
            </li>
            <li>
              <Link to="/hospital-departments-management">Zarządzaj oddziałami szpitala</Link>
            </li>
            <li>
              <Link to="/hospitals-management">Zarządzaj Szpitalami</Link>
            </li>
            <li>
              <Link to="/departments-management">Zarządzaj Słownikiem Oddziałów</Link>
            </li>
            {isAdmin ? (<li>
              <Link to="/manage-users">Zarządzaj Użytkownikami</Link>
            </li>) : ''}
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/patients">
            <Patients/>
          </Route>
          <Route path="/users">
            <Users/>
          </Route>
          <Route path="/manage-users">
            <ManageUsers/>
          </Route>
          <Route path="/hospital-departments-management">
            <HospitalDepartmentsManagement />
          </Route>
          <Route path="/departments">
            <BedsManagement />
          </Route>
          <Route path="/hospitals-management">
            <HospitalsManagement />
          </Route>
          <Route path="/departments-management">
            <DepartmentsManagement />
          </Route>
          <Route path="/">
            <Home/>
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

function AccountToolbar() {

  return (
    <div className="row align-items-baseline">
      <div>
        <span>Zalogowany jako: {accountService.login}</span>
        {accountService.hospital ? <span>, szpital: {accountService.hospital.name}</span> : ''}
      </div>
      <button className="btn btn-outline-danger ml-auto mr-4" onClick={() => {location.reload()}}>Wyloguj</button>
    </div>
  )
}

function Home() {
  return <h2>Home</h2>;
}

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    db.collection("users").get().then(users => {
      setUsers(_.map(users.docs, $ => $.data()));
    })
  }, [])

  return (
    <div>
      <h2>Users</h2>
      <div>{JSON.stringify(users)}</div>
    </div>
  );
}
