Vue.component( 'settings-instructorarea',
  {
    props:    ['model'],
    methods: {
      //select: function(index) {
        //model.profession = index

        //model.mode = 'profession'
      //}
    },
    template: `
      <div id="settings-instructorarea" class="container">

        <h3 class="text-center">Ausbilderbereich</h3>

        <div class="card my-3 mx-auto" style="max-width: 540px;" @click="this.model.submode='settings-usercontrol'">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/users-cog.svg" class="card-img p-3" alt="LOGO">
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
            <div class="col-md-2 my-auto">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/chart-area.svg" class="card-img p-3" alt="LOGO">
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
            <div class="col-md-2 my-auto">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/bars.svg" class="card-img p-3" alt="LOGO">
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
