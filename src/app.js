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
import 'moment/locale/pl';
import * as moment from "moment";
moment.locale('pl');

render(<Root/>, document.getElementById('root'));

function Root() {
  const [fullyLoggedId, setFullyLoggedIn] = useState(accountService.isFullyLoggedIn());
  const [loggedId, setLoggedIn] = useState(accountService.isLoggedIn());
  const [refresher, refresh] = useState({})

  useEffect(() => {
    document.addEventListener('organizationChanged', () => {
      setFullyLoggedIn(accountService.isFullyLoggedIn());
      refresh({})
    });
    document.addEventListener('loggedIn', () => {
      setLoggedIn(accountService.isLoggedIn());
      refresh({})
    });
  }, []);

  return (
    <div ref={refresher}>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="#">ZSZS</a>

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
  const pages = [
    {name: "Pacjenci", link: "/patients", roles: ["doctor"], component: () => <Patients/>},
    {name: "Oddziały szpitalne", link: "/departments", roles: ["doctor"], component: () => <BedsManagement/>},
    {name: "Zarządzaj oddziałami szpitala", link: "/hospital-departments-management", roles: ["hospital_admin"], component: () => <HospitalDepartmentsManagement/>},
    {name: "Zarządzaj szpitalami", link: "/hospitals-management", roles: ["admin"], component: () => <HospitalsManagement/>},
    {name: "Zarządzaj słownikiem oddziałów", link: "/departments-management", roles: ["admin"], component: () => <DepartmentsManagement/>},
    {name: "Zarządzaj użytkownikami", link: "/manage-users", roles: ["hospital_admin", "admin"], component: () => <ManageUsers/>},
  ]
  const page404 = {component: () => null};

  const [roles, setRoles] = useState([]);
  const [defaultComponent, setDefaultComponent] = useState(page404);



  useEffect(() => {
    document.addEventListener('organizationChanged', () => {
      setRoles(accountService.roles);
    });
    setRoles(accountService.roles);
  }, []);

  useEffect(() => {
    const found = pages.filter(page => _.some(roles, role => _.includes(page.roles, role)));
    setDefaultComponent(found.length ? found[0] : page404)
  }, [roles])

  return (
    <Router ref={roles}>
      <div>
        <nav>
          <ul>
            {
              pages.filter(page => _.some(roles, role => _.includes(page.roles, role)))
                .map($ => <li><Link to={$.link}>{$.name}</Link></li>)
            }
          </ul>
        </nav>

        <Switch>
          {
            pages.filter(page => _.some(roles, role => _.includes(page.roles, role)))
              .map($ => <Route path={$.link} render={$.component}/> )
          }
          {
            pages.filter(page => _.every(roles, role => !_.includes(page.roles, role)))
              .map($ => <Route path={$.link}> <Link to={"/"}>Przejdź do strony startowej</Link> </Route> )
          }
          <Route path="/" render={defaultComponent.component}/>
        </Switch>
      </div>
    </Router>
  );
}

function AccountToolbar() {

  return (
    <div className="row align-items-baseline ml-3">
      <div>
        <span>Zalogowany jako: {accountService.login}</span>
        {accountService.hospital && accountService.hospital.name && accountService.hospital.id !== "PL0" ? <span>, szpital: {accountService.hospital.name}</span> : ''}
        {accountService.hospital && accountService.hospital.id === "PL0" ? <span>, Administrator</span> : ''}
      </div>
      <button className="btn btn-outline-info ml-auto mr-4" onClick={() => {
        accountService.switchHospital(null, null);
        document.dispatchEvent(new Event('organizationChanged'));
      }}>Zmień organizację</button>
      <button className="btn btn-outline-danger ml-auto mr-4" onClick={() => {location.reload()}}>Wyloguj</button>
    </div>
  )
}
