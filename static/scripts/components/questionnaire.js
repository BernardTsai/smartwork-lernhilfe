//TODO: display result compared to running average at the end
Vue.component( 'questionnaire',
  {
    props:    ['model'],
    methods: {
      updateStats: function(result) {
        var request = new XMLHttpRequest();
        var self = this;

        // callback function to process the results
        function updateStatsCB() {
          if (this.readyState == 4) {
            // check status
            if (this.status != 200) {
              return
            }
            result = jsyaml.safeLoad(request.responseText)
//            console.log(result);

            if (result) {
              //TODO: updateStat on frontend
            }
            else {
              alert("Error updating Stats!");
              console.log("error: " + result.msg)
            }
          }
        }

        var params  = JSON.stringify( {profession: this.model.quiz.profession.toString(), qualification: this.model.quiz.qualification.toString(), questionIndex: this.model.quiz.question.toString(), result: result} )
//        console.log(params);
        request.onreadystatechange = updateStatsCB
        request.open('POST', '/updatestat', true);  // asynchronous request
        request.setRequestHeader('Content-type', 'application/json');
        request.send(params);
      },
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
          text = text.split('.').join("");
          text = text.split(',').join("");
          text = text.split(':').join("");
          text = text.split(';').join("");
          text = text.split('!').join("");
          text = text.split('?').join("");
          text = text.split('-').join("");
          
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
        success = (this.model.quiz.questions[this.model.quiz.question].success == "yes")
        this.updateStats(success ? 1 : 0);
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
//        this.model.mode = "result"

        // TODO: display result in modal
        var finalResult = 0
        for (var question of this.model.quiz.questions) finalResult += (question.success == "yes") ? 1 : 0;
        finalResult /= this.model.quiz.length;

        var average = 0
        for (var question of this.model.questionnaire) average += question.stats;
        average /= this.model.questionnaire.length

        // calculate result compared to running average in percent
        var resultCompared = Math.round(((finalResult - average)*100 + Number.EPSILON) * 100) / 100
//        if (resultCompared > 0) alert("Herzlichen Glückwunsch! Du bist " + resultCompared + "% besser als der Durchschnitt (gleitender Mittelwert)");
//        else alert ("Du hast " + finalResult*100 + "% erreicht");

        this.results.result = Math.round((finalResult*100 + Number.EPSILON) * 100) / 100
        this.results.resultCompared = resultCompared

        $("#resultModal").modal()
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
    data() {
      return {
        results: {
          result:         -1,
          resultCompared: -1
        }
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


        <!-- Modal for result displaying -->
        <div class="modal fade" id="resultModal" data-backdrop="static" data-keyboard="false"  tabindex="-1" role="dialog" aria-labelledby="resultModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content border-success">
              <div class="modal-header">
                <h5 class="modal-title" id="resultLongTitle">Quiz Auswertung</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="this.model.mode = 'result'">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">

                <div v-if="this.results.result > 0" class="card text-white bg-success my-3 mx-auto" style="max-width: 540px;">
                  <div class="row no-gutters">
                    <div class="col-md-2 my-auto d-none d-md-block">
                      <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/thumbs-up.svg" class="card-img p-1" alt="thumbs up">
                    </div>
                    <div class="col-md-10">
                      <div class="card-body">
                        <h5 class="card-title">Herzlichen Gl&uumlckwunsch! Du hast {{this.results.result}}% erreicht!</h5>
                        <p v-if="this.results.resultCompared > 0" class="card-text">
                          Du bist {{this.results.resultCompared}}% besser als der Durchschnitt (gleitender Mittelwert)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="this.results.result <= 0" class="card text-white bg-info my-3 mx-auto" style="max-width: 540px;">
                  <div class="row no-gutters">
                    <div class="col-md-2 my-auto d-none d-md-block">
                      <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/times.svg" class="card-img p-1" alt="thumbs up">
                    </div>
                    <div class="col-md-10">
                      <div class="card-body">
                        <h5 class="card-title">Du hast leider {{this.results.result}}% erreicht!</h5>
                       <!-- <p class="card-text">
                          Du bist {{this.results.resultCompared}}% besser als der Durchschnitt (gleitender Mittelwert)
                        </p> -->
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-dismiss="modal" @click="this.model.mode = 'result'">Weiter</button>
              </div>
            </div>
          </div>
        </div>


      </div>`
  }
)
