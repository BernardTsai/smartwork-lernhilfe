Vue.component( 'home',
  {
    props:    ['model'],
    methods: {
      // request list of all registered users from backend
      getUsers: function() {
        this.users.user = loadData('POST', '/getallusers'/*, params*/);
      },

      // request list of all groups from backend
    //  getGroups: function() {
    //    this.groups.group = loadData('POST', '/getallgroups'/*, params*/);
    //    for (let group of this.groups.group) {
    //      group.members = jsyaml.safeLoad(group.members);
          // TODO: maybe check if current object is last object and if true call checkMembership()
    //    }
    //    this.checkMembership()
//        console.log(this.groups)
    //  },

      // request list of all groups from backend
      async getGroups() {
        this.groups.group = await loadData('POST', '/getallgroups'/*, params*/);
        for (let group of this.groups.group) {
          group.members = jsyaml.safeLoad(group.members);
        }
//        console.log(this.groups)
        this.checkMembership()
      },

      selectGroup: function(index) {
        this.groups.select = index;
        // because of error when trying to access array from modal
        this.groups.selGroup = JSON.parse(JSON.stringify(this.groups.group[index]))
        this.groups.groupName = this.groups.group[index].groupName
        $("#group").modal();
      },

      // remove all groups that the user isn't member of
      checkMembership: function() {
        var arrIndex = -1
        var found = false
        for (let i in this.groups.group) {
          console.log(this.groups.group[i])
          for (let j in this.groups.group[i].members) {
            if (this.groups.group[i].members[j].email == this.model.email) {
              found = true
              arrIndex = i
            }
          }
          if (found) {
            if (arrIndex > -1) {
              console.log("Mitglied in:")
              console.log(this.groups.group[arrIndex].groupName)
              this.groups.groupTmp.push(this.groups.group[arrIndex])
            }
            found = false
          }
//          else {
//            console.log("Kein Mitglied in:")
//            console.log(this.groups.group[i].groupName)
//          }
        }
      },

      openStatus: function(index) {
        // find index of user in complete user list
        // because index is from this.groups.selGroup.members
        // change model.mode
        // change model.submode
        // open modal for user(index)
      },

      // get percentage of learning state
      getPercentage: function(profession) {
        var total = this.model.materials.professions[profession].qualifications.length;
        var counter = 0;
        for (var i = 0; i < this.model.certificates.length; i++) {
          if (this.model.certificates[i].filename.includes('certificate-' + profession)) counter++;
        }
	var percent = (counter/total)*100
        // if percent == 100% and final cert doesn't exist yet, create it (if final cert exists, percent is > 100 because there is one cert more than there're qualifications
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
          var params  = JSON.stringify( { email: model.email,  certs: finalCert } )

          request.onreadystatechange = saveCertificateCB
          request.open('POST', '/certificate', true);  // asynchronous request
          request.setRequestHeader('Content-type', 'application/json');
          request.send(params);
        }

        //correct percentage if necessary
        if (percent > 100) percent = ((counter-1)/total)*100

        return Math.round((percent + Number.EPSILON) * 100) / 100
      },

      openNextQuiz: function() {
        if (this.getPercentage(this.latestCert.certificate.profession) < 100) {
          model.profession    = this.latestCert.certificate.profession
          model.qualification = (+this.latestCert.certificate.qualification + +1)
          model.question      = -1
          model.mode          = "questionnaire"
        }
        else alert("Finales Zertifikat vorhanden! Kein nächstes Quiz!");
      }

    },
    computed: {
      // returns latest Cert
      latestCert: function() {
        var result = [];
        if (model.certificates.length > 0) {
          var latest = model.certificates[0];
          this.latestCertIndex = 0;

          for (var i = 0; i < model.certificates.length; i++) {
            if (+model.certificates[i].certificate.date > +latest.certificate.date) {
              latest = model.certificates[i];
              this.latestCertIndex = i;
            }
          }
          result = latest;
        }
        return result;
      },
      latestProfession: function() {
        return model.materials.professions[this.latestCert.certificate.profession];
      },
      nextQuizBtnTitle: function() {
        let title = "Alle Quiz wurden bereits abgeschlossen!";
        if (this.getPercentage(this.latestCert.certificate.profession) < 100) title = this.latestProfession.qualifications[this.latestCert.certificate.qualification + 1].qualification;
        return title;
      }
    },
    data() {
      return {
        users: {
          user: {},
          select: -1,
          emailSel: ''
        },
        groups: {
          group: {},
          groupTmp: [],
          selGroup: [],
          select: -1,
          groupName: ''
        },
        latestCertIndex: -1
      }
    },
    beforeMount() {
      this.getUsers();
      this.getGroups();

      loadCerts();
      loadCert();
      getProfessions();

//      window.history.pushState("object or string", "Home", "/home")

//      let uri = window.location.search.substring(1);
//      let params1 = new URLSearchParams(uri);
//      console.log(params1.get("test"));
    },
    template: `
      <div id="home" class="container">

        <br>
        <div class="row no-gutters">
          <div class="col-md">
            <div class="card bg-light p-2">
              <h3 class="row"><a class="col-md-auto">{{model.email}}</a><a :class="{'col-md-auto':true,
                                                                                   'ml-auto': true,
                                                                                   'text-success': model.type == 'Schüler/Azubi',
                                                                                   'text-info': model.type == 'Ausbilder',
                                                                                   'text-danger': model.type == 'Administrator'}">{{model.type}}</a></h3>
              <hr class="m-0">
              <h6 v-if="model.certificates.length > 0" class="row mb-0">
                <a class="col-md-auto">Lernfeld</a><a class="col-md-auto ml-auto"><p v-for="(profession, index) in model.materials.professions" v-if="model.certs_p.includes(index.toString())" class="my-1">{{profession.title}}</p></a>
              </h6>
              <h5 v-if="model.certificates.length == 0">Noch kein Zertifikat in einem Lernfeld erhalten</h5>
            </div>
          </div>
        </div>

        <hr>

        <div class="row no-gutters">

          <div class="card bg-light my-3 mx-auto" style="max-width: 300px;">
            <img class="card-img-top" src="../../images/qualifications.png" alt="Lernfeld">

            <div v-if="model.certificates.length > 0" class="card-body">
              <h5 class="card-title">N&aumlchstes Quiz</h5>
              <div class="card p-2 mx-auto">
                <h7 class="card-title mb-0">{{latestProfession.profession}}</h7>
                <hr class="mt-0 mb-1">
                <h8 class="card-subtitle mb-2 p-1 text-info" v-if="latestCert.certificate.qualification != -1">
                  <div class="card p-1 bg-light">{{latestProfession.qualifications[latestCert.certificate.qualification + 1].qualification}}</div>
                </h8>
                <h8 class="card-subtitle mb-2 p-1 text-success" v-if="latestCert.certificate.qualification == -1">Erfolgreich abgeschlossen!</h8>
              </div>
              <div class="text-center p-2">
                <button type="button" class="btn btn-primary" @click.stop="openNextQuiz()" :title="nextQuizBtnTitle" :disabled="latestCert.certificate.qualification == -1">N&aumlchstes Quiz beginnen</button>
              </div>
              <p class="card-text text-muted text-center">
                Fortschritt: {{this.getPercentage(this.latestCert.certificate.profession)}}%
              </p>
            </div>

            <div v-if="model.certificates.length == 0" class="card-body">
              <h5 class="card-title">Erstes Quiz</h5>
              <div class="card p-2 mx-auto text-white bg-success" @click="model.mode = 'professions'" style="cursor: pointer;">
                <h7 class="card-title mb-1">Jetzt hier ein Lernfeld ausw&aumlhlen</h7>
                <h8 class="card-subtitle mb-1">und direkt das erste Quiz beginnen</h8>
              </div>
              <!-- <div class="text-center p-2">
                <button type="button" class="btn btn-primary" @click.stop="model.mode = 'professions'" title="Lernfeld auswählen">Lernfeld ausw&aumlhlen</button>
              </div> -->
              <small class="card-text text-muted text-center">
                Ist ein erstes Quiz erfolgreich abgeschlossen erhältst du dein erstes Zertifikat
              </small>
            </div>

          </div>

          <div class="card bg-light my-3 mx-auto" style="max-width: 300px;">
            <img class="card-img-top" src="../../images/certificate.png" alt="Zertifikat">

            <div v-if="model.certificates.length > 0" class="card-body">
              <h5 class="card-title">Neustes Zertifikat</h5>
              <div class="card p-2 mx-auto">
                <h7 class="card-title mb-0">{{latestProfession.profession}}</h7>
                <hr class="mt-0 mb-1">
                <h8 class="card-subtitle mb-2 p-1 text-info" v-if="latestCert.certificate.qualification != -1">
                  <div class="card p-1 bg-light">{{latestProfession.qualifications[latestCert.certificate.qualification].qualification}}</div>
                </h8>
                <h8 class="card-subtitle mb-2 p-1 text-success" v-if="latestCert.certificate.qualification == -1">Finales Zertifikat erhalten!</h8>
              </div>
              <div class="text-center p-2">
                <button type="button" class="btn btn-primary" @click.stop="model.certificate = latestCertIndex; model.profession = latestCert.certificate.profession; model.mode = 'certificate';">Zertifikat anzeigen</button>
              </div>
            </div>

            <div v-if="model.certificates.length == 0" class="card-body">
              <h5 class="card-title">Neustes Zertifikat</h5>
              <div class="card p-2 mx-auto text-white bg-dark">
                <h7 class="card-title mb-1">Noch kein Zertifikat erhalten.</h7>
                <h8 class="card-subtitle mb-1">Schlie&szligen Sie ein Quiz erfolgreich ab um ein Zertifikat zu erhalten.</h8>
              </div>
              <small class="card-text text-muted text-center">
                Ist ein erstes Quiz erfolgreich abgeschlossen erhältst du dein erstes Zertifikat
              </small>
            </div>

          </div>

          <div class="card bg-light my-3 mx-auto" style="max-width: 300px;">
            <img class="card-img-top pt-2" src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/users.svg" alt="Gruppen" style="max-height: 133px;">

            <div class="card-body">
              <h5 class="card-title">Mitglied in diesen Gruppen</h5>

              <!-- loop over all groups -->
              <div v-for="(group, index) in this.groups.groupTmp" class="card p-1 mx-auto" style="max-width: 540px;" @click="selectGroup(index)" style="cursor: pointer;">
                <h6 class="card-title mb-0">{{group.groupName}}</h6>
              </div>

            </div>

          </div>

        </div>

        <!-- Modal for group view -->
        <div class="modal fade" id="group" tabindex="-1" role="dialog" aria-labelledby="groupModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="groupLongTitle">Mitglieder von {{this.groups.selGroup.groupName}}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="container-fluid">
                  <div class="addScroll">
                    <!-- loop over all members -->
                    <div v-for="(member, index) in this.groups.selGroup.members" :class="{
                                                                                   'card': true,
                                                                                   'my-3': true,
                                                                                   'mx-auto': true,
                                                                                   'border-info': member.type == 'Ausbilder',
                                                                                   'border-danger': member.type == 'Administrator',
                                                                                   'border-success': member.type == 'Schüler/Azubi'
                                                                                 }" style="max-width: 540px; border: 2px solid;" :id="'selUserG_'+index" @click="openStatus(index)">
                      <div class="row no-gutters">
                        <div class="col-md-2 my-auto d-none d-md-block">
                          <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/user.svg" class="card-img p-3" alt="USER-LOGO">
                        </div>
                        <div class="col-md-10">
                          <div class="card-body">
                            <h5 class="card-title">{{member.email}}</h5>
                            <p class="card-text">
                              {{member.type}}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-dismiss="modal">Schlie&szligen</button>
              </div>
            </div>
          </div>
        </div>

      </div>`
  }
)
