Vue.component( 'settings',
  {
    props:    ['model'],
    methods: {
    },
    beforeMount() {
      if (model.submode[0] == '!') this.model.submode = this.model.submode.split("!")[1];
      else this.model.submode="settings-dashboard";
    },
    template: `
      <div id="settings" class="container">

        <div id="settingsContent">

          <settings-dashboard       v-bind:model="model" v-if="model.submode == 'settings-dashboard'"       ></settings-dashboard>
          <settings-password        v-bind:model="model" v-if="model.submode == 'settings-password'"        ></settings-password>
          <settings-instructorarea  v-bind:model="model" v-if="model.submode == 'settings-instructorarea'"  ></settings-instructorarea>
          <settings-usercontrol     v-bind:model="model" v-if="model.submode == 'settings-usercontrol'"     ></settings-usercontrol>
          <settings-userstatus      v-bind:model="model" v-if="model.submode == 'settings-userstatus'"      ></settings-userstatus>
          <settings-groups          v-bind:model="model" v-if="model.submode == 'settings-groups'"          ></settings-groups>
          <settings-editquiz        v-bind:model="model" v-if="model.submode == 'settings-editquiz'"        ></settings-editquiz>
          <settings-logs            v-bind:model="model" v-if="model.submode == 'settings-logs'"            ></settings-logs>

        </div>


      </div>`
  }
)
