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
      if (this.model.certificates[this.model.certificate].certificate.qualification > -1) {
        var qualification = this.model.certificates[this.model.certificate].certificate.qualification
        this.model.questionnaire = loadData( "GET", "/questionnaire/" + this.model.profession + "/" + qualification)
      }
      // load everything a bit different for final cert to display qualifications insted of question titles
      else if (this.model.certificates[this.model.certificate].certificate.qualification == -1) {
        this.model.questionnaire = []
        var qualifications = this.model.materials.professions[this.model.certificates[this.model.certificate].certificate.profession].qualifications
        for (let i in qualifications) {
          var content = {
            title: ""
          }
          this.model.questionnaire.push(content)
          this.model.questionnaire[i].title = qualifications[i].qualification
        }
      }
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
          <p class="h3" v-if="this.model.certificates[this.model.certificate].certificate.qualification > -1">
            <b>Qualifikation:</b> {{details.qualifications[certificate.qualification].qualification}}
          </p>
          <p class="h3 text-success" v-if="this.model.certificates[this.model.certificate].certificate.qualification == -1">
            <b>Finales Zertifikat</b>
          </p>
        </div>

        <div v-for="(q,i) in model.questionnaire" class="p-3 d-flex">
          {{i+1}}. {{q.title}}
          <span class="far fa-check-circle text-success ml-auto text-success"></span>
        </div>

        <div class="px-3 text-success">
          Zertifikat am {{certificate.date}} erhalten!
        </div>

      </div>`
  }
)
