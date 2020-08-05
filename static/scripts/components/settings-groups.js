Vue.component( 'settings-groups',
  {
    props:    ['model'],
    methods: {
      // request list of all registered users from backend
      getUsers: function() {
//        needed for authentication (not working yet)
//        var params  = JSON.stringify( { email: model.email, password: model.password } )
        this.users.user = loadData('POST', '/getallusers'/*, params*/);
      },

      // request list of all groups from backend
      getGroups: function() {
//        needed for authentication (not working yet)
//        var params  = JSON.stringify( { email: model.email, password: model.password } )
        this.groups.group = loadData('POST', '/getallgroups'/*, params*/);
        for (let group of this.groups.group) {
          group.members = jsyaml.safeLoad(group.members);
        }
//        console.log(this.groups);
      },

      selectGroup: function(index) {
        this.groups.select = index;
        // because of error when trying to access array from modal
        this.groups.groupTmp = JSON.parse(JSON.stringify(this.groups.group[index]))
        this.groups.groupName = this.groups.group[index].groupName
        $("#groupOptions").modal();
//        console.log(this.groups)
      },

      createGroup: async function() {
        this.groups.groupName = $("#inputGroupName").val();
        if (this.groups.groupName == '') {
          alert("Gruppenname wurde nicht eingegeben");
          return;
        }

        var request = new XMLHttpRequest();
        var self = this;

        // callback function to process the results
        function createGroupCB() {
          if (this.readyState == 4) {
            // check status
            if (this.status != 200) {
              return
            }
            console.log(request.responseText)
            result = jsyaml.safeLoad(request.responseText)

            if (result.msg == "success") {
              // reload Groups
              self.getGroups();
            }
            else {
              alert("Erstellen fehlgeschlagen!");
            }
            return
          }
        }

        var params  = JSON.stringify( {groupName: this.groups.groupName, members: this.groups.user, email: this.model.email, password: this.model.password} )
        //console.log(params)
        request.onreadystatechange = createGroupCB
        request.open('POST', '/creategroup', true);  // asynchronous request
        request.setRequestHeader('Content-type', 'application/json');
        request.send(params);
      },

      // deletes user account with all data
      rmGroup: async function() {
        var request = new XMLHttpRequest();
        var self = this;

        // callback function to process the results
        function rmGroupCB() {
          if (this.readyState == 4) {
            // check status
            if (this.status != 200) {
              return
            }
            console.log(request.responseText)
            result = jsyaml.safeLoad(request.responseText)

            if (result.msg == "success") {
              // reload Groups
              self.getGroups();
            }
            else {
              alert("failed!");
            }
            return
          }
        }

        var params  = JSON.stringify( {emailReq: this.model.email, passwordReq: this.model.password, groupName: this.groups.groupTmp.groupName} )
        //console.log(params)
        request.onreadystatechange = rmGroupCB
        request.open('POST', '/deletegroup', true);  // asynchronous request
        request.setRequestHeader('Content-type', 'application/json');
        request.send(params);
      },

      groupEditMarkMembers: function() {
        this.groups.user = JSON.parse(JSON.stringify(this.groups.groupTmp.members))
        this.groups.groupName = this.groups.groupTmp.groupName
        var found = false
        for (let i in this.users.user) {
          var selectUser = document.getElementById('selUser_'+i);
          for (let j of this.groups.user) {
            if (this.users.user[i].email == j.email) {
              found = true
            }
          }
          if (found) {
            if (!selectUser.classList.contains("bg-primary")) {
              selectUser.classList.add("bg-primary");
            }
          }
          else if (selectUser.classList.contains("bg-primary")) {
            selectUser.classList.remove("bg-primary");
          }
          found = false
        }
//        console.log(this.groups)
      },

      groupSaveChanges: async function() {
        // not very reliable so change to specialized Function
        await this.rmGroup()

        $("#inputGroupName").val(this.groups.groupName)
        await this.createGroup()

        await this.initialState()
      },

//      editGroupOLD: function(action) {
//        var request = new XMLHttpRequest();
//        var self = this;

        // callback function to process the results
//        function editGroupCB() {
//          if (this.readyState == 4) {
            // check status
//            if (this.status != 200) {
//              return
//            }
//            console.log(request.responseText)
//            result = jsyaml.safeLoad(request.responseText)

//            if (result.success == "yes") {
              // reload Groups
//              self.getGroups();
//              self.groups.groupTmp = self.groups.group[self.groups.select]
//            }
//            else {
//              alert("failed!");
//            }
//          }
//        }

//        var params  = JSON.stringify( {email: this.model.email, password: this.model.password, groupName: this.groups.groupTmp.groupName, action: action, data: this.groups.user} )
//        request.onreadystatechange = editGroupCB
//        request.open('POST', '/editgroup', true);  // asynchronous request
//        request.setRequestHeader('Content-type', 'application/json');
//        request.send(params);
//      },

//      usersShow: function() {
//        if (this.groups.select > -1) {
//          console.log("sollte anderes ergebnis sein!");
//          var tmp = [];
//          var check = false;

//          for (let user of this.users.user) {
//            for (let compareUser of this.groups.groupTmp.members) {
//              if (user.email == compareUser.email) {
//                check = true;
//              }
//            }
//            if (!check) {
//              tmp.push(user);
//            }
//            check = false;
//          }
//          return tmp;
//        }
//        else {
          //console.log(this.users.user);
//          return this.users.user;
//        }
//      },

      // adds or removes user to/from array to later add users to a group
      selectUser: function(index) {
        this.users.select = index;
        // because of error when trying to access array from modal
        this.users.emailSel = this.users.user[index].email;

        // visible effect of selection
        var selUser = document.getElementById('selUser_'+index);
        selUser.classList.toggle("bg-primary");

        var arrIndex = -1
        var found = false
        for (let i in this.groups.user) {
          if (this.groups.user[i].email == this.users.user[index].email) {
            found = true
            arrIndex = i
          }
        }
        if (found) {
          if (arrIndex > -1) {
            this.groups.user.splice(arrIndex, 1);
          }
        }
        else {
          this.groups.user.push(this.users.user[index]);
        }

        // fill array with selected users
//        if (this.groups.user.includes(this.users.user[index])) {
//          const arrIndex = this.groups.user.indexOf(this.users.user[index]);
//          if (arrIndex > -1) {
//            this.groups.user.splice(arrIndex, 1);
//          }
//          console.log(this.groups.user);
//        }
//        else {
//          this.groups.user.push(this.users.user[index]);
//          console.log(this.groups.user);
//        }
      },

      initialState: async function() {
        this.groups.group = {}
        this.groups.groupTmp = {}
        this.groups.select = -1
        this.groups.user = []
        for (let i in this.users.user) {
          var selectUser = document.getElementById('selUser_'+i);
          if (selectUser.classList.contains("bg-primary")) {
            selectUser.classList.remove("bg-primary");
          }
        }
        this.groups.groupName = ""
        this.getGroups()
      }
    },
    data() {
      return {
        form: {
          email:    '',
          password: '',
          type:     ''
        },
        users: {
          user: {},
          select: -1,
          emailSel: ''
        },
        groups: {
          group: {},
          groupTmp: {},
          select: -1,
          user: [],
          groupName: ''
        }
      }
    },
    beforeMount() {
      this.getUsers();
      this.getGroups();
    },
//    mounted() {
//      self = this;
//      $("#groupAddModalCenter").on('show.bs.modal', function () {
        // before group creation modal is shown reset groupselection
        // otherwise not all users are displayed in userselect
//        self.groups.groupTmp = [];
//        self.groups.select = -1;
//      });
//      $("#userSelect").on('show.bs.modal', function () {
        // for test purposes
//        console.log(self.usersShow());
//        self.groups.groupTmp = self.usersShow();
//        console.log(self.groups);
//      });
//    },
    computed: {
      user: function() {
        return this.users.emailSel
      }
    },
    template: `
      <div id="settings-groups" class="container">

        <h3 class="text-center">Gruppenverwaltung</h3>

        <!-- trigger modal group creation-->
        <div class="card my-3 mx-auto" style="max-width: 540px;" data-toggle="modal" data-target="#groupAddModalCenter" @click="initialState()">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/user-plus.svg" class="card-img p-3" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Neue Gruppe erstellen</h5>
                <p class="card-text">
                  Erstellen einer neuen Gruppe und mit Zuweisung einer Lehrkraft
                </p>
              </div>
            </div>
          </div>
        </div>

        <br>
        <hr style="max-width: 540px;">
        <br>
        <h3 class="text-center">Vorhandene Gruppen</h3>

        <!-- Modal for group creation -->
        <div class="modal fade" id="groupAddModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Neue Gruppe erstellen</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">

                <div class="form-group">
                  <label for="inputGroupName">Gruppenname</label>
                  <input id="inputGroupName" type="text" class="form-control" placeholder="Gruppe_1">
                  <small id="groupNameHelp" class="form-text text-muted">Geben Sie einen Namen f&uumlr die neue Gruppe ein.</small>
                </div>

                <div class="form-group">
                  <label for="addToGroup">Nutzer hinzuf&uumlgen</label>
                  <button id="addToGroup" type="button" class="btn btn-primary" data-toggle="modal" data-target="#userSelect">Nutzer ausw&aumlhlen</button>
                  <small id="addToGroupHelp" class="form-text text-muted">W&aumlhlen Sie aus der List die Nutzer aus, die der Gruppe hinzugef&uumlgt werden sollen.</small>
                </div>

                <!--
                <div class="form-group">
                  <label for="userType">Nutzerart</label>
                  <select class="form-control" id="userType">
                    <option>Sch&uumller/Azubi</option>
                    <option>Ausbilder</option>
                    <option>Administrator</option>
                  </select>
                  <small id="usertypeHelp" class="form-text text-muted">W&aumlhlen Sie aus, welchem Typ der neue Nutzer zugeordnet werden soll.</small>
                </div>
                -->

              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Abbrechen</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal" @click="createGroup()">Best&aumltigen</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal for group options -->
        <div class="modal fade" id="groupOptions" tabindex="-1" role="dialog" aria-labelledby="groupOptionsModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="groupOptionsLongTitle">Optionen f&uumlr {{this.groups.groupTmp.groupName}}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="container-fluid">
                  <h3>Mitglieder der Gruppe</h3>

                  <!-- loop over all members -->
                  <div v-for="(member, index) in this.groups.groupTmp.members" :class="{
                                                                                 'card': true,
                                                                                 'my-3': true,
                                                                                 'mx-auto': true,
                                                                                 'border-info': member.type == 'Ausbilder',
                                                                                 'border-danger': member.type == 'Administrator',
                                                                                 'border-success': member.type == 'Schüler/Azubi'
                                                                               }" style="max-width: 540px; border: 2px solid;" :id="'selUserG_'+index">
                    <div class="row no-gutters">
                      <div class="col-md-2 my-auto">
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

                  <hr>

                  <label for="pwReset"><u>Gruppenmitglieder bearbeiten:</u></label>
                  <div id="pwReset" class="row">
                    <div class="col-md-12">
                      <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#userSelect"  @click="groupEditMarkMembers()">Gruppenmitglieder ausw&aumlhlen</button>
                    </div>
                  </div>

                  <hr>

                  <label for="deleteAcc"><u>Gruppe l&oumlschen:</u></label>
                  <div id="deleteAcc" class="row">
                    <div class="col-md-10">
                      <button type="button" class="btn btn-primary" data-dismiss="modal" data-toggle="modal" data-target="#confirm-delete">L&oumlschen</button>
                      <small class="form-text text-muted">L&oumlscht die gesamte Gruppe samt aller zugeh&oumlrigen Daten.</small>
                    </div>
                  </div>

                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Abbrechen</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal" @click="groupSaveChanges()">Best&aumltigen</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal for user select -->
        <div class="modal fade" id="userSelect" tabindex="-1" role="dialog" aria-labelledby="userSelectModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Nutzer ausw&aumlhlen</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <h3>Hinzuzuf&uumlgenden Nutzer ausw&aumlhlen</h3>


                <!-- loop over all users -->
                <div v-for="(user, index) in this.users.user" :class="{
                                                                'card': true,
                                                                'my-3': true,
                                                                'mx-auto': true,
                                                                'border-info': user.type == 'Ausbilder',
                                                                'border-danger': user.type == 'Administrator',
                                                                'border-success': user.type == 'Schüler/Azubi'
                                                              }" style="max-width: 540px; border: 2px solid;" @click="selectUser(index)" :id="'selUser_'+index">
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


              </div>
              <div class="modal-footer">
               <!--<button type="button" class="btn btn-secondary" data-dismiss="modal">Abbrechen</button>-->
                <button type="button" class="btn btn-primary" data-dismiss="modal">Auswahl best&aumltigen</button>
              </div>
            </div>
          </div>
        </div>

        <!-- modal for delete confirmation -->
        <div class="modal fade" id="confirm-delete" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="modalLongTitle">L&oumlschen von {{this.groups.groupTmp.groupName}} best&aumltigen</h5>
                <button type="button" class="close" data-dismiss="modal" data-toggle="modal" data-target="#groupOptions" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">

                <div class="px-3 text-danger">
                  <p class="font-weight-bold">ACHTUNG:</p>
                  <p> Der gesamte Gruppe wird vollst&aumlndig gel&oumlscht. Diese Aktion kann nicht r&uumlckg&aumlngig gemacht werden!</p>
                </div>

              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal" data-toggle="modal" data-target="#groupOptions">Abbrechen</button>
                <a class="btn btn-danger btn-ok" data-dismiss="modal" @click="rmGroup()">L&oumlschen</a>
              </div>
            </div>
          </div>
        </div>

        <!-- loop over all groups -->
        <div v-for="(group, index) in this.groups.group" class="card my-3 mx-auto" style="max-width: 540px;" @click="selectGroup(index)">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
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
