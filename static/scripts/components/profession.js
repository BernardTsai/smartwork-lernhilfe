Vue.component( 'profession',
  {
    props:    ['model'],
    methods: {
      select: function(index) {
        model.qualification = index
        model.question      = -1
        model.mode          = "questionnaire"
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
      </div>`
  }
)
