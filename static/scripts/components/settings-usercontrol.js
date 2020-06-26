Vue.component( 'settings-usercontrol',
  {
    props:    ['model'],
    methods: {
      addUser: function() {
        this.form.email = $("#inputEmail").val();
        this.form.type = $("#userType").val();
        console.log(this.form.email);
        console.log(this.form.type);

        // generate password function
        function generatePassword() {
          var length = 8,
          charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
          retVal = "";
          for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
          }
          return retVal;
        }

        this.form.password = generatePassword();

        // show login credentials
        $("#loginData").modal()

//        if (this.compareNewPasswords() && this.comparePasswords()) {
//          var request = new XMLHttpRequest();

          // callback function to process the results
//          function saveCertificateCB() {
//            if (this.readyState == 4) {
              // check status
//              if (this.status != 200) {
//                return
//              }
              //console.log(request.responseText)
//              result = jsyaml.safeLoad(request.responseText)
//              model.validated = result.validated
//              model.password = result.password

//              if (result.success == "yes") alert("Passwort erfolgreich ge      ndert!");
//            }
//          }

//          var params  = JSON.stringify( {email: model.email, oldpassword: this.form.oldPw, newpassword: this.form.newPw1} )
//          request.onreadystatechange = saveCertificateCB
//          request.open('POST', '/changepassword', true);  // asynchronous request
//          request.setRequestHeader('Content-type', 'application/json');
//          request.send(params);
//        }
      }
    },
    data() {
      return {
        form: {
          email: '',
          password: '',
          type: ''
        }
      }
    },
    template: `
      <div id="settings-usercontrol" class="container">

        <h3 class="text-center">Benutzerverwaltung</h3>

        <!-- Button trigger modal -->
        <div class="card my-3 mx-auto" style="max-width: 540px;" data-toggle="modal" data-target="#userAddModalCenter">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="images/logo.png" class="card-img p-1" alt="LOGO">
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

        <!-- Modal -->
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

        <!-- Modal mit Logindaten nach erstellung des Nutzers -->
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



        <!-- HIER VLLT ALLE NUTZER ANZEIGEN UND BEIM ANKLCKEN EINE NUTZERS DIE OPTIONEN FUER DIESEN ANZEIGEN. ZB. LOESCHEN, PW RESET ETC. -->
        <div class="card my-3 mx-auto" style="max-width: 540px;">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="images/logo.png" class="card-img p-1" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Benutzer entfernen</h5>
                <p class="card-text">
                  L&oumlscht ein Benutzeraccount mit allen zugeh&oumlrigen Daten
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- loop over all professions
        <div v-for="(profession, index) in model.materials.professions" class="card my-3 mx-auto" style="max-width: 540px;" @click="select(index)">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img :src="'../../images/' + profession.image" class="card-img p-1" :alt="profession.profession">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">{{profession.title}}</h5>
                <p class="card-text">
                  {{profession.description}}
                </p>
              </div>
            </div>
          </div>
        </div>
        -->

      </div>`
  }
)
