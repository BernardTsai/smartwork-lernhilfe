Vue.component( 'settings-userstatus',
  {
    props:    ['model'],
    methods: {
      selectCert: function(profession) {
        for (var i = 0; i < this.model.certificates.length; i++) {
          if (this.model.certificates[i].filename.includes('final-certificate-' + profession)) {
            $('#certs').modal('hide')

            this.model.certificate = i
            this.model.mode = 'certificate'
          }
        }
      },

      selectUser: function(index) {
        this.users.select = index;
        // because of error when trying to access array from modal
        this.users.emailSel = this.users.userFiltered[index].email;
        loadCerts(this.users.userFiltered[index].email);
        loadCert(this.users.userFiltered[index].email);
        getProfessions();
        // show certs in modal
        $("#certs").modal();
      },

      getUsers: function() {
        // needed for authentication (not working yet)
//        var params  = JSON.stringify( { email: model.email, password: model.password } )
        this.users.user = loadData('POST', '/getallusers'/*, params*/);
        // copy userlist to filterd user list
        this.users.userFiltered = JSON.parse(JSON.stringify(this.users.user));
      },

      // request list of all groups from backend
      getGroups: function() {
        this.groups.group = loadData('POST', '/getallgroups'/*, params*/);
        for (let group of this.groups.group) {
          group.members = jsyaml.safeLoad(group.members);
        }
      },

      filterGroups: function() {
        // empty filtered users
        this.users.userFiltered = [];

        this.getGroups();

        // find groups with this.model.email as member
        var arrIndex = -1
        var found = false
        for (let i in this.groups.group) {
          for (let j in this.groups.group[i].members) {
            if (this.groups.group[i].members[j].email == this.model.email) {
              found = true
              arrIndex = i
            }
          }
          if (found) {
            if (arrIndex > -1) {
              this.groups.groupTmp.push(this.groups.group[arrIndex])
            }
            found = false
          }
        }

        for (let i in this.groups.group) {
          for (let j in this.groups.group[i].members) {
            found = false;
            for (let user of this.users.userFiltered) {
              if (user.email == this.groups.group[i].members[j].email) {
                found = true
              }
            }
            if (!found) {
              this.users.userFiltered.push(this.groups.group[i].members[j])
              found = true
            }
          }
        }
      },

      getPercentage: function(profession) {
        var total = this.model.materials.professions[profession].qualifications.length;
        var counter = 0;
        for (var i = 0; i < this.model.certificates.length; i++) {
          if (this.model.certificates[i].filename.includes('certificate-' + profession)) counter++;
        }
	var percent = (counter/total)*100

        // if percent == 100%, final cert doesn't exist yet -> create it! (if final cert exists, percent is > 100 because there is one cert more than there're qualifications)
        if (percent == 100) {
          var request = new XMLHttpRequest();

          // callback function to process the results
          function saveCertificateCB() {
            if (this.readyState == 4) {
              // check status
              if (this.status != 200) {
                return
              }
            }
          }

          date = new Date()
          var finalCert = {
            profession:    profession,
            qualification: -1,
            date:          date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear()
          }

          // issue request to server backend
          var params  = JSON.stringify( { email: this.users.emailSel,  certs: finalCert } )

          request.onreadystatechange = saveCertificateCB
          request.open('POST', '/certificate', true);  // asynchronous request
          request.setRequestHeader('Content-type', 'application/json');
          request.send(params);
        }

        //correct percentage if necessary
        if (percent > 100) percent = ((counter-1)/total)*100

        return Math.round((percent + Number.EPSILON) * 100) / 100
      }
    },
    data() {
      return {
        users: {
          user: {},
          userFiltered: [],
          select: -1,
          emailSel: ''
        },
        groups: {
          group: {},
          groupTmp: []
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

        <!-- Dropdown to filter users -->
        <div class="text-center">
          <p>
            <button class="btn btn-dark" type="button" data-toggle="collapse" data-target="#collapseFilter" aria-expanded="false" aria-controls="collapseFilter">Filter</button>
          </p>
          <div class="collapse" id="collapseFilter">
            <div class="card card-body bg-light my-3 mx-auto" style="max-width: 540px;">
              <p> Filtern nach: </p>
              <button class="btn btn-primary" type="button" @click="filterGroups()">Eigene Gruppen(n)</button>
              <br><hr>
              <button class="btn btn-secondary" type="button" @click="users.userFiltered = JSON.parse(JSON.stringify(users.user));">Zur&uumlcksetzen</button>
            </div>
            <hr style="max-width: 540px;">
          </div>
        </div>

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
                    <div class="col-md-2 my-auto d-none d-md-block">
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
        <div v-for="(user, index) in this.users.userFiltered" :class="{
                                                        'card': true,
                                                        'my-3': true,
                                                        'mx-auto': true,
                                                        'border-info': user.type == 'Ausbilder',
                                                        'border-danger': user.type == 'Administrator',
                                                        'border-success': user.type == 'Schüler/Azubi'
                                                      }" style="max-width: 540px; border: 2px solid;" @click="selectUser(index)">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto d-none d-md-block">
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
