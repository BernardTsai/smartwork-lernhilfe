Vue.component( 'result',
{
  props:    ['model'],
  methods: {
    question: function(index) {
      console.log(index)
      return this.model.questionnaire[index].question
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
      success = "yes"

      for (var q of this.model.quiz.questions) {
        if (q.success == "no") {
          success = "no"
        }
      }
      this.model.quiz.success = success

      return this.model.quiz.success
    }
  },
  template: `
    <div id="result" class="mt-3 shadow p-3 mb-5 mx-3 bg-white rounded">
      <div class="bg-light px-3 d-flex">
        <span class="ml-auto">{{model.quiz.date}}</span>
      </div>
      <div class="bg-light px-3">
        <p class="h1">Zertifikat</p>
        <p class="h3"><b>Profession:</b> {{profession}}</p>
        <p class="h3"><b>Qualification:</b> {{qualification}}</p>
      </div>

      <div v-for="(q,i) in model.quiz.questions" class="p-3 d-flex">
        {{i+1}}. {{question(i)}}
        <span v-if="q.success=='yes'" class="far fa-check-circle text-success ml-auto text-success"></span>
        <span v-if="q.success!='yes'" class="far fa-times-circle text-success ml-auto text-danger"></span>
      </div>

      <div v-if="success == 'no'" class="px-3 text-danger">
        Für ein Zertifikat müssen alle Fragen richtig beantwortet werden.
      </div>
      <div v-if="success == 'yes'" class="px-3 text-success">
        Glückwunsch - die Fragen wurde alle richtig beantwortet.
      </div>

    </div>`
  }
)
