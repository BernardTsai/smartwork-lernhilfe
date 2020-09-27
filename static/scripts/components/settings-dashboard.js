Vue.component( 'settings-dashboard',
  {
    props:    ['model'],
    methods: {
    },
    template: `
      <div id="settings-dashboard" class="container">

        <h3 class="text-center">Konto verwalten</h3>

        <div class="card my-3 mx-auto" style="max-width: 540px;" @click="this.model.submode='settings-password'">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/lock.svg" class="card-img p-3" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Passwort &aumlndern</h5>
                <p class="card-text">
                  Hier kann das eigene Passwort ge&aumlndert werden
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="model.type=='Ausbilder' || model.type=='Administrator'" class="card my-3 mx-auto" style="max-width: 540px;" @click="this.model.submode='settings-instructorarea'">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/bars.svg" class="card-img p-3" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Ausbilderbereich</h5>
                <p class="card-text">
                  Verwaltung der Azubis, Erstellung neuer Benutzerkonten
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="model.type=='Administrator'" class="card my-3 mx-auto" style="max-width: 540px;" @click="this.model.submode='settings-logs'">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/file-code.svg" class="card-img p-3" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Serverlog (Backend)</h5>
                <p class="card-text">
                  Ansehen und Download des Serverlogs
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>`
  }
)
