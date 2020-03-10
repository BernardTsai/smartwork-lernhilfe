Vue.component( 'result',
{
  props:    ['model'],
  methods: {
    question: function(index) {
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
    }
  },
  template: `
    <div id="result" class="container mt-3">
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

    </div>`
  }
)
