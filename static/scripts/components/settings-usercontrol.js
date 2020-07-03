Vue.component( 'settings-usercontrol',
  {
    props:    ['model'],
    methods: {
      // generate password function
      generatePassword: function() {
        var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
          retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
      },

      pwReset: function() {
        var password = this.generatePassword();

        var request = new XMLHttpRequest();

        // callback function to process the results
        function createAccountCB() {
          if (this.readyState == 4) {
            // check status
            if (this.status != 200) {
              return
            }
//            console.log(request.responseText)
            result = jsyaml.safeLoad(request.responseText)

            if (result.msg == "success") {
              // show login credentials
              $("#pwResetNewPw").val(result.password);
            }
            else {
              alert("Reset fehlgeschlagen!");
            }
          }
        }

        var params  = JSON.stringify( {emailReq: this.model.email, passwordReq: this.model.password, emailTar: this.users.user[this.users.select], passwordTar: password} )
        request.onreadystatechange = createAccountCB
        request.open('POST', '/passwordReset', true);  // asynchronous request
        request.setRequestHeader('Content-type', 'application/json');
        request.send(params);
      },

      selectUser: function(index) {
        this.users.select = index;
        $("#userOptions").modal();
      },

      getUsers: function() {
        // needed for authentication (not working yet)
//        var params  = JSON.stringify( { email: model.email, password: model.password } )
        this.users.user = loadData('POST', '/getallusers'/*, params*/);

//        console.log(this.users)
      },

      addUser: function() {
        this.form.email = $("#inputEmail").val();
        this.form.type = $("#userType").val();
//        console.log(this.form.email);
//        console.log(this.form.type);

        // generate password function
//        function generatePassword() {
//          var length = 8,
//          charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
//          retVal = "";
//          for (var i = 0, n = charset.length; i < length; ++i) {
//            retVal += charset.charAt(Math.floor(Math.random() * n));
//          }
//          return retVal;
//        }

        this.form.password = this.generatePassword();

        var request = new XMLHttpRequest();

        // callback function to process the results
        function createAccountCB() {
          if (this.readyState == 4) {
            // check status
            if (this.status != 200) {
              return
            }
//            console.log(request.responseText)
            result = jsyaml.safeLoad(request.responseText)

            if (result.msg == "account created") {
              // show login credentials
              $("#loginData").modal()
            }
            else {
              alert("Accounterstellung fehlgeschlagen!");
              $("#userAddModalCenter").modal()
            }
          }
        }

        var params  = JSON.stringify( {emailNew: this.form.email, passwordNew: this.form.password, typeNew: this.form.type, email: model.email, password: model.password} )
        request.onreadystatechange = createAccountCB
        request.open('POST', '/createAccount', true);  // asynchronous request
        request.setRequestHeader('Content-type', 'application/json');
        request.send(params);
      }
    },
    data() {
      return {
        form: {
          email: '',
          password: '',
          type: ''
        },
        users: {
          user: {},
          select: -1
        }
      }
    },
    beforeMount() {
      this.getUsers()
    },
    template: `
      <div id="settings-usercontrol" class="container">

        <h3 class="text-center">Benutzerverwaltung</h3>

        <!-- trigger modal account creation-->
        <div class="card my-3 mx-auto" style="max-width: 540px;" data-toggle="modal" data-target="#userAddModalCenter">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/user-plus.svg" class="card-img p-3" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Benutzer hinzuf&uumlgen</h5>
                <p class="card-text">
                  Erstelle ein neuen Account f&uumlr einen Benutzer
                </p>
              </div>
            </div>
          </div>
        </div>

        <br>
        <hr style="max-width: 540px;">
        <br>
        <h3 class="text-center">Vorhandene Benutzer</h3>

        <!-- Modal for user account creation -->
        <div class="modal fade" id="userAddModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Neuen Benutzer erstellen</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">

                <div class="form-group">
                  <label for="inputEmail">Email Adresse</label>
                  <input id="inputEmail" type="email" class="form-control" placeholder="name@beispiel.de">
                  <small id="emailHelp" class="form-text text-muted">Geben Sie die Email Adresse des neuen Nutzers ein.</small>
                </div>

                <div class="form-group">
                  <label for="inputNewPassword">Neues Passwort</label>
                  <input type="password" class="form-control" id="inputNewPassword" value="Neues Passwort" disabled>
                  <small id="newPasswordHelp" class="form-text text-muted">Das Passwort wird automatisch generiert und nach dem best&aumltigen angezeigt.</small>
                </div>

                <div class="form-group">
                  <label for="userType">Nutzerart</label>
                  <select class="form-control" id="userType">
                    <option>Sch&uumller/Azubi</option>
                    <option>Ausbilder</option>
                    <option>Administrator</option>
                  </select>
                  <small id="usertypeHelp" class="form-text text-muted">W&aumlhlen Sie aus, welchem Typ der neue Nutzer zugeordnet werden soll.</small>
                </div>

              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Abbrechen</button>
                <button type="button" class="btn btn-primary" @click="addUser()" data-dismiss="modal">Best&aumltigen</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal to show new login credentials -->
        <div class="modal fade" id="loginData" tabindex="-1" role="dialog" aria-labelledby="loginDataModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Login Daten des neuen Nutzers</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <h3>Teilen Sie dem neuen Nutzer diese Daten mit!</h3>
                <div class="form-group">
                  <label for="accountname">Email Adresse/Accountname:</label>
                  <input id="accountname" type="email" class="form-control" :value="this.form.email" disabled>
                  <small id="accountnameHelp" class="form-text text-muted">Dies ist die Emailadresse mit der sich der Nutzer einloggen muss.</small>
                </div>
                <div class="form-group">
                  <label for="genPassword"Passwort:</label>
                  <input id="genPassword" type="text" class="form-control" :value="this.form.password" disabled>
                  <small id="genPasswordHelp" class="form-text text-muted">Dies ist das Passwort des neuen Nutzers.</small>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-dismiss="modal">Schlie&szligen</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal for user options -->
        <div class="modal fade" id="userOptions" tabindex="-1" role="dialog" aria-labelledby="userOptionsModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="userOptionsLongTitle">Optionen f&uumlr {{this.users.user[this.users.select]}}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="container-fluid">

                  <label for="pwReset"><u>Passwort zur&uumlcksetzen:</u></label>
                  <div id="pwReset" class="row">
                    <div class="col-md-4">
                      <button type="button" class="btn btn-primary" @click="pwReset()">Reset</button>
                    </div>
                    <div class="col-md-8 ml-auto">
                      <input id="pwResetNewPw" type="text" class="form-control" value="" disabled>
                      <small id="accountnameHelp" class="form-text text-muted">Dies ist das neue Passwort.</small>
                    </div>
                  </div>

                  <hr>

                  <label for="deleteAcc"><u>Account l&oumlschen:</u></label>
                  <div id="deleteAcc" class="row">
                    <div class="col-md-10">
                      <button type="button" class="btn btn-primary">L&oumlschen</button>
                      <small class="form-text text-muted">L&oumlscht den gesamten Account samt aller zugeh&oumlrigen Daten.</small>
                    </div>
                  </div>

                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Abbrechen</button>
              </div>
            </div>
          </div>
        </div>

        <!-- loop over all users -->
        <div v-for="(user, index) in this.users.user" class="card my-3 mx-auto" style="max-width: 540px;" @click="selectUser(index)">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/user.svg" class="card-img p-3" alt="USER-LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">{{user}}</h5>
                <p class="card-text">
                  {{user}}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>`
  }
)
