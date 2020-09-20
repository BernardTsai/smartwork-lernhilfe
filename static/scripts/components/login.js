Vue.component( 'login',
  {
    props:    ['model'],
    methods: {
      login: function() {
        var request = new XMLHttpRequest();

        // callback function to process the results
        function loginCB() {
          if (this.readyState == 4) {
            // check status
            if (this.status != 200) {
              return
            }

            result = jsyaml.safeLoad(request.responseText)

            model.validated = result.validated

            if (model.validated == 'yes') {
              model.mode = 'home'
              model.type = result.type
            }
          }
        }

        // issue request to server backend
        var params  = '{"email": "' + model.email + '", "password": "' + model.password + '"}'

        request.onreadystatechange = loginCB
        request.open('POST', '/login', true);  // asynchronous request
        request.setRequestHeader('Content-type', 'application/json');
        request.send(params);
      }
    },
    mounted() {
      var form = document.getElementById("formContent");

      // Execute a function when the user releases a key on the keyboard
      form.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger the button element with a click
          document.getElementById("submitBtn").click();
        }
      });
    },
    template: `
      <div id="login" class="wrapper">
        <div id="formContent">
          <a class="navbar-brand">
            <img src="images/logo.png" width="60" height="60" alt="">
            <span class="btn btn-lg">smart<span class="text-danger">work</span></span>
          </a>
          <!-- Login Form -->
          <input type="text" id="email"    name="email"    v-model="model.email"    placeholder="E-Mail">
          <input type="password" id="password" name="password" v-model="model.password" placeholder="Passwort">
          <button type="button" id="submitBtn" class="btn btn-info" @click="login">Anmelden</button>

          <!-- Remind Passowrd -->
          <div id="formFooter">
            <small v-if="model.validated == ''">Zugang zu der smart<span class="text-danger">work</span> Lernhilfe<br/>Geben Sie bitte Ihre E-Mail und Passwort ein.</small>
            <small v-if="model.validated == 'no'"><span class="text-danger">Anmeldung ist leider fehlgeschlagen</span><br/>Wenden Sie sich bitte an smart<span class="text-danger">work</span>.</small>
          </div>

        </div>
      </div>`
  }
)
