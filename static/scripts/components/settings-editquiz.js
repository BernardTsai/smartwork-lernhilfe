Vue.component( 'settings-editquiz',
  {
    props:    ['model'],
    methods: {
      selectProfession: function(index) {
        // reset dropdown menus if profession selection changed
        if (this.selected.professionIndex != -1){
          if (this.model.quiz.question != -1){
            this.initialStateQuestion()
          }
          this.initialStateQualification()
        }

        this.selected.professionIndex = index
        this.selected.profession = this.model.materials.professions[index]
        var button = document.getElementById("dropdownMenu1");
        button.firstChild.data = this.model.materials.professions[index].description;
        button.classList.remove("btn-secondary");
        button.classList.add("btn-primary");
      },
      selectQualification: function(index) {
        if (this.model.quiz.question != -1){
          this.initialStateQuestion()
        }

        this.selected.qualificationIndex = index
        this.selected.qualification = this.selected.profession.qualifications[index]
        var button = document.getElementById("dropdownMenu2");
        button.firstChild.data = this.selected.profession.qualifications[index].qualification;
        button.classList.remove("btn-secondary");
        button.classList.add("btn-primary");

        // load questions
        var qualification = this.selected.qualificationIndex
        this.model.questionnaire = loadData( "GET", "/questionnaire/" + this.selected.professionIndex + "/" + qualification)
      },
      selectQuestion: function(index) {
//        this.selected.questionIndex = index
        this.model.quiz.question = index
        var button = document.getElementById("dropdownMenu3");
        button.firstChild.data = this.model.questionnaire[index].title;
        button.classList.remove("btn-secondary");
        button.classList.add("btn-primary");
      },
      question: function() {
        return this.model.questionnaire[this.model.quiz.question]
      },
      checkedCheck: function(index) {
        return this.model.questionnaire[this.model.quiz.question].answers[index] == "yes"
      },
      applyChanges: function() {
        this.model.questionnaire[this.model.quiz.question].title = $("#inputQuestionTitle").val()
        this.model.questionnaire[this.model.quiz.question].description = $("#inputQuestionDescription").val()
        this.model.questionnaire[this.model.quiz.question].question = $("#inputQuestion").val()
        for (let i in this.model.questionnaire[this.model.quiz.question].options) {
          this.model.questionnaire[this.model.quiz.question].answers[i] = $("#option-" + i)[0].checked ? "yes" : "no"
          this.model.questionnaire[this.model.quiz.question].options[i] = $("#inputQuestionOptionText-" + i).val()
        }
        this.model.questionnaire[this.model.quiz.question].explanation = $("#inputQuestionExplanation").val()
        this.model.questionnaire[this.model.quiz.question].points = $("#inputQuestionPoints").val()
      },
      saveMaterials: function() {
        var request = new XMLHttpRequest();
        var self = this;

        // callback function to process the results
        function saveMaterialsCB() {
          if (this.readyState == 4) {
            // check status
            if (this.status != 200) {
              return
            }
            result = jsyaml.safeLoad(request.responseText)

            if (result.success) {
              self.selectQualification(self.selected.qualificationIndex)
            }
            else {
              alert("Error!");
              console.log("error: " + result.msg)
            }
          }
        }

        var params  = JSON.stringify( {email: this.model.email, password: this.model.password, profession: this.selected.professionIndex.toString(), qualification: this.selected.qualificationIndex.toString(), materials: this.model.questionnaire} )
        request.onreadystatechange = saveMaterialsCB
        request.open('POST', '/savematerials', true);  // asynchronous request
        request.setRequestHeader('Content-type', 'application/json');
        request.send(params);
      },
      initialStateQualification: function() {
        var button = document.getElementById("dropdownMenu2");
        if (button != null) {
          button.firstChild.data = "Qualifikation auswählen"
          button.classList.remove("btn-primary");
          button.classList.add("btn-secondary");
        }
        this.selected.qualificationIndex = -1
        this.selected.qualification = []
      },
      initialStateQuestion: function() {
        var button = document.getElementById("dropdownMenu3");
        if (button != null) {
          button.firstChild.data = "Frage auswählen"
          button.classList.remove("btn-primary");
          button.classList.add("btn-secondary");
        }
        this.model.quiz.question = -1
      }
    },
    data() {
      return {
        selected: {
          profession: [],
          professionIndex: -1,
          qualificationIndex: -1,
          qualification: []
        }
      }
    },
    beforeMount(){
      // TODO: check if this.model.certificates is already populated and skip if it is
//      loadCerts()
//      loadCert();
//      this.getCerts();
    },
    mounted(){
      // display selection in dropdown-menu
//      $(".dropdown-menu").on('click', 'button', function(){
//        $(".btn:first-child").text($(this).text());
//        $(".btn:first-child").val($(this).text());
//      });
    },
    computed: {
//      details: function() {
//        return this.model.materials.professions
//      }
    },
    template: `
      <div id="settings-editquiz" class="container">
        <h3 class="text-center">Quizverwaltung</h3>

        <!-- trigger modal quiz creation-->
        <div class="card my-3 mx-auto" style="max-width: 540px;" data-toggle="modal" data-target="#quizAddModal" @click="alert('function not implemented yet')">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/user-plus.svg" class="card-img p-3" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Neues Quiz erstellen</h5>
                <p class="card-text">
                  Erstellen eines neuen Quiz mit Zuweisung zu einem Qualifikationsbaustein
                </p>
              </div>
            </div>
          </div>
        </div>

        <br>
        <hr style="max-width: 540px;">
        <br>
        <h3 class="text-center">Quiz bearbeiten</h3>

        <!-- dropdown profession selection -->
        <div class="dropdown text-center">
          <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Lernfeld ausw&aumlhlen
          </button>
          <small class="form-text text-muted">Ausw&aumlhlen des Lernfeldes um fortzufahren</small>
          <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
            <button class="dropdown-item" type="button" v-for="(profession, index) in this.model.materials.professions" @click="selectProfession(index)">{{profession.description}}</button>
          </div>
        </div>

        <!-- dropdown qualification selection -->
        <div v-if="this.selected.professionIndex != -1" class="dropdown text-center">
          <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Qualifikation ausw&aumlhlen
          </button>
          <small class="form-text text-muted">Ausw&aumlhlen der Qualifikation um fortzufahren</small>
          <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
            <button class="dropdown-item" type="button" v-for="(qualification, index) in this.selected.profession.qualifications" @click="selectQualification(index)">{{qualification.qualification}}</button>
          </div>
        </div>

        <!-- quiz details -->
        <div v-if="this.selected.qualificationIndex != -1"  class="card my-3 mx-auto" style="max-width: 540px;" data-toggle="modal" data-target="#quizEditModal">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img :src="'../../images/' + this.selected.profession.image" class="card-img p-1" :alt="this.selected.profession.profession">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">{{this.selected.profession.title}}</h5>
                <h6 class="card-subtitle mb-2 text-muted">{{this.selected.profession.qualifications[this.selected.qualificationIndex].qualification}}</h6>
                <p class="card-text">
                  {{this.model.questionnaire.length}} Quizfragen
                </p>
                <p class="card-text text-muted text-center">
                  >> Zum Bearbeiten anklicken <<
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal for quiz details and options -->
        <div v-if="this.selected.qualificationIndex != -1" class="modal fade" id="quizEditModal" tabindex="-1" role="dialog" aria-labelledby="quizEditModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="quizEditModalLongTitle">Optionen f&uumlr {{this.selected.profession.qualifications[this.selected.qualificationIndex].qualification}}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">

                <label for="editQuestions"><u>Fragen bearbeiten:</u></label>
                <div id="editQuestions" class="row">
                  <div class="col-md-12">

                    <!-- dropdown qualification selection -->
                    <div class="dropdown">
                      <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu3" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Frage ausw&aumlhlen
                      </button>
                      <button v-if="this.model.quiz.question != -1" type="button" class="btn btn-primary" data-dismiss="modal" data-toggle="modal" data-target="#questionEditModal">Frage bearbeiten</button>
                      <div class="dropdown-menu" aria-labelledby="dropdownMenu3">
                        <button class="dropdown-item" type="button" v-for="(question, index) in this.model.questionnaire" @click="selectQuestion(index)">{{question.title}}</button>
                      </div>
                    </div>

                    <small class="form-text text-muted">Hier k&oumlnnen bereits vorhandene Fragen bearbeitet werden.</small>

                  </div>
                </div>

                <hr>

                <label for="addQuestions"><u>Frage hinzuf&uumlgen:</u></label>
                <div id="addQuestions" class="row">
                  <div class="col-md-10">
                    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#confirm-delete" @click="alert('function not implemented yet')">Frage hinzuf&uumlgen</button>
                    <small class="form-text text-muted">Hier kann eine neue Frage zum Quiz hinzugef&uumlgt werden.</small>
                  </div>
                </div>

              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Abbrechen</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal" @click="saveMaterials()">Speichern</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal for question editing -->
        <div v-if="this.model.quiz.question != -1" class="modal fade" id="questionEditModal" tabindex="-1" role="dialog" aria-labelledby="questionEditModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="questionEditModalLongTitle">Optionen f&uumlr {{this.model.questionnaire[this.model.quiz.question].title}}</h5>
                <button type="button" class="close" data-dismiss="modal" data-toggle="modal" data-target="#quizEditModal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">

                <div class="form-group">
                  <label for="inputQuestionTitle">Fragentitel:</label>
                  <input id="inputQuestionTitle" type="text" class="form-control" :value="question().title">
                  <small id="QuestionTitleHelp" class="form-text text-muted">Geben Sie einen Title f&uumlr die Quizfrage ein.</small>
                </div>
                <div class="form-group">
                  <label for="inputQuestionDescription">Fragenbeschreibung:</label>
                  <input id="inputQuestionDescription" type="text" class="form-control" :value="question().description">
                  <small id="QuestionDescriptionHelp" class="form-text text-muted">Geben Sie eine Beschreibung f&uumlr die Quizfrage ein.</small>
                </div>
                <div class="form-group">
                  <label for="inputQuestion">Quizfrage:</label>
                  <input id="inputQuestion" type="text" class="form-control" :value="question().question">
                  <small id="QuestionHelp" class="form-text text-muted">Geben Sie die Quizfrage ein.</small>
                </div>

                <div class="form-group">
                  <label for="questionOptions">Antworten:</label>
                  <div id="questionOptions">
                    <div class="row" v-for="(option,index) in question().options">
                      <div class="col-md-2 radio">
                        <input class="align-bottom" type="radio" :id="'option-' + index" name="customCheck" :checked="checkedCheck(index)">
                      </div>
                      <div class="col-md-10 ml-auto">
                        <input :id="'inputQuestionOptionText-' + index" type="text" class="form-control" :value="option">
                        <small :id="'inputQuestionOptionTextHelp' + index" class="form-text text-muted">Geben Sie hier die {{index+1}}. Antwortm&oumlglichkeit ein.</small>
                      </div>
                    </div>
                  </div>
                  <small id="questionOptionsHelp" class="form-text text-muted">Geben Sie die Antwortm&oumlglichkeiten ein und markieren Sie die richtige Antwort.</small>
                </div>

                <div class="form-group">
                  <label for="inputQuestionExplanation">Erklärung:</label>
                  <input id="inputQuestionExplanation" type="text" class="form-control" :value="question().explanation">
                  <small id="QuestionExplanationHelp" class="form-text text-muted">Geben Sie eine Erkl&aumlrung zur richtigen Antwort der Quizfrage ein.</small>
                </div>
                <div class="form-group">
                  <label for="inputQuestionPoints">Punkte:</label>
                  <input id="inputQuestionPoints" type="number" class="form-control" :value="question().points">
                  <small id="QuestionPointsHelp" class="form-text text-muted">Geben Sie ein, wie viele Punkte mit dieser Frage erreicht werden können.</small>
                </div>

              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal" data-toggle="modal" data-target="#quizEditModal">Abbrechen</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal" data-toggle="modal" data-target="#quizEditModal" @click="applyChanges()">Best&aumltigen</button>
              </div>
            </div>
          </div>
        </div>








      </div>`
  }
)
