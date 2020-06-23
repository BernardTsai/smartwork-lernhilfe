Vue.component( 'settings-password',
  {
    props:    ['model'],
    methods: {
      //select: function(index) {
        //model.profession = index

        //model.mode = 'profession'
      //}
      getInput: function(){
        this.form.oldPw = $("#inputOldPassword").val();
        this.form.newPw1 = $("#inputNewPassword1").val();
        this.form.newPw2 = $("#inputNewPassword2").val();
        console.log(this.form);
        // send Data to server
      }
    },
    data() {
      return {
        form: {
          oldPw: '',
          newPw1: '',
          newPw2: ''
        },
        name: ''
      }
    },
    template: `
      <div id="settings-password" class="container">

        <h3 class="text-center">Passwort ändern</h3>

        <form class="mx-auto" style="max-width: 540px">
          <div class="form-group">
            <label for="inputOldPassword">Altes Passwort</label>
            <input id="inputOldPassword" type="password" class="form-control" placeholder="Altes Passwort">
            <small id="oldPasswordHelp" class="form-text text-muted">Geben Sie Ihr altes Passwort ein.</small>
          </div>

          <div class="form-group">
            <label for="inputNewPassword1">Neues Passwort</label>
            <input type="password" class="form-control" id="inputNewPassword1" placeholder="Neues Passwort">
            <small id="newPasswordHelp" class="form-text text-muted">Geben Sie das neue Passwort ein.</small>
          </div>

          <div class="form-group">
            <label for="inputNewPassword2">Neues Passwort</label>
            <input type="password" class="form-control" id="inputNewPassword2" placeholder="Neues Passwort">
            <small id="confirmNewPasswordHelp" class="form-text text-muted">Bestätigen Sie Ihr neues Passwort, indem Sie es erneut eingeben.</small>
          </div>

          <button type="button" class="btn btn-primary" @click="getInput()">Bestätigen</button>
        </form>


      </div>`
  }
)

