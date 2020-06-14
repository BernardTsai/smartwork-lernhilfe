Vue.component( 'app',
  {
    props:    ['model'],
    methods: {
      home: function() {
        // only go home if validated
        if (model.validated === 'yes') {
          model.mode = 'home'
        }
      },
      select: function(index) {
        model.profession = index

        model.mode = 'profession'
      },
      selectCerts: function(professionId) {
        model.tmp = professionId
        // aus Gruenden wird beforeMount() in certs_details nicht ausgefuehrt wenn es hier aufgerufen wird
        model.mode = 'certs_details'
      }
    },
    template: `
      <div id="app">

        <!-- navigation bar -->
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
          <a class="navbar-brand" @click="home()">
            <img src="images/logo.png" width="30" height="30" alt="">
            smart<span class="text-danger">work</span>
          </a>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul v-if="model.validated == 'yes'" class="navbar-nav ml-auto">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Lernfelder
                </a>
                <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                  <a class="dropdown-item" @click="model.mode='professions'">Übersicht</a>
                  <div class="dropdown-divider"></div>
                  <a v-for="(profession, index) in model.materials.professions" class="dropdown-item" @click="select(index)">{{profession.profession}}</a>
                </div>
              </li>
              <li class="nav-item">
                <a class="nav-link" @click="model.mode='certs_overview'">Zertifikate</a>
              </li>
              <!-- li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Zertifikate
                </a>
                <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                  <a class="dropdown-item" @click="model.mode='certs_overview'">Übersicht</a>
                  <div class="dropdown-divider"></div>
                  <a v-for="(profession, index) in model.certs_p" class="dropdown-item" @click="selectCerts(model.certs_p[index])">
                    {{model.materials.professions[model.certs_p[index]].profession}}
                  </a>
                </div>
              </li -->
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Konto
                </a>
                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown2">
                  <a class="dropdown-item" href="#">Einstellungen</a>
                  <div class="dropdown-divider"></div>
                  <a class="dropdown-item" target="smartwork" href="https://www.smart-work-frankfurt.de/extra/datenschutz.html">Datenschutz</a>
                  <a class="dropdown-item" target="smartwork" href="https://www.smart-work-frankfurt.de/extra/impressum.html">Impressum</a>
                  <a class="dropdown-item" target="smartwork" href="https://www.smart-work-frankfurt.de/extra/kontakt.html">Kontakt</a>
                </div>
              </li>
            </ul>
          </div>
        </nav>

        <login           v-bind:model="model" v-if="model.mode == 'login'"          ></login>
        <home            v-bind:model="model" v-if="model.mode == 'home'"           ></home>
        <professions     v-bind:model="model" v-if="model.mode == 'professions'"    ></professions>
        <profession      v-bind:model="model" v-if="model.mode == 'profession'"     ></profession>
        <questionnaire   v-bind:model="model" v-if="model.mode == 'questionnaire'"  ></questionnaire>
        <result          v-bind:model="model" v-if="model.mode == 'result'"         ></result>
        <certs_overview  v-bind:model="model" v-if="model.mode == 'certs_overview'" ></certs_overview>
        <certs_details   v-bind:model="model" v-if="model.mode == 'certs_details'"  ></certs_details>
        <certificate     v-bind:model="model" v-if="model.mode == 'certificate'"    ></certificate>
      </div>`
  }
)
