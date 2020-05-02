Vue.component( 'certificates',
  {
    props:    ['model'],
    methods: {
      select: function(index) {
        model.certificate.index = index

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
            certTmp = certTmp.replace(/- /g, '"\n- certificate: "Certificate"\n  filename: "')
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
        request.open('POST', '/loadcertificate', true);  // asynchronous request
        request.setRequestHeader('Content-type', 'application/json');
        request.send(params);
      }
    },
    beforeMount(){
      this.loadCerts()
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
                <h5 class="card-title">{{certificate.certificate}}</h5>
                <p class="card-text">
                  {{certificate.filename}}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>`
  }
)
