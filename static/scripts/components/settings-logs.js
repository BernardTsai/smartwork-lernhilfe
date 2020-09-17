Vue.component( 'settings-logs',
  {
    props:    ['model'],
    methods: {
      getLogs: function () {
        var request = new XMLHttpRequest();

        var params  = JSON.stringify( { email: this.model.email, password: this.model.password } )
        this.logs = loadData('POST', '/loadlogs', params);
        console.log(this.logs)
      },
      selectLog: function(index) {
        var request = new XMLHttpRequest();

        var params  = JSON.stringify( { log: this.logs[index], email: this.model.email, password: this.model.password } )
        this.log = loadData('POST', '/loadlogs', params);
        console.log(this.log)
      }
    },
    data() {
      return {
        logs: [],
        log: {}
      }
    },
    beforeMount() {
      this.getLogs()
    },
    computed: {
    },
    template: `
      <div id="settings-logs" class="container">

        <h3 class="text-center">Serverlogs</h3>

        <!-- loop over all professions -->
        <div v-for="(log, index) in this.logs" class="card my-3 mx-auto" style="max-width: 540px;" @click="selectLog(index); alert('log is currently only displayed in the console')">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/file-code.svg" class="card-img p-1" alt="file-code">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">{{log}}</h5>
                <p class="card-text">
                  
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>`
  }
)
