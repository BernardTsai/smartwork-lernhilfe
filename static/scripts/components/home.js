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

        <!-- loop over all groups -->
        <div v-for="(group, index) in this.groups.groupTmp" class="card my-3 mx-auto" style="max-width: 540px;" @click="selectGroup(index)">
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
