class AccountService {

  constructor() {
    this.login = "jkowalski"
  }

  loginAs(login, password) {
    this.login = login;
    this.password = password;
  }

  switchHospital(hospital, roles) {
    this.hospital = hospital;
    this.roles = roles;
  }

  logout() {
    delete this.login;
    delete this.password;
    delete this.hospital;
    delete this.roles;
  }

  isLoggedIn() {
    return !!this.login;
  }

  isFullyLoggedIn() {
    return !!this.login && !!this.hospital;
  }
}

const accountService = new AccountService();
export default accountService;