// TODO: First show all professions in which the user has more than 0% progress and show the progress. E.g. Fortschritt: 67%
// TODO: If the user has 100% show the final certificate if he clicks on it and make it possible to view the individual certificates
// TODO: If the user has less than 100% show all awarded certificates for the profession if he clicks on it
Vue.component( 'certificates',
  {
    props:    ['model'],
    methods: {
      select: function(index) {
        model.certificate = index

        model.mode = 'certificate'
      },
      // get list of all certificates
      loadCerts: function() {
        var request = new XMLHttpRequest();

        // callback function to process the results
        function loadCertCB() {
          if (this.readyState == 4) {
            // check status
            if (this.status != 200) {
              return
            }
            // modify responseText to correctly populate model.certificates
            //TODO: catch exception if there are no certificates!
            var certTmp = request.responseText
            certTmp = certTmp.replace(/\n/g, "")
            certTmp = certTmp.replace(/- /g, '"\n- certificate: {}\n  filename: "')
            certTmp = certTmp.replace('"', '')
            certTmp += '"'
//            console.log(certTmp)
            model.certificates = jsyaml.safeLoad(certTmp)
//            console.log(request.responseText)
          }
        }

        // issue request to server backend
        var params  = JSON.stringify( { cert: '', email: model.email } )

        request.onreadystatechange = loadCertCB
        request.open('POST', '/loadcertificate', false);  // synchronous request
        request.setRequestHeader('Content-type', 'application/json');
        request.send(params);
      },
      // load all certificates
      loadCert: function() {
        var request = new XMLHttpRequest();
        for (var i = 0; i < this.model.certificates.length; i++) {
          var params  = JSON.stringify( { cert: this.model.certificates[i].filename, email: model.email } )
          this.model.certificates[i].certificate = loadData('POST', '/loadcertificate', params);
        }
      }
    },
    beforeMount(){
      // TODO: check if this.model.certificates is already populated and skip if it is
      this.loadCerts();
      this.loadCert();
    },
    computed: {
      details: function() {
        return this.model.materials.professions
      }
    },
    template: `
      <div id="certificates" class="container">

        <!-- loop over all professions -->
        <div v-for="(certificate, index) in model.certificates" class="card my-3 mx-auto" style="max-width: 540px;" @click="select(index)">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="../../images/logo.png" class="card-img p-1" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">{{details[this.model.certificates[index].certificate.profession].profession}}</h5>
                <p class="card-text">
                  {{details[this.model.certificates[index].certificate.profession].qualifications[this.model.certificates[index].certificate.qualification].qualification}}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>`
  }
)
