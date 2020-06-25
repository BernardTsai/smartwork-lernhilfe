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
              <img src="images/logo.png" class="card-img p-1" alt="LOGO">
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

        <div class="card my-3 mx-auto" style="max-width: 540px;">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="images/logo.png" class="card-img p-1" alt="LOGO">
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
