Vue.component( 'settings-userstatus',
  {
    props:    ['model'],
    methods: {
      selectCert: function(profession) {
        
      },

      selectUser: function(index) {
        this.users.select = index;
        // because of error when trying to access array from modal
        this.users.emailSel = this.users.user[index].email;
        loadCerts(this.users.user[index].email);
        getProfessions();
        // show certs in modal
        $("#certs").modal();
      },

      getUsers: function() {
        // needed for authentication (not working yet)
//        var params  = JSON.stringify( { email: model.email, password: model.password } )
        this.users.user = loadData('POST', '/getallusers'/*, params*/);
      },

      getPercentage: function(profession) {
        var total = this.model.materials.professions[profession].qualifications.length;
        var counter = 0;
        for (var i = 0; i < this.model.certificates.length; i++) {
          if (this.model.certificates[i].filename.includes('certificate-' + profession)) counter++;
        }
	var percent = (counter/total)*100
        return Math.round((percent + Number.EPSILON) * 100) / 100
      }
    },
    data() {
      return {
        users: {
          user: {},
          select: -1,
          emailSel: ''
        }
      }
    },
    beforeMount() {
      this.getUsers()
    },
    computed: {
      details: function() {
        return this.model.materials.professions
      }
    },
    template: `
      <div id="settings-userstatus" class="container">

        <h3 class="text-center">Benutzer&uumlbersicht und Lernstand</h3>

        <!-- Modal for user certs -->
        <div class="modal fade" id="certs" tabindex="-1" role="dialog" aria-labelledby="certsModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="certsLongTitle">Lernfortschritt von {{this.users.emailSel}}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">

                <!-- loop over all professions -->
                <div v-for="(profession, index) in model.certs_p" class="card my-3 mx-auto" style="max-width: 540px;" @click="selectCert(this.model.certs_p[index])">
                  <div class="row no-gutters">
                    <div class="col-md-2 my-auto">
                      <img :src="'../../images/' + details[profession].image" class="card-img p-1" :alt="details[profession].profession">
                    </div>
                    <div class="col-md-10">
                      <div class="card-body">
                        <h5 class="card-title">{{this.model.materials.professions[this.model.certs_p[index]].profession}}</h5>
                        <p class="card-text">
                          Fortschritt: {{getPercentage(this.model.certs_p[index])}}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Abbrechen</button>
              </div>
            </div>
          </div>
        </div>

        <!-- loop over all users -->
        <div v-for="(user, index) in this.users.user" class="card my-3 mx-auto" style="max-width: 540px;" @click="selectUser(index)">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/user.svg" class="card-img p-3" alt="USER-LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">{{user.email}}</h5>
                <p class="card-text">
                  {{user.type}}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>`
  }
)