Vue.component( 'result',
{
  props:    ['model'],
  methods: {
    question: function(index) {
      return this.model.questionnaire[index].question
    },
    saveCertificate: function() {
      var request = new XMLHttpRequest();

      // callback function to process the results
      function saveCertificateCB() {
        if (this.readyState == 4) {
          // check status
          if (this.status != 200) {
            return
          }

          result = jsyaml.safeLoad(request.responseText)
          if (result.success == 'no') console.log(result.err)
        }
      }

      // issue request to server backend
      var params  = JSON.stringify( { email: model.email,  quiz: model.quiz } )

      request.onreadystatechange = saveCertificateCB
      request.open('POST', '/quiz', true);  // asynchronous request
      const token = sessionStorage.getItem("token");
      request.setRequestHeader('Authorization', `Bearer ${token}`);
      request.setRequestHeader('Content-type', 'application/json');
      request.send(params);
    }
  },
  computed: {
    profession: function() {
      profession = this.model.materials.professions[this.model.profession].profession

      return profession
    },
    qualification: function() {
      profession    = this.model.materials.professions[this.model.profession]
      qualification = profession.qualifications[this.model.qualification].qualification

      return qualification
    },
    success: function() {
      if (this.model.quiz.success == "yes") this.saveCertificate();

      return this.model.quiz.success
    },
    certDate: function() {
      var certDateString = "";
      var date = new Date(this.model.quiz.date);

      certDateString += date.getDate() + '.' + (date.getMonth()+1) + '.' + date.getFullYear()

      return certDateString;
    }
  },
  template: `
    <div id="result" class="mt-3 shadow p-3 mb-5 mx-3 bg-white rounded" @click="model.mode='home'"">
      <div class="bg-light px-3 d-flex">
        <a class="navbar-brand" @click="home()">
          <img src="images/logo.png" width="30" height="30" alt="">
          smart<span class="text-danger">work</span>
        </a>
        <span class="ml-auto">{{certDate}}</span>
      </div>
      <div class="bg-light px-3">
        <p class="h1">Zertifikat</p>
        <p class="h3"><b>Berufsfeld:</b> {{profession}}</p>
        <p class="h3"><b>Qualifikation:</b> {{qualification}}</p>
      </div>

      <div v-for="(q,i) in model.quiz.questions" class="p-3 d-flex">
        {{i+1}}. {{question(i)}}
        <span v-if="q.success=='yes'" class="far fa-check-circle ml-auto text-success"></span>
        <span v-if="q.success!='yes'" class="far fa-times-circle ml-auto text-danger"></span>
      </div>

      <div v-if="success == 'no'" class="px-3 text-danger">
        Für ein Zertifikat müssen {{this.model.questionnaire.settings.success * 100}}% der möglichen Punktzahl erreicht werden.
      </div>
      <div v-if="success == 'yes'" class="px-3 text-success">
        Glückwunsch - du hast ein Zertifikat erhalten.
      </div>

    </div>`
  }
)
