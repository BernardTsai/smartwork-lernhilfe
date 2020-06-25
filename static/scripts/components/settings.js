Vue.component( 'settings',
  {
    props:    ['model'],
    methods: {
      //select: function(index) {
        //model.profession = index

        //model.mode = 'profession'
      //},
      openNav: function() {
        document.getElementById("Sidebar").style.width = "250px";
        document.getElementById("settingsContent").style.marginLeft = "250px";
      },
      closeNav: function() {
        document.getElementById("Sidebar").style.width = "0";
        document.getElementById("settingsContent").style.marginLeft= "0";
      }
    },
    beforeMount() {
      this.model.submode="settings-dashboard";
    },
    template: `
      <div id="settings" class="container">


        <div id="Sidebar" class="d-none d-md-block bg-dark sidebar">
          <a href="javascript:void(0)" class="closebtn" @click="closeNav()">x</a>
          <!-- some parts are commented out because they may cause some problems on mobile devices -->
          <!-- testing requiered!! -->
          <!-- <ul class="nav flex-column">
            <li class="nav-item"> -->
              <a @click="model.submode='settings-dashboard'">
                <span class="fa fa-home"></span>
                Dashboard
              </a>
            <!-- </li>
            <li class="nav-item"> -->
              <a @click="model.submode='settings-password'">
                <span class="fa fa-lock"></span>
                Password
              </a>
            <!-- </li>
          </ul> -->
        </div>

        <div id="settingsContent">
          <button class="openbtn" @click="openNav()">☰ </button>  

          <settings-dashboard       v-bind:model="model" v-if="model.submode == 'settings-dashboard'"       ></settings-dashboard>
          <settings-password        v-bind:model="model" v-if="model.submode == 'settings-password'"        ></settings-password>
          <settings-instructorarea  v-bind:model="model" v-if="model.submode == 'settings-instructorarea'"  ></settings-instructorarea>
          <settings-usercontrol     v-bind:model="model" v-if="model.submode == 'settings-usercontrol'"     ></settings-usercontrol>

        </div>


      </div>`
  }
)
