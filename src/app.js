import React, {useEffect, useState} from 'react';
import {render} from 'react-dom';
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
import {db} from "./db";
import * as _ from 'lodash';
import Patients from "./patients/patients";
import accountService from "./account.service";
import AccountForm from "./account/accountForm";
import LoginForm from "./account/login";
import ManageUsers from "./mangeUsers/manageUsers";


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
      <div>{loggedId ? <AccountToolbar/> : <AccountForm/> }</div>
      <div>{fullyLoggedId ? <App/> : (loggedId ? <LoginForm/> : '')}</div>
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
            <li>
              <Link to="/users">Users</Link>
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
    <div>
      <div>Zalogowany jako: {accountService.login}</div>
      <button onClick={() => {location.reload()}}>Wyloguj</button>
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
