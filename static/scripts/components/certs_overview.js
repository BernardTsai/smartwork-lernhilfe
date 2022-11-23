Vue.component( 'certs_overview',
  {
    props:    ['model'],
    methods: {
      select: function(profession) {
        model.profession = profession

        model.mode = 'certs_details'
      },

      openFinalCert: function(profession) {
        for (var i = 0; i < this.model.certificates.length; i++) {
          if (this.model.certificates[i].filename == "final-certificate-" + profession) {
            model.certificate = i;
          }
        }
        // this could possibly lead to problems if Cert isn't loaded fast enough..
        loadCert();
        model.mode = 'certificate'
      },

      // get percentage of learning state
      getPercentage: function(profession) {
        var total = this.model.materials.professions[profession].qualifications.length;
        var counter = 0;
        for (var i = 0; i < this.model.certificates.length; i++) {
          if (this.model.certificates[i].filename.includes('certificate-' + profession)) counter++;
        }
	var percent = (counter/total)*100
        // if percent == 100% and final cert doesn't exist yet, create it (if final cert exists, percent is > 100 because there is one cert more than there're qualifications
        if (percent == 100) {
          var request = new XMLHttpRequest();

          // callback function to process the results
          function saveCertificateCB() {
            if (this.readyState == 4) {
              // check status
              if (this.status != 200) {
                return
              }
            }
          }

          date = new Date()
          var finalCert = {
            profession:    profession,
            qualification: -1,
            date:          date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear()
          }

          // issue request to server backend
          var params  = JSON.stringify( { email: model.email,  certs: finalCert } )

          request.onreadystatechange = saveCertificateCB
          request.open('POST', '/certificate', true);  // asynchronous request
          request.setRequestHeader('Content-type', 'application/json');
          request.send(params);
        }

        // correct percentage if necessary
        if (percent > 100) percent = ((counter-1)/total)*100

        return Math.round((percent + Number.EPSILON) * 100) / 100
      },

      finalCertAvailable: function(profession) {
        return this.getPercentage(profession) < 100
      },

      finalCertBtnTitle: function(profession) {
        let title = "Finales Zertifikat noch nicht vorhanden!";
        if (!this.finalCertAvailable(profession)) title = "Finales Zertifikat anzeigen";
        return title;
      }
    },
    beforeMount(){
      loadCerts();
      getProfessions();
    },
    computed: {
      details: function() {
        return this.model.materials.professions
      }
    },
    template: `
      <div id="certificates" class="container">

        <div class="row mt-5 justify-content-center">

          <div v-for="(profession, index) in model.certs_p" class="card mx-1 mt-1 border-dark" style="width: 14rem;" @click="select(this.model.certs_p[index])">
            <img class="card-img-top" :src="'../../images/' + details[profession].image" alt="details[profession].profession">
            <div class="card-body">
              <h5 class="card-title">{{this.model.materials.professions[this.model.certs_p[index]].profession}}</h5>
              <p class="card-text">Fortschritt: {{getPercentage(this.model.certs_p[index])}}%</p>
              <!-- maybe look for filename-part ->final-certificate<- and open? -->
              <button type="button" class="btn btn-primary" @click.stop="openFinalCert(profession)" :title="finalCertBtnTitle(this.model.certs_p[index])" :disabled="finalCertAvailable(this.model.certs_p[index])">Finales Zertifikat</button>
            </div>
          </div>

        </div>

      </div>`
  }
)
