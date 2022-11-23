Vue.component( 'settings-logs',
  {
    props:    ['model'],
    methods: {
      getLogs: function () {
        var request = new XMLHttpRequest();

        var params  = JSON.stringify( { email: this.model.email, password: this.model.password } )
        this.logs = loadData('POST', '/loadlogs', params);
        if (this.logs.includes("no permission")) {
          this.logs = []
          alert("You do not have permission for this action! This incident is logged!")
        }

        // sort logs - latest on top
        this.logs.sort(function(a, b){
          var year_a = parseInt(a.substr(4, 4), 10);
          var month_a = parseInt(a.substr(a.indexOf('-') + 1, a.lastIndexOf('-') - a.indexOf('-') - 1), 10);
          var day_a = parseInt(a.substr(a.lastIndexOf('-') + 1), 10);

          var year_b = parseInt(b.substr(4, 4), 10);
          var month_b = parseInt(b.substr(b.indexOf('-') + 1, b.lastIndexOf('-') - b.indexOf('-') - 1), 10);
          var day_b = parseInt(b.substr(b.lastIndexOf('-') + 1), 10);

          if (year_a != year_b) return year_b - year_a
          else if (month_a != month_b) return month_b - month_a
          else if (day_a != day_b) return day_b - day_a

          return 0
        });
      },
      selectLog: function(index) {
        this.indexLog = index

        var request = new XMLHttpRequest();

        var params  = JSON.stringify( { log: this.logs[index], email: this.model.email, password: this.model.password } )
        this.log = loadData('POST', '/loadlogs', params);
        $("#logDetails").modal();
      },
      downloadLog: function() {
        var filename = this.logs[this.indexLog] + ".log"
        var text = this.log

        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
      }
    },
    data() {
      return {
        logs: [],
        log: {},
        indexLog: -1
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

        <!-- Modal for logs -->
        <div class="modal fade" id="logDetails" tabindex="-1" role="dialog" aria-labelledby="logDetailsModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="logDetailsLongTitle">Serverlog {{this.logs[this.indexLog]}}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">

                <textarea class="form-control" id="log" rows="20" placeholder="Log ist (noch) leer" :value="this.log" disabled></textarea>

              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-dark mr-auto" @click="downloadLog()">Download Log</button>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Schlie&szligen</button>
              </div>
            </div>
          </div>
        </div>

        <!-- loop over all logs -->
        <div v-for="(log, index) in this.logs" class="card my-3 mx-auto" style="max-width: 540px;" @click="selectLog(index)">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto d-none d-md-block">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/file-code.svg" class="card-img p-1" alt="file-code">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Serverlog</h5>
                <p class="card-text">
                  {{log}}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>`
  }
)
