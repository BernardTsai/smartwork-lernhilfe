Vue.component( 'home',
  {
    props:    ['model'],
    methods: {
      // request list of all registered users from backend
      getUsers: function() {
        this.users.user = loadData('POST', '/getallusers'/*, params*/);
      },

      // request list of all groups from backend
      getGroups: function() {
        this.groups.group = loadData('POST', '/getallgroups'/*, params*/);
        for (let group of this.groups.group) {
          group.members = jsyaml.safeLoad(group.members);
        }
        this.checkMembership()
//        console.log(this.groups)
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
          for (let j in this.groups.group[i].members) {
            if (this.groups.group[i].members[j].email == this.model.email) {
              found = true
              arrIndex = i
            }
          }
          if (found) {
            if (arrIndex > -1) {
//              console.log("Mitglied in:")
//              console.log(this.groups.group[arrIndex].groupName)
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
        }
      }
    },
    beforeMount() {
      this.getUsers();
      this.getGroups();

//      window.history.pushState("object or string", "Home", "/home")

//      let uri = window.location.search.substring(1);
//      let params1 = new URLSearchParams(uri);
//      console.log(params1.get("test"));
    },
    template: `
      <div id="home" class="container">

        <div class="card my-3 mx-auto" style="max-width: 540px;" @click="model.mode = 'professions'">
          <div class="row no-gutters">
            <div class="col-md-4 my-auto">
              <img src="../../images/qualifications.png" class="card-img" alt="Lernfelder">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">Lernfelder</h5>
                <p class="card-text">
                  Hier wählen Sie das Lernfeld aus für welches Sie sich interessieren.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="card my-3 mx-auto" style="max-width: 540px;" @click="model.mode = 'certs_overview'">
          <div class="row no-gutters">
            <div class="col-md-4 my-auto">
              <img src="../../images/certificate.png" class="card-img" alt="Zertifikate">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">Zertifikate</h5>
                <p class="card-text">
                  Hier finden Sie die von Ihnen bereits erworbenen Zertifikate
                </p>
              </div>
            </div>
          </div>
        </div>

        <br>
        <hr style="max-width: 540px;">
        <br>
        <h3 class="text-center">Mitglied in diesen Gruppen</h3>

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

        <!-- loop over all groups -->
        <div v-for="(group, index) in this.groups.groupTmp" class="card my-3 mx-auto" style="max-width: 540px;" @click="selectGroup(index)">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto d-none d-md-block">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/user.svg" class="card-img p-3" alt="USER-LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">{{group.groupName}}</h5>
                <p class="card-text">
                  {{group.groupName}}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>`
  }
)
