Vue.component( 'questionnaire',
  {
    props:    ['model'],
    methods: {
      check: function() {
        if (this.question().answerType == 'Multiple Choice') {
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
        }
        if (this.question().answerType == 'Keywords') {
          var finalPoints = +0;
          var maxPoints = +0;
          // get words from textInput
          var text = $('#textInput').val();
          // put words in array and trim words (no capital letters, no spaces, ..)
          var words = text.split(" ");
          // remove words that are double
          for (var index in words) {
            words[index] = words[index].trim();
            words[index] = words[index].toLowerCase();
          }
          var wSize = words.length;
          for (var index = 0; index < wSize; index++) {
            var dublicatePos = words.indexOf(words[index]);
            if (dublicatePos != -1) {
              if (index != dublicatePos) {
                words.splice(dublicatePos, 1);
                index = 0;
                wSize = words.length;
              }
            }
          }
          // trim words from this.question().options (no capital letters, ..)
          for (var index1 in words) {
            for (var index2 in this.question().options) {
              if (words[index1] == this.question().options[index2].trim().toLowerCase()) {
                finalPoints += +this.question().answers[index2];
              }
            }
          }
          // get maximum points possible if every word was correct
          for (points of this.question().answers) maxPoints += +points;

          var percent = (finalPoints/maxPoints)*100

          // if better than 65% - success
          if (percent > 65.0) this.model.quiz.questions[this.model.quiz.question].success = "yes";
          else this.model.quiz.questions[this.model.quiz.question].success = "no";

          this.model.quiz.mode = "answer";
        }
      },
      next: function() {
        this.model.quiz.question = this.model.quiz.question + 1

        question = this.model.questionnaire[this.model.quiz.question]

        if (this.question().answerType == 'Multiple Choice') {
          // wait till entire view is rerendered to prevent js error
          this.$nextTick(function () {
            // loop over all answers and check each option
            for (var index in question.answers) {
              $("#option-" + index)[0].checked = false
            }
          })
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
        date = new Date()

        this.model.questionnaire = loadData( "GET", "/questionnaire/" + this.model.profession + "/" + this.model.qualification)

        this.model.quiz.profession    = this.model.profession
        this.model.quiz.qualification = this.model.qualification
        this.model.quiz.length        = this.model.questionnaire.length
        this.model.quiz.question      = 0
        this.model.quiz.date          = date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear()
        this.model.quiz.status        = "new"
        this.model.quiz.mode          = "question"
        this.model.quiz.questions     = []

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
          <div v-if="question().answerType == 'Multiple Choice'">
            <div class="row">
              <div v-if="question().imageName != ''" class="form-group col-auto">
                <img style="max-width: 350px;" :src="'/getimage/' + model.profession.toString() + '/' + model.qualification.toString() + '/' + question().imageName" />
              </div>
              <div class="form-group col">
                <div v-for="(option,index) in question().options" class="custom-control custom-radio d-flex">

                  <input type="checkbox" :id="'option-' + index" name="customCheck" class="custom-control-input" :disabled="answerMode">
                  <label class="custom-control-label" :for="'option-'+ index">{{option}}</label>

                  <span v-if="answerMode && correct(index)"  class="far fa-check-circle text-success ml-auto text-success"></span>
                  <span v-if="answerMode && !correct(index)" class="far fa-times-circle text-success ml-auto text-danger"></span>
                </div>
              </div>
            </div>
            <div v-if="answerMode" class="form-group">
              <b v-if="success()"  class="text-success">Richtig:</b>
              <b v-if="!success()" class="text-danger">Leider falsch:</b></br/>
              {{question().explanation}}
            </div>
          </div>
          <div v-if="question().answerType == 'Keywords'">
            <div class="row">
              <div v-if="question().imageName != ''" class="form-group col-auto">
                <img style="max-width: 350px;" :src="'/getimage/' + model.profession.toString() + '/' + model.qualification.toString() + '/' + question().imageName" />
              </div>
              <div class="form-group col">

                <textarea class="form-control" id="textInput" rows="3"></textarea>
                <small class="form-text text-muted">Geben Sie hier Ihre Antwort ein.</small>

              </div>
            </div>
            <div v-if="answerMode" class="form-group">
              <b v-if="success()"  class="text-success">Richtig:</b>
              <b v-if="!success()" class="text-danger">Leider falsch:</b></br/>
              {{question().explanation}}
            </div>
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
