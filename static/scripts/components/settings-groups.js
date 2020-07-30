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
        this.groups.groupTmp = this.groups.group[index]
        $("#groupOptions").modal();
      },

      createGroup: function() {
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
            result = jsyaml.safeLoad(request.responseText)

            if (result.msg == "success") {
              // reload Groups
              self.getGroups();
            }
            else {
              alert("L&oumlschen fehlgeschlagen!");
            }
          }
        }

        var params  = JSON.stringify( {groupName: this.groups.groupName, members: this.groups.user, email: this.model.email, password: this.model.password} )
        request.onreadystatechange = createGroupCB
        request.open('POST', '/creategroup', true);  // asynchronous request
        request.setRequestHeader('Content-type', 'application/json');
        request.send(params);
      },

      // deletes user account with all data
      rmGroup: function() {
        var request = new XMLHttpRequest();
        var self = this;

        // callback function to process the results
        function rmGroupCB() {
          if (this.readyState == 4) {
            // check status
            if (this.status != 200) {
              return
            }
//            console.log(request.responseText)
            result = jsyaml.safeLoad(request.responseText)

            if (result.msg == "success") {
              // reload Groups
              self.getGroups();
            }
            else {
              alert("failed!");
            }
          }
        }

        var params  = JSON.stringify( {emailReq: this.model.email, passwordReq: this.model.password, groupName: this.groups.groupTmp.groupName} )
        request.onreadystatechange = rmGroupCB
        request.open('POST', '/deletegroup', true);  // asynchronous request
        request.setRequestHeader('Content-type', 'application/json');
        request.send(params);
      },

      // adds or removes user to/from array to later add users to a group
      selectUser: function(index) {
        this.users.select = index;
        // because of error when trying to access array from modal
        this.users.emailSel = this.users.user[index].email;

        // visible effect of selection
        var selUser = document.getElementById('selUser_'+index);
        selUser.classList.toggle("bg-primary");

        // fill array with selected users
        if (this.groups.user.includes(this.users.user[index])) {
          const arrIndex = this.groups.user.indexOf(this.users.user[index]);
          if (arrIndex > -1) {
            this.groups.user.splice(arrIndex, 1);
          }
//          console.log(this.groups.user);
        }
        else {
          this.groups.user.push(this.users.user[index]);
//          console.log(this.groups.user);
        }
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
    computed: {
      user: function() {
        return this.users.emailSel
      }
    },
    template: `
      <div id="settings-groups" class="container">

        <h3 class="text-center">Gruppenverwaltung</h3>

        <!-- trigger modal group creation-->
        <div class="card my-3 mx-auto" style="max-width: 540px;" data-toggle="modal" data-target="#groupAddModalCenter">
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
                <button type="button" class="btn btn-primary" data-dismiss="modal">Auswahl abschlie&szligen</button>
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


                  <label for="pwReset"><u>Passwort zur&uumlcksetzen:</u></label>
                  <div id="pwReset" class="row">
                    <div class="col-md-4">
                      <button type="button" class="btn btn-primary" @click="pwReset()" disabled>Reset</button>
                    </div>
                    <div class="col-md-8 ml-auto">
                      <input id="pwResetNewPw" type="text" class="form-control" value="" disabled>
                      <small id="accountnameHelp" class="form-text text-muted">Dies ist das neue Passwort.</small>
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
