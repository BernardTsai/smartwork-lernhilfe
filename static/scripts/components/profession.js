Vue.component( 'profession',
  {
    props:    ['model'],
    methods: {
      select: function(index) {
        model.qualification = index
        model.question      = -1
//        model.mode          = "questionnaire"

        $("#questionnaireModal").modal();
      }
    },
    beforeMount(){
      // reset variables to fix index of quizProgressInfo in questionnaire when next quiz is begun
      this.model.qualification = -1
      this.model.questionnaire = []
      this.model.quiz = {
        profession:     -1,
        qualification:  -1,
        date:           "",
        length:         -1,
        question:       -1,
        questions:      [],
        success:        "",
        mode:           ""
      }
    },
    computed: {
      profession: function() {
        return this.model.materials.professions[this.model.profession]
      }
    },
    template: `
      <div id="profession" class="container">
        <div class="row justify-content-center">
          <div class="col-md-2">
            <img :src="'../../images/' + profession.image" class="card-img p-1" :alt="profession.profession">
          </div>
          <div class="col-md-auto">
            <h5 class="card-title">{{profession.title}}</h5>
            <p>
              {{profession.description}}
            </p>
            <p>
              <b>Qualifikationsbausteine:</b>
            </p>
            <!-- <ol start="1" >
              <li v-for="(qualification, index) in profession.qualifications">
                <a @click="select(index)">{{qualification.qualification}}</a>
              </li>
            </ol> -->

            <div class="list-group">
              <a @click="select(index)" v-for="(qualification, index) in profession.qualifications" class="list-group-item list-group-item-action">{{index+1}}. {{qualification.qualification}}</a>
            </div>

          </div>
        </div>

        <!-- Modal for questionnaire view -->
        <div class="modal fade" id="questionnaireModal" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-labelledby="questionnaireModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
            <div class="modal-content" v-if="this.model.qualification != -1">
              <div class="modal-header">
                <h5 class="modal-title" id="questionnaireLongTitle">Quiz - {{this.profession.qualifications[this.model.qualification].qualification}}</h5>
                <!-- <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button> -->
              </div>
              <div class="modal-body">
                <div class="container-fluid">
                  <div class="addScroll">

                    <questionnaire v-bind:model="model"></questionnaire>

                  </div>
                </div>
              </div>
              <!-- <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-dismiss="modal">Schlie&szligen</button>
              </div> -->
            </div>
          </div>
        </div>

      </div>`
  }
)
