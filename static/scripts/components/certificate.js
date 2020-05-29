Vue.component( 'certificate',
  {
    props:    ['model'],
    methods: {
      select: function(index) {
        model.qualification = index
        model.question      = -1
        model.mode          = "questionnaire"
      }
    },
    beforeMount(){
    },
    computed: {
      certificate: function() {
        return this.model.certificates[this.model.certificate].certificate
      },
      details: function() {
        return this.model.materials.professions[this.model.certificates[this.model.certificate].certificate.profession]
      }
    },
    template: `
      <div id="certificate" class="mt-3 shadow p-3 mb-5 mx-3 bg-white rounded" @click="model.mode='home'"">
        <div class="bg-light px-3 d-flex">
          <a class="navbar-brand" @click="home()">
            <img src="images/logo.png" width="30" height="30" alt="">
            smart<span class="text-danger">work</span>
          </a>
          <span class="ml-auto">{{certificate.date}}</span>
        </div>
        <div class="bg-light px-3">
          <p class="h1">Zertifikat</p>
          <p class="h3"><b>Berufsfeld:</b> {{details.profession}}</p>
          <p class="h3"><b>Qualifikation:</b> {{details.qualifications[certificate.qualification].qualification}}</p>
        </div>

        <div v-for="(q,i) in model.quiz.questions" class="p-3 d-flex">
          <!-- {{i+1}}. {{question(i)}} --> FRAGE
          <!-- <span v-if="q.success=='yes'" class="far fa-check-circle text-success ml-auto text-success"></span> -->
          <!-- <span v-if="q.success!='yes'" class="far fa-times-circle text-success ml-auto text-danger"></span> -->
          <span class="far fa-times-circle text-success ml-auto text-success"></span>
        </div>

        <!-- <div v-if="success == 'no'" class="px-3 text-danger"> -->
          <!-- F      r ein Zertifikat m      ssen alle Fragen richtig beantwortet werden. -->
        <!-- </div> -->
        <!-- <div v-if="success == 'yes'" class="px-3 text-success"> -->
          <!-- Gl      ckwunsch - die Fragen wurden alle richtig beantwortet. -->
        <!-- </div> -->
        <div class="px-3 test-success">
          Zertifikat vorhanden!
        </div>

      </div>`
  }
)