Vue.component( 'settings-password',
  {
    props:    ['model'],
    methods: {
      //select: function(index) {
        //model.profession = index

        //model.mode = 'profession'
      //}
    },
    template: `
      <div id="settings-password" class="container">

        <h3 class="text-center">Passwort ändern</h3>

        <form class="mx-auto" style="max-width: 540px">
          <div class="form-group">
            <label for="inputOldPassword">Altes Password</label>
            <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Altes Passwort">
            <small id="oldPasswordHelp" class="form-text text-muted">Geben Sie Ihr altes Passwort ein.</small>
          </div>
          <div class="form-group">
            <label for="inputNewPassword1">Neues Password</label>
            <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Neues Passwort">
            <small id="newPasswordHelp" class="form-text text-muted">Geben Sie das neue Passwort ein.</small>
          </div>
          <div class="form-group">
            <label for="inputNewPassword2">Neues Password</label>
            <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Neues Passwort">
            <small id="confirmNewPasswordHelp" class="form-text text-muted">Bestätigen Sie Ihr neues Passwort, indem Sie es erneut eingeben.</small>
          </div>
          <button type="submit" class="btn btn-primary">Bestätigen</button>
        </form>


      </div>`
  }
)

