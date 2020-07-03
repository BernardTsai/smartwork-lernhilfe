Vue.component( 'settings',
  {
    props:    ['model'],
    methods: {
//      openNav: function() {
//        document.getElementById("Sidebar").style.width = "250px";
//        document.getElementById("settingsContent").style.marginLeft = "250px";
//      },
//      closeNav: function() {
//        document.getElementById("Sidebar").style.width = "0";
//        document.getElementById("settingsContent").style.marginLeft= "0";
//      }
    },
    beforeMount() {
      this.model.submode="settings-dashboard";
    },
    template: `
      <div id="settings" class="container">


        <!-- <div id="Sidebar" class="d-none d-md-block bg-dark sidebar">
          <a href="javascript:void(0)" class="closebtn" @click="closeNav()">x</a> -->
          <!-- commented out because there are problems on mobile devices -->
          <!--
          <ul class="nav flex-column">
            <li class="nav-item">
              <a @click="model.submode='settings-dashboard'">
                <span class="fa fa-home"></span>
                Dashboard
              </a>
            </li>
            <li class="nav-item">
              <a @click="model.submode='settings-password'">
                <span class="fa fa-lock"></span>
                Password
              </a>
            </li>
          </ul>
        </div>
        -->

        <div id="settingsContent">
          <!-- <button class="openbtn" @click="openNav()">☰ </button>   -->

          <settings-dashboard       v-bind:model="model" v-if="model.submode == 'settings-dashboard'"       ></settings-dashboard>
          <settings-password        v-bind:model="model" v-if="model.submode == 'settings-password'"        ></settings-password>
          <settings-instructorarea  v-bind:model="model" v-if="model.submode == 'settings-instructorarea'"  ></settings-instructorarea>
          <settings-usercontrol     v-bind:model="model" v-if="model.submode == 'settings-usercontrol'"     ></settings-usercontrol>
          <settings-userstatus      v-bind:model="model" v-if="model.submode == 'settings-userstatus'"      ></settings-userstatus>

        </div>


      </div>`
  }
)
