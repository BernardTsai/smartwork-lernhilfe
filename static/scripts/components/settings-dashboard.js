Vue.component( 'settings-dashboard',
  {
    props:    ['model'],
    methods: {
      select: function(index) {
        model.profession = index

        model.mode = 'profession'
      }
    },
    template: `
      <div id="settings-dashboard" class="container">

        <!-- loop over all professions -->
        <div v-for="(profession, index) in model.materials.professions" class="card my-3 mx-auto" style="max-width: 540px;" @click="select(index)">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img :src="'../../images/' + profession.image" class="card-img p-1" :alt="profession.profession">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title"><!--{{profession.title}}-->DASHBOARD CONTENT</h5>
                <p class="card-text">
                  {{profession.description}}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>`
  }
)
