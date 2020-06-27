// TODO: implement an encrytion for passwords to only save the password hash
Vue.component( 'settings-password',
  {
    props:    ['model'],
    methods: {
      // check old password
      comparePasswords: function() {
        if (this.form.oldPw != model.password) {
          alert("Das bisherige Passwort ist falsch")
          return false
        }
        else if (this.form.oldPw == this.form.newPw1) {
          alert("Das neue Passwort darf nicht mit dem bisherigen übereinstimmen")
          return false
        }
        else return true;
      },
      compareNewPasswords: function() {
        if (this.form.newPw1 == this.form.newPw2) return true;
        else {
          alert("Das neue Passwort wurde nicht zwei mal korrekt eingegeben!")
          return false
        }
      },
      getInput: function() {
        this.form.oldPw = $("#inputOldPassword").val();
        this.form.newPw1 = $("#inputNewPassword1").val();
        this.form.newPw2 = $("#inputNewPassword2").val();
        // check passwords and if successful issue request to server backend
        if (this.compareNewPasswords() && this.comparePasswords()) {
          var request = new XMLHttpRequest();

          // callback function to process the results
          function saveCertificateCB() {
            if (this.readyState == 4) {
              // check status
              if (this.status != 200) {
                return
              }
              //console.log(request.responseText)
              result = jsyaml.safeLoad(request.responseText)
              model.validated = result.validated
              model.password = result.password

              if (result.success == "yes") alert("Passwort erfolgreich geändert!");
            }
          }

          var params  = JSON.stringify( {email: model.email, oldpassword: this.form.oldPw, newpassword: this.form.newPw1} )
          request.onreadystatechange = saveCertificateCB
          request.open('POST', '/changepassword', true);  // asynchronous request
          request.setRequestHeader('Content-type', 'application/json');
          request.send(params);
        }
      }
    },
    data() {
      return {
        form: {
          oldPw: '',
          newPw1: '',
          newPw2: ''
        }
      }
    },
    template: `
      <div id="settings-password" class="container" v-if="model.validated == 'yes'">

        <h3 class="text-center">Passwort ändern</h3>

        <form class="mx-auto" style="max-width: 540px">
          <div class="form-group">
            <label for="inputOldPassword">Altes Passwort</label>
            <input id="inputOldPassword" type="password" class="form-control" placeholder="Altes Passwort">
            <small id="oldPasswordHelp" class="form-text text-muted">Geben Sie Ihr altes Passwort ein.</small>
          </div>
          <br>
          <hr>
          <div class="form-group">
            <label for="inputNewPassword1">Neues Passwort</label>
            <input type="password" class="form-control" id="inputNewPassword1" placeholder="Neues Passwort">
            <small id="newPasswordHelp" class="form-text text-muted">Geben Sie das neue Passwort ein.</small>
          </div>

          <div class="form-group">
            <label for="inputNewPassword2">Neues Passwort</label>
            <input type="password" class="form-control validate" id="inputNewPassword2" placeholder="Neues Passwort">
            <small id="confirmNewPasswordHelp" class="form-text text-muted">Bestätigen Sie Ihr neues Passwort, indem Sie es erneut eingeben.</small>
          </div>

          <button type="button" class="btn btn-primary" @click="getInput()">Bestätigen</button>
        </form>


      </div>`
  }
)

