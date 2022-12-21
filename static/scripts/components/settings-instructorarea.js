Vue.component( 'settings-instructorarea',
  {
    props:    ['model'],
    methods: {
    },
    template: `
      <div id="settings-instructorarea" class="container">

        <h3 class="text-center">Ausbilderbereich</h3>

        <div class="card my-3 mx-auto" style="max-width: 540px;" @click="this.model.submode='settings-usercontrol'">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto d-none d-md-block">
              <img src="./vendor/fontawesome-free-5.12.1-web/svgs/solid/users-cog.svg" class="card-img p-3" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Benutzerverwaltung</h5>
                <p class="card-text">
                  Neue Benutzer hinzuf&uumlgen, Verwaltung vorhandener Benutzer
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="card my-3 mx-auto" style="max-width: 540px;" @click="this.model.submode='settings-userstatus'">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto d-none d-md-block">
              <img src="./vendor/fontawesome-free-5.12.1-web/svgs/solid/chart-area.svg" class="card-img p-3" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Lernstand der Azubis</h5>
                <p class="card-text">
                  Prozentualer Lernstand der zugeteilten Azubis, Anzeige der jeweiligen Zertifikate
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="model.type=='Ausbilder' || model.type=='Administrator'" class="card my-3 mx-auto" style="max-width: 540px;" @click="this.model.submode='settings-groups'">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto d-none d-md-block">
              <img src="./vendor/fontawesome-free-5.12.1-web/svgs/solid/bars.svg" class="card-img p-3" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Gruppenerstellung</h5>
                <p class="card-text">
                  Erstellen von Gruppen und Zuordnung von Ausbildern
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="model.type=='Ausbilder' || model.type=='Administrator'" class="card my-3 mx-auto" style="max-width: 540px;" @click="this.model.submode='settings-editquiz'">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto d-none d-md-block">
              <img src="./vendor/fontawesome-free-5.12.1-web/svgs/solid/stream.svg" class="card-img p-3" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Quiz bearbeiten</h5>
                <p class="card-text">
                  Erstellen von neuen Fragen sowie Bearbeitung der vorhandenen Quiz
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>`
  }
)
