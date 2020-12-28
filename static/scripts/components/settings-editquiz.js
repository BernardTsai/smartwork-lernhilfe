Vue.component( 'settings-editquiz',
  {
    props:    ['model'],
    methods: {
      // save selection in dropdown menu for profession
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
      // save selection in dropdown menu for qualification
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
        // if quiz doesn't exist for selected qualification no array is returned -> check for array to know if quiz exists
        if (!Array.isArray(this.model.questionnaire)) this.model.questionnaire = []
      },
      selectQuestion: function(index) {
        this.model.quiz.question = index
        var button = document.getElementById("dropdownMenu3");
        button.firstChild.data = this.model.questionnaire[index].title;
        button.classList.remove("btn-secondary");
        button.classList.add("btn-primary");
        // make sure this.rmImage is empty to not remove image of other question
        this.rmImage = '';
      },
      question: function() {
        return this.model.questionnaire[this.model.quiz.question]
      },
      checkedCheck: function(index) {
        return this.model.questionnaire[this.model.quiz.question].answers[index] == "yes"
      },
      // apply changes in data model on client
      applyChanges: function(index) {
        var modalIndex = index ? index : ''

        if ($("#inputQuestionTitle" + modalIndex).val()) this.model.questionnaire[this.model.quiz.question].title = $("#inputQuestionTitle" + modalIndex).val()
        if ($("#inputQuestionDescription" + modalIndex).val()) this.model.questionnaire[this.model.quiz.question].description = $("#inputQuestionDescription" + modalIndex).val()
        if (document.getElementById("inputPicture") && document.getElementById("inputPicture").files[0]) {
          // if previous image is replaced - mark it for deletion
          if (this.model.questionnaire[this.model.quiz.question].imageName != document.getElementById('inputPicture').files[0].name && this.rmImage == '') this.rmImage = this.model.questionnaire[this.model.quiz.question].imageName
          this.model.questionnaire[this.model.quiz.question].imageName = document.getElementById('inputPicture').files[0].name
        }
        if ($("#inputQuestion" + modalIndex).val()) this.model.questionnaire[this.model.quiz.question].question = $("#inputQuestion" + modalIndex).val()
        for (let i in this.model.questionnaire[this.model.quiz.question].options) {
          if ($("#option" + modalIndex + "-" + i)[0]) this.model.questionnaire[this.model.quiz.question].answers[i] = $("#option" + modalIndex + "-" + i)[0].checked ? "yes" : "no"
          if ($("#inputQuestionOptionText" + modalIndex + "-" + i).val()) this.model.questionnaire[this.model.quiz.question].options[i] = $("#inputQuestionOptionText" + modalIndex + "-" + i).val()
        }
        if ($("#inputQuestionExplanation" + modalIndex).val()) this.model.questionnaire[this.model.quiz.question].explanation = $("#inputQuestionExplanation" + modalIndex).val()
        if ($("#inputQuestionPoints" + modalIndex).val()) this.model.questionnaire[this.model.quiz.question].points = $("#inputQuestionPoints" + modalIndex).val()
      },
      // save changes in backend
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
              // reload questions
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

        // if picture is marked for deletion - delete it!
        if (this.rmImage != '') {
          this.rmImageReq(this.rmImage)
        }
      },
      // generate new question on client
      addQuestion: function() {
        var newQuestion = {
          title:       '',
          description: '',
          question:    '',
          imageName:   '',
          options:     [ '', '', '' ],
          answerType:  '',
          answers:     [ '', '', '' ],
          explanation: '',
          points:      -1
        }
        this.model.questionnaire.push(newQuestion);
        this.model.quiz.question = this.model.questionnaire.length - 1;
        this.selected.questionType = -1;
        this.selected.answerType = -1;
        this.imageSrc = 'http://placehold.it/180';
      },
      // remove question on client
      rmQuestion: function() {
        if (this.question().imageName != '') this.rmImage = this.question().imageName
        this.model.questionnaire.splice(this.model.quiz.question, 1)
        this.initialStateQuestion()
        this.saveMaterials();
      },
      // compose file on client and provide for download
      downloadQuiz: function () {
        var request = new XMLHttpRequest();
        request.open("GET", "/questionnaire/" + this.selected.professionIndex + "/" + this.selected.qualificationIndex, false)  // synchronous request
        request.send()
        var filename = "questions-" + this.selected.professionIndex + "-" + this.selected.qualificationIndex + ".yaml"
        var text = request.responseText

        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);

        // if images are linked (with model.questionnaire[].imageName) in quiz
        // send them
        for (let i in this.model.questionnaire) {
          if (this.model.questionnaire[i].imageName != '') {
            var link = document.createElement('a');
            link.href = '/getimage/' + this.selected.professionIndex.toString() + '/' + this.selected.qualificationIndex.toString() + '/' + this.model.questionnaire[i].imageName;
            link.download = this.model.questionnaire[i].imageName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      },
      // load question backup from client to replace current data on client with backup
      loadFile: function() {
        var self = this
        document.getElementById('inputBackup').addEventListener('change', function() {
          var fr = new FileReader();
          fr.onload=function(){
            self.model.questionnaire = jsyaml.safeLoad(fr.result)
          }
          fr.readAsText(this.files[0]);
        })
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
      },



      // following function control multi step form
      showTab: function(n) {
        // This function will display the specified tab of the form ...
        var x = document.getElementsByClassName("tab");
        x[n].style.display = "block";
        // ... and fix the Previous/Next buttons:
        if (n == 0) {
          document.getElementById("prevBtn").style.display = "none";
        } else {
          document.getElementById("prevBtn").style.display = "inline";
        }
        if (n == (x.length - 1)) {
//          document.getElementById("nextBtn").style.display = "none"
          document.getElementById("nextBtn").innerHTML = "Abschließen";
        } else {
//          document.getElementById("nextBtn").style.display = "inline"
          document.getElementById("nextBtn").innerHTML = "Weiter";
        }
        // ... and run a function that displays the correct step indicator:
        this.fixStepIndicator(n)
      },

      nextPrev: function(n) {
        // This function will figure out which tab to display
        var x = document.getElementsByClassName("tab");
        // Exit the function if any field in the current tab is invalid:
        if (n == 1 && !this.validateForm()) return false;
        // Hide the current tab:
        x[this.currentTab].style.display = "none";
        // Increase or decrease the current tab by 1:
        this.currentTab = this.currentTab + n;
        // apply changes
        this.applyChanges(1);
        // if you have reached the end of the form... :
        if (this.currentTab >= x.length) {
          //...the form gets submitted:
//          document.getElementById("regForm").submit();

          $("#questionCreation").modal("hide");
//          $("#quizEditModal").modal();
          // save here already because if created question is edited before saving and then editing is canceled - question is removed because of reload..
          this.saveMaterials();
          if (document.getElementById("dropdownMenu4").firstChild.data == 'Bildfrage') {
            //upload picture
//            let user = { email: model.user, password: model.password };

            this.uploadImage();

          } else { $("#quizEditModal").modal(); }
          return false;
        }
        // Otherwise, display the correct tab:
        this.showTab(this.currentTab);
      },

      validateForm: function() {
        // This function deals with validation of the form fields
        var x, y, i, valid = true;
        x = document.getElementsByClassName("tab");
        y = x[this.currentTab].getElementsByTagName("input");
        // A loop that checks every input field in the current tab:
        for (i = 0; i < y.length; i++) {
          // don't check file input
          if (y[i].type == "file") continue;
          // don't check keyword input
          if (y[i].id == "inputKeyWord") continue;
          // If a field is empty...
          if (y[i].value == "") {
            // add an "invalid" class to the field:
            y[i].className += " invalid";
            // and set the current valid status to false:
            valid = false;
          }
        }
        // If the valid status is true, mark the step as finished and valid:
        if (valid) {
          document.getElementsByClassName("step")[this.currentTab].className += " finish";
        }
        return valid; // return the valid status
      },

      fixStepIndicator: function(n) {
        // This function removes the "active" class of all steps...
        var i, x = document.getElementsByClassName("step");
        for (i = 0; i < x.length; i++) {
          x[i].className = x[i].className.replace(" active", "");
        }
        //... and adds the "active" class to the current step:
        x[n].className += " active";
      },

      selectQuestionType: function(index) {
        this.selected.questionType = index;
        var button = document.getElementById("dropdownMenu4");
        if (index == 0) button.firstChild.data = 'Textfrage';
        if (index == 1) button.firstChild.data = 'Bildfrage';
        button.classList.remove("btn-secondary");
        button.classList.add("btn-primary");
      },

      //loads picture into imgPreview
      loadPicture: function(input) {
        var self = this
        document.getElementById('inputPicture').addEventListener('change', function() {
          var fr = new FileReader();

          fr.onload = function (e) {
            $('#imgPreview').attr('src', e.target.result);
          };
          fr.readAsDataURL(this.files[0]);
        })
      },

      uploadImage: function() {
        var image = document.getElementById('inputPicture').files[0];
        if (image) {
          $("#uploadProgress").modal();

          document.getElementById("fileName").innerHTML = 'Dateiname: ' + image.name;
          document.getElementById("fileSize").innerHTML = 'Dateigröße: ' + image.size + ' B';
          document.getElementById("fileType").innerHTML = 'Dateitype: ' + image.type;

          var self = this;
          this.req = new XMLHttpRequest();
          var formData = new FormData();
          var prog = document.getElementById("progress");
          prog.value = 0;
          prog.max = 100;

          formData.append("image", image);
          formData.append("user", JSON.stringify( {email: model.email, password: model.password} ));
          formData.append("quiz", JSON.stringify( {profession: self.selected.professionIndex.toString(), qualification: self.selected.qualificationIndex.toString()} ));

          this.req.onload = function(e) {
            $("#uploadProgress").modal("hide");
            $("#quizEditModal").modal();
          }

          this.req.upload.onprogress = function(e) {
            var p = Math.round(100 / e.total * e.loaded);

            // Update the progress text and progress bar
            document.getElementById("progress").setAttribute("style", `width: ${Math.floor(p)}%`);
            document.getElementById("progress_status").innerText = `${Math.floor(p)}% uploaded`;
            document.getElementById("progress").innerHTML = `${Math.floor(p)}%`;
          }

          this.req.open("POST", '/upload', true);
          this.req.send(formData);

          this.selected.questionType = -1;
        } else {
          console.log("no image to be uploaded")
          $("#quizEditModal").modal();
        }
      },

      uploadImageAbort: function() {
        if (this.req instanceof XMLHttpRequest) {
          this.req.abort();
        }
      },

      // sends remove request to backend for image
      rmImageReq: function(imageFile) {
        var imageFile = imageFile ? imageFile : this.rmImage

        var request = new XMLHttpRequest();
        var self = this;

        // callback function to process the results
        function rmImageReqCB() {
          if (this.readyState == 4) {
            // check status
            if (this.status != 200) {
              return
            }
            result = jsyaml.safeLoad(request.responseText)

            if (result.msg == 'success') {
              // reload questions
              //self.selectQualification(self.selected.qualificationIndex)
            }
            else {
              alert("Error!");
              console.log("error: " + result.msg)
            }
          }
        }

        var params  = JSON.stringify( {emailReq: this.model.email, passwordReq: this.model.password, profession: this.selected.professionIndex.toString(), qualification: this.selected.qualificationIndex.toString(), imageName: imageFile} )
        request.onreadystatechange = rmImageReqCB
        request.open('POST', '/deleteimage', true);  // asynchronous request
        request.setRequestHeader('Content-type', 'application/json');
        request.send(params);
        this.rmImage = '';
      },

      // remove question option
      removeQuestionOption: function(index) {
        this.question().options.splice(index, 1);
        this.question().answers.splice(index, 1);
      },

      prepForExistingQuestion: function() {
        // make sure rmImage is empty to not remove image of other question
        this.rmImage = '';

        // if question contains a picture
        if(this.question().imageName != '') {
          //this.selected.questionType = 1;
          this.selectQuestionType(1);
          var profession = this.selected.professionIndex.toString();
          var qualification = this.selected.qualificationIndex.toString();
          var imageName = this.question().imageName;
          var imageSrc = "/getimage/" + profession + "/" + qualification + "/" + imageName
          this.imageSrc = imageSrc;
//          document.getElementById("imgPreview").src = imageSrc;
//          $('#imgPreview').attr('src', imageSrc);
        } else {
          this.selected.questionType = 0; // TODO: check if this is necessary
          this.selectQuestionType(0);
        }

        if(this.question().answerType == 'Keywords') {
          this.selectAnswerType(1);
        } else {
          this.selected.answerType = 0;
          this.selectAnswerType(0);
        }
      },

      selectAnswerType: function(index) {
        this.selected.answerType = index;
        var button = document.getElementById("dropdownMenu5");
        if (index == 0) {
          button.firstChild.data = 'Multiple Choice';
          this.question().answerType = 'Multiple Choice'

          // clear array and make sure at least one array element exists
          this.question().options.push('');
          this.question().answers = [];
          this.question().answers.push('');
        }
        if (index == 1) {
          button.firstChild.data = 'Texteingabe';
          this.question().answerType = 'Keywords'

          // start with empty array
          if (this.question().options.length != 0) {
            this.question().answers = [];
            this.question().options.splice(0, this.question().options.length);
          }
        }
        button.classList.remove("btn-secondary");
        button.classList.add("btn-primary");
      },

      addKeyWord: function() {
        // grab text from inputKeyWord
        var keyWord = $("#inputKeyWord").val()
        // add it to answerOptions
        this.question().options.push(keyWord);
        this.question().answers.push(-1);
        //clear input
        document.getElementById("inputKeyWord").value = '';
      },

      updateRelevance: function(index) {
        var value = $('#inputOptionPoints-' + index).val()

        this.question().answers[index] = value;
      },






// for fileupload test!! not in use at the moment
      fileChange: function(id) {
        var fileList = document.getElementById(id).files;

        var file = fileList[0];

        if(!file) return;

        document.getElementById("fileName").innerHTML = 'Dateiname: ' + file.name;
        document.getElementById("fileSize").innerHTML = 'Dateigröße: ' + file.size + ' B';
        document.getElementById("fileType").innerHTML = 'Dateitype: ' + file.type;
        document.getElementById("progress").value = 0;
        document.getElementById("prozent").innerHTML = "0%";
      },
      uploadFile: function(id) {
        var file = document.getElementById(id).files[0];
        var formData = new FormData();
        this.client = new XMLHttpRequest();

        var prog = document.getElementById("progress");

        if(!file) return;

        prog.value = 0;
        prog.max = 100;

        formData.append("image", file);

        this.client.onerror = function(e) {
          alert("onError");
        };

        this.client.onload = function(e) {
          document.getElementById("prozent").innerHTML = "100%";
          prog.value = prog.max;
        };

        this.client.upload.onprogress = function(e) {
          var p = Math.round(100 / e.total * e.loaded);
          document.getElementById("progress").value = p;
          document.getElementById("prozent").innerHTML = p + "%";
        };

        this.client.onabort = function(e) {
          alert("Upload abgebrochen");
        };

        this.client.open("POST", "/upload");
        this.client.send(formData);
      },
      uploadAbort: function() {
        if(this.client instanceof XMLHttpRequest) {
          this.client.abort();
        }
      }





    },
    data() {
      return {
        selected: {
          profession: [],
          professionIndex: -1,
          qualificationIndex: -1,
          qualification: [],
          questionType: -1,
          answerType: -1
        },
        currentTab: 0,
        imageSrc: '',
        rmImage: '',
        req: null,
        client: null
      }
    },
    beforeMount(){
      this.model.quiz.question = -1
    },
    mounted(){
      // when modal is rendered - show first tab of the form
      self = this;
      $(document).on('shown.bs.modal','#questionCreation', function () {
        self.currentTab = 0;
        self.showTab(self.currentTab);
      });

      // calls uploadImageAbort from cancel btn
      $(document).on("click", "#uploadAbortBtn", this.uploadImageAbort);

      // display selection in dropdown-menu
//      $(".dropdown-menu").on('click', 'button', function(){
//        $(".btn:first-child").text($(this).text());
//        $(".btn:first-child").val($(this).text());
//      });
      // if file is selected
//      if(this.selected.qualificationIndex != -1) {
//        document.getElementById('inputBackup').addEventListener('change', function() {
//          var fr = new FileReader();
//          fr.onload=loadFile(fr.result)
//          fr.onload=function(){
//            console.log(fr.result);
//          }
//          fr.readAsText(this.files[0]);
//        })
//      }
    },
    computed: {
    },
    template: `
      <div id="settings-editquiz" class="container">

        <!-- upload test 
        <form action="" method="post" enctype="multipart/form-data">
          <input name="file" type="file" id="fileA" @change="fileChange('fileA')"/>
          <input name="upload" value="Upload" type="button" @click="uploadFile('fileA');" />
          <input name="abort" value="Abbrechen" type="button" @click="uploadAbort();" />
        </form>
        <div>
          <div id="fileName"></div>
          <div id="fileSize"></div>
          <div id="fileType"></div>
          <progress id="progress" style="margin-top:10px"></progress> <span id="prozent"></span>
        </div>

        <img style="max-width: 180px;" src="/getimage/0/0/foto03.jpg" /> -->


        <!-- <h3 class="text-center">Quizverwaltung</h3> -->

        <!-- trigger modal quiz creation-->
        <!-- <div class="card my-3 mx-auto" style="max-width: 540px;" data-toggle="modal" data-target="#quizAddModal" @click="alert('function not implemented yet')">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/plus-circle.svg" class="card-img p-3" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Neuen Qualifikationsbaustein erstellen</h5>
                <p class="card-text">
                  Erstellen eines neuen Berufs und/oder Qualifikationsbausteins
                </p>
              </div>
            </div>
          </div>
        </div>

        <br>
        <hr style="max-width: 540px;">
        <br> -->
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
            <div class="col-md-2 my-auto d-none d-md-block">
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

        <!-- download button for quiz backup -->
        <div v-if="this.selected.qualificationIndex != -1" class="text-center">
          <button type="button" class="btn btn-dark" @click="downloadQuiz()">Download: Backup von diesem Quiz</button>
        </div>

        <!-- Modal for quiz details and options -->
        <div v-if="this.selected.qualificationIndex != -1" class="modal fade" id="quizEditModal" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="quizEditModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="quizEditModalLongTitle">Optionen f&uumlr {{this.selected.profession.qualifications[this.selected.qualificationIndex].qualification}}</h5>
                <!-- TODO: REPLACE FULL RELOAD ON CANCEL WITH ADDITIONAL VAR -->
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="selectQualification(selected.qualificationIndex)">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">

                <label for="editQuestions"><u>Fragen bearbeiten:</u></label>
                <div id="editQuestions" class="row">
                  <div class="col-md-12">

                    <!-- dropdown question selection -->
                    <div class="dropdown">
                      <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu3" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Frage ausw&aumlhlen
                      </button>
                      <button v-if="this.model.quiz.question != -1" type="button" class="btn btn-primary" data-dismiss="modal" data-toggle="modal" data-target="#questionCreation" @click="prepForExistingQuestion();">Frage bearbeiten</button>
                      <button v-if="this.model.quiz.question != -1" type="button" class="btn btn-primary" data-dismiss="modal" data-toggle="modal" data-target="#questionDeleteModal">Frage entfernen</button>
                      <div class="dropdown-menu" aria-labelledby="dropdownMenu3">
                        <button v-if="this.model.questionnaire.length > 0" class="dropdown-item" type="button" v-for="(question, index) in this.model.questionnaire" @click="selectQuestion(index)">{{question.title}}</button>
                      </div>
                    </div>

                    <small class="form-text text-muted">Hier k&oumlnnen bereits vorhandene Fragen bearbeitet werden.</small>

                  </div>
                </div>

                <hr>

                <label for="addQuestions"><u>Frage hinzuf&uumlgen:</u></label>
                <div id="addQuestions" class="row">
                  <div class="col-md-10">
                    <button type="button" class="btn btn-primary" data-dismiss="modal" data-toggle="modal" data-target="#questionCreation" @click="addQuestion()">Frage hinzuf&uumlgen</button>
                    <small class="form-text text-muted">Hier kann eine neue Frage zum Quiz hinzugef&uumlgt werden.</small>
                  </div>
                </div>

              </div>
              <div class="modal-footer">

                <label class="btn btn-dark col-auto mr-auto" @click="loadFile()">
                  Lade Backup<input type="file" id="inputBackup" accept=".yaml" hidden>
                </label>

                <!-- TODO: REPLACE FULL RELOAD ON CANCEL WITH ADDITIONAL VAR -->
                <button type="button" class="btn btn-secondary col-auto" data-dismiss="modal" @click="selectQualification(selected.qualificationIndex)">Abbrechen</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal" @click="saveMaterials()">Speichern</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal for question editing -->
        <div v-if="this.model.quiz.question != -1" class="modal fade" id="questionEditModal" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="questionEditModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="questionEditModalLongTitle">Optionen f&uumlr {{this.model.questionnaire[this.model.quiz.question].title}}</h5>
                <!-- TODO: REPLACE FULL RELOAD ON CANCEL WITH ADDITIONAL VAR -->
                <button type="button" class="close" data-dismiss="modal" data-toggle="modal" data-target="#quizEditModal" @click="selectQualification(selected.qualificationIndex)" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">

                <div class="form-group">
                  <label for="inputQuestionTitle">Fragentitel:</label>
                  <input id="inputQuestionTitle" type="text" class="form-control" placeholder="Geben Sie einen kurzen Fragentitel ein" :value="question().title">
                  <small id="QuestionTitleHelp" class="form-text text-muted">Geben Sie einen Title f&uumlr die Quizfrage ein.</small>
                </div>
                <div class="form-group">
                  <label for="inputQuestionDescription">Fragenbeschreibung:</label>
                  <input id="inputQuestionDescription" type="text" class="form-control" placeholder="Geben Sie eine einleitende Beschreibung ein" :value="question().description">
                  <small id="QuestionDescriptionHelp" class="form-text text-muted">Geben Sie eine Beschreibung f&uumlr die Quizfrage ein.</small>
                </div>
                <div class="form-group">
                  <label for="inputQuestion">Quizfrage:</label>
                  <input id="inputQuestion" type="text" class="form-control" placeholder="Geben Sie die Quizfrage ein" :value="question().question">
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
                        <input :id="'inputQuestionOptionText-' + index" type="text" class="form-control" placeholder="Geben Sie eine Antwortmöglichkeit ein" :value="option">
                        <small :id="'inputQuestionOptionTextHelp' + index" class="form-text text-muted">Geben Sie hier die {{index+1}}. Antwortm&oumlglichkeit ein.</small>
                      </div>
                    </div>
                  </div>
                  <small id="questionOptionsHelp" class="form-text text-muted">Geben Sie die Antwortm&oumlglichkeiten ein und markieren Sie die richtige Antwort.</small>
                </div>

                <div class="form-group">
                  <label for="inputQuestionExplanation">Erklärung:</label>
                  <input id="inputQuestionExplanation" type="text" class="form-control" placeholder="Geben Sie eine Erklärung für die richtige Antwort ein" :value="question().explanation">
                  <small id="QuestionExplanationHelp" class="form-text text-muted">Geben Sie eine Erkl&aumlrung zur richtigen Antwort der Quizfrage ein.</small>
                </div>
                <div class="form-group">
                  <label for="inputQuestionPoints">Punkte:</label>
                  <input id="inputQuestionPoints" type="number" class="form-control" :value="question().points">
                  <small id="QuestionPointsHelp" class="form-text text-muted">Geben Sie ein, wie viele Punkte mit dieser Frage erreicht werden können.</small>
                </div>

              </div>
              <div class="modal-footer">
                <!-- TODO: REPLACE FULL RELOAD ON CANCEL WITH ADDITIONAL VAR -->
                <button type="button" class="btn btn-secondary" data-dismiss="modal" data-toggle="modal" data-target="#quizEditModal" @click="selectQualification(selected.qualificationIndex)">Abbrechen</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal" data-toggle="modal" data-target="#quizEditModal" @click="applyChanges()">Best&aumltigen</button>
              </div>
            </div>
          </div>
        </div>





        <!-- Modal for question creation (test) -->
        <div v-if="this.model.quiz.question != -1" class="modal fade" id="questionCreation" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="questionCreationModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="questionCreationLongTitle">Dialog f&uumlr {{this.selected.profession.qualifications[this.selected.qualificationIndex].qualification}}</h5>
                <!-- TODO: REPLACE FULL RELOAD ON CANCEL WITH ADDITIONAL VAR -->
                <button type="button" class="close" data-dismiss="modal" data-toggle="modal" data-target="#quizEditModal" @click="selectQualification(selected.qualificationIndex)" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">

                <form id="questionForm" action="">

                  <!-- One "tab" for each step in the form: -->
                  <div class="tab">
                    <p><label for="inputQuestionTitle1">Fragentitel:</label></p>
                    <p>
                      <input id="inputQuestionTitle1" type="text" class="form-control" placeholder="Geben Sie einen kurzen Fragentitel ein" oninput="this.className = 'form-control'" :value="question().title">
                      <small id="QuestionTitleHelp1" class="form-text text-muted">Geben Sie einen Titel f&uumlr die Quizfrage ein.</small>
                    </p>
                  </div>

                  <div class="tab">
                    <p><label for="inputQuestionDescription1">Fragenbeschreibung:</label></p>
                    <p>
                      <input id="inputQuestionDescription1" type="text" class="form-control" placeholder="Geben Sie eine einleitende Beschreibung ein" oninput="this.className = 'form-control'" :value="question().description">
                      <small id="QuestionDescriptionHelp1" class="form-text text-muted">Geben Sie eine Beschreibung f&uumlr die Quizfrage ein.</small>
                    </p>
                  </div>

                  <div class="tab">
                    <p><label for="inputQuestion1">Quizfrage:</label></p>
                    <p>

                      <!-- dropdown question-type selection -->
                      <div class="dropdown text-center">
                        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu4" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          Art der Frage ausw&aumlhlen
                        </button>
                        <small class="form-text text-muted">Ausw&aumlhlen der Fragenart um fortzufahren</small>
                        <div class="dropdown-menu" aria-labelledby="dropdownMenu4">
                          <button class="dropdown-item" type="button" @click="selectQuestionType(0)">Textfrage</button>
                          <button class="dropdown-item" type="button" @click="selectQuestionType(1)">Bildfrage</button>
                        </div>
                      </div>

                      <div v-if="selected.questionType != -1">
                        <br>
                        <hr>

                        <input v-if="selected.questionType == 0" id="inputQuestion1" type="text" class="form-control" placeholder="Geben Sie die Quizfrage ein" oninput="this.className = 'form-control'" :value="question().question">
                        <small v-if="selected.questionType == 0" id="QuestionHelp1" class="form-text text-muted">Geben Sie die Quizfrage ein.</small>
                        <input v-if="selected.questionType == 1" id="inputQuestion1" type="text" class="form-control" placeholder="Geben Sie die Frage zum Bild ein" oninput="this.className = 'form-control'" :value="question().question">
                        <br>
                        <div v-if="selected.questionType == 1" class="text-center">
                          <label class="btn btn-dark" @click="loadPicture()">
                            Bild hochladen<input type="file" id="inputPicture" accept="image/*" hidden>
                          </label>
                          <p><img id="imgPreview" style="max-width: 180px;" :src="imageSrc" :alt="question().imageName" /></p>
                          <small id="imgPreviewHelp" class="form-text text-muted">Bildvorschau</small>
                        </div>
                        <br>
                        <small v-if="selected.questionType == 1" id="QuestionHelp1" class="form-text text-muted">Geben Sie die Bildfrage ein und laden das Bild zu der Frage hoch.</small>
                        <hr>
                      </div>

                    </p>
                  </div>

                  <div class="tab">
                    <p><label for="questionOptions1">Antworten:</label></p>
                    <p>

                      <!-- dropdown answer-type selection -->
                      <div class="dropdown text-center">
                        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu5" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          Art der Antwort ausw&aumlhlen
                        </button>
                        <small class="form-text text-muted">Ausw&aumlhlen der Antwortart um fortzufahren</small>
                        <div class="dropdown-menu" aria-labelledby="dropdownMenu5">
                          <button class="dropdown-item" type="button" @click="selectAnswerType(0)">Multiple Choice</button>
                          <button class="dropdown-item" type="button" @click="selectAnswerType(1)">Texteingabe</button>
                        </div>
                      </div>

                      <div v-if="selected.answerType != -1">
                        <br>
                        <hr>

                        <div v-if="selected.answerType == 0" id="questionOptions1">
                          <div class="row" v-for="(option,index) in question().options">
                            <div class="col-md-1 pl-0 radio" style="position:relative; top:10px">
                              <input type="radio" :id="'option1-' + index" name="customCheck" :checked="checkedCheck(index)">
                            </div>
                            <div class="col-md pl-0">
                              <input :id="'inputQuestionOptionText1-' + index" type="text" class="form-control" placeholder="Geben Sie eine Antwortmöglichkeit ein" oninput="this.className = 'form-control'" :value="option">
                              <small :id="'inputQuestionOptionTextHelp1' + index" class="form-text text-muted">Geben Sie hier die {{index+1}}. Antwortm&oumlglichkeit ein.</small>
                            </div>
                            <div class="col-md-0 pr-1" style="position:relative; top:7px">
                              <span class="border rounded fas fa-trash-alt" style="font-size: 150%; background: inherit; background: #dddddd;" @click="applyChanges(1); removeQuestionOption(index)" title="Frage entfernen"></span>
                            </div>
                            <div v-if="index == (question().options.length - 1)" class="col-md-0 px-0" style="position:relative; top:7px">
                              <span class="border rounded fas fa-plus" style="font-size: 150%; background: inherit; background: #dddddd;" @click="applyChanges(1); question().options.push(''); question().answers.push('')" title="Frage hinzufügen"></span>
                            </div>
                          </div>
                          <small id="questionOptionsHelp1" class="form-text text-muted">Geben Sie die Antwortm&oumlglichkeiten ein und markieren Sie die richtige Antwort.</small>
                        </div>

                        <div v-if="selected.answerType == 1">
                          <div class="row" id="questionAnswerKeyWords">
                            <div class="col-md">
                              <input id="inputKeyWord" type="text" class="form-control" placeholder="Geben Sie ein Schlüsselwort ein" oninput="this.className = 'form-control'">
                            </div>
                            <div class="col-md-2">
                              <button type="button" class="btn btn-secondary" @click="addKeyWord()">+</button>
                            </div>
                          </div>
                          <small id="keyWordHelp" class="form-text text-muted">Geben Sie ein einzelnes Schlüsselwort ein und drücken anschlie&szligend auf das +.</small>
                          <br>

                          <div class="card" v-for="(option,index) in question().options">
                            <div class="card-body">
                              <div class="row">
                                <div class="col-md">
                                  <input type="text" class="form-control" oninput="this.className = 'form-control'" :value="option" disabled>
                                </div>
                                <div class="col-md-3">
                                  <input :id="'inputOptionPoints-' + index" type="number" class="form-control" oninput="this.className = 'form-control'" @change="updateRelevance(index)" :value="question().answers[index]">
                                </div>
                                <div class="col-md-0" style="position:relative; top:7px">
                                  <span class="border rounded fas fa-trash-alt" style="font-size: 150%; background: inherit; background: #dddddd;" @click="removeQuestionOption(index)" title="Keyword entfernen"></span>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                    </p>
                  </div>

                  <div class="tab">
                    <p><label for="inputQuestionExplanation1">Erklärung:</label></p>
                    <p>
                      <input id="inputQuestionExplanation1" type="text" class="form-control" placeholder="Geben Sie eine Erklärung für die richtige Antwort ein" oninput="this.className = 'form-control'" :value="question().explanation">
                      <small id="QuestionExplanationHelp1" class="form-text text-muted">Geben Sie eine Erkl&aumlrung zur richtigen Antwort der Quizfrage ein.</small>
                    </p>
                  </div>

                  <div class="tab">
                    <p><label for="inputQuestionPoints1">Punkte:</label></p>
                    <p>
                      <input id="inputQuestionPoints1" type="number" class="form-control" oninput="this.className = 'form-control'" :value="question().points">
                      <small id="QuestionPointsHelp1" class="form-text text-muted">Geben Sie ein, wie viele Punkte mit dieser Frage erreicht werden können.</small>
                    </p>
                  </div>

                  <!-- Circles which indicates the steps of the form: -->
                  <div style="text-align:center;margin-top:40px;">
                    <span class="step"></span>
                    <span class="step"></span>
                    <span class="step"></span>
                    <span class="step"></span>
                    <span class="step"></span>
                    <span class="step"></span>
                  </div>

                </form>


              </div>
              <div class="modal-footer">
                <!-- TODO: REPLACE FULL RELOAD ON CANCEL WITH ADDITIONAL VAR -->
                <button type="button" class="btn btn-secondary col-auto mr-auto" data-dismiss="modal" data-toggle="modal" data-target="#quizEditModal" @click="selectQualification(selected.qualificationIndex)">Abbrechen</button>

                <button type="button" class="btn btn-dark btn-sm" id="prevBtn" @click="nextPrev(-1)">Zur&uumlck</button>
                <button type="button" class="btn btn-dark btn-sm" id="nextBtn" @click="nextPrev(1)">Weiter</button>

                <!-- <button type="button" class="btn btn-primary" data-dismiss="modal" data-toggle="modal" data-target="#quizEditModal" @click="alert('applyChanges ()')">Best&aumltigen</button> -->
              </div>
            </div>
          </div>
        </div>





        <!-- Modal for upload progress -->
        <div class="modal fade" id="uploadProgress" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="uploadProgressModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content border border-primary">
              <div class="modal-header">
                <h5 class="modal-title" id="uploadProgressLongTitle">Lade hoch..</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">

                <div>
                  <div id="fileName"></div>
                  <div id="fileSize"></div>
                  <div id="fileType"></div>
                  <br>

                  <div id="progress_wrapper" class="">
                    <label id="progress_status"></label>
                    <div class="progress mb-5">
                      <div id="progress" class="progress-bar" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                  </div>
                </div>

              </div>
              <div class="modal-footer">
                <button id="uploadAbortBtn" type="button" class="btn btn-secondary" data-dismiss="modal">Abbrechen</button>
              </div>
            </div>
          </div>
        </div>

        <!-- modal for delete confirmation -->
        <div v-if="this.model.quiz.question != -1" class="modal fade" id="questionDeleteModal" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="questionDeleteModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="modalLongTitle">L&oumlschen von {{this.model.questionnaire[this.model.quiz.question].title}} best&aumltigen</h5>
                <button type="button" class="close" data-dismiss="modal" data-toggle="modal" data-target="#quizEditModal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="px-3 text-danger">
                  <p class="font-weight-bold">ACHTUNG:</p>
                  <p> Beim klick auf L&oumlschen wird diese Frage vollst&aumlndig gel&oumlscht. Die Aktion kann danach nicht mehr r&uumlckg&aumlngig gemacht werden!</p>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal" data-toggle="modal" data-target="#quizEditModal">Abbrechen</button>
                <a class="btn btn-danger btn-ok" data-dismiss="modal" data-toggle="modal" data-target="#quizEditModal" @click="rmQuestion()">L&oumlschen</a>
              </div>
            </div>
          </div>
        </div>








      </div>`
  }
)
