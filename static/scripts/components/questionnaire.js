Vue.component( 'questionnaire',
  {
    props:    ['model'],
    methods: {
      check: function() {
        // check answers
        status = "success"

        options = []
        answers = []
        success = true

        question = this.model.questionnaire[this.model.quiz.question]

        // loop over all answers and check each option
        for (var index in question.answers) {
          option  = $("#option-" + index)[0].checked ? "yes" : "no"
          answer  = question.answers[index]
          correct = (option == answer)

          options[index] = option
          answers[index] = correct ? "yes" : "no"

          success = success && correct
        }

        this.model.quiz.questions[this.model.quiz.question] = {options: options, answers: answers, success: success ? "yes" : "no"}

        this.model.quiz.mode = "answer"
      },
      next: function() {
        this.model.quiz.question = this.model.quiz.question + 1

        question = this.model.questionnaire[this.model.quiz.question]

        // loop over all answers and check each option
        for (var index in question.answers) {
          $("#option-" + index)[0].checked = false
        }

        this.model.quiz.mode = "question"
      },
      result: function() {
        this.model.mode = "result"
      },
      question: function() {
        return this.questionnaire[this.model.quiz.question]
      },
      answer: function() {
        return this.quiz.questions[this.model.quiz.question]
      },
      correct: function(index) {
        c = this.model.quiz.questions[this.model.quiz.question].answers[index]

        return (c == "yes")
      },
      success: function() {
        s = this.model.quiz.questions[this.model.quiz.question].success

        return (s == "yes")
      }
    },
    computed: {
      questionnaire: function() {
        this.model.questionnaire = loadData( "GET", "/questionnaire/" + this.model.profession + "/" + this.model.qualification)

        this.model.quiz.profession    = this.model.profession
        this.model.quiz.qualification = this.model.qualification
        this.model.quiz.length        = this.model.questionnaire.length
        this.model.quiz.question      = 0
        this.model.quiz.date          = Date.now()
        this.model.quiz.status        = "new"
        this.model.quiz.mode          = "question"

        for (var q of this.model.questionnaire) {
          options = []
          answers = []
          success = ""

          for (var answer of q.answers) {
            options.push("")
            answers.push("")
          }

          this.model.quiz.questions.push( {options: options, answers: answers, success: success} )
        }

        return this.model.questionnaire
      },
      count: function() {
        return this.questionnaire.length
      },
      index: function() {
        return this.model.quiz.question + 1
      },
      quiz: function() {
        return this.model.quiz
      },
      answerMode: function() {
        return this.model.quiz.mode == "answer"
      },
      questionMode: function() {
        return this.model.quiz.mode == "question"
      }
    },
    template: `
      <div id="questionnaire" class="container">
        <form>
          <div class="form-group d-flex">
            <div class="title mr-auto">{{question().title}}</div><div class="my-auto">{{index}}/{{count}}</div>
          </div>
          <div class="form-group">
            {{question().description}}
          </div>
          <div class="form-group">
            <b>Frage:</b> {{question().question}}
          </div>
          <div class="form-group">
            <div v-for="(option,index) in question().options" class="custom-control custom-radio d-flex">
              <input type="checkbox" :id="'option-' + index" name="customCheck" class="custom-control-input" :disabled="answerMode">
              <label class="custom-control-label" :for="'option-'+ index">{{option}}</label>
              <span v-if="answerMode && correct(index)"  class="far fa-check-circle text-success ml-auto text-success"></span>
              <span v-if="answerMode && !correct(index)" class="far fa-times-circle text-success ml-auto text-danger"></span>
            </div>
          </div>
          <div v-if="answerMode" class="form-group">
            <b v-if="success()"  class="text-success">Richtig:</b>
            <b v-if="!success()" class="text-danger">Leider falsch:</b></br/>
            {{question().explanation}}
          </div>
          <div v-if="model.quiz.mode != 'answer' " class="form-group">
            &nbsp;<br/>
            &nbsp;
          </div>
          <div class="form-group d-flex ">
            <button v-if="questionMode" type="button" class="btn btn-sm mr-auto btn-primary"   @click="check()">Prüfen</button>
            <button v-if="answerMode && index!=count"   type="button" class="btn btn-sm mr-auto btn-secondary" @click="next()">Nächste Frage</button>
            <button v-if="answerMode && index==count"   type="button" class="btn btn-sm mr-auto btn-secondary" @click="result()">Ergebnis</button>
          </div>
        </form>
      </div>`
  }
)
