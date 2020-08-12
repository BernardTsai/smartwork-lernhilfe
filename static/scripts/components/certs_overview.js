// TODO: If the user has 100% show the final certificate if he clicks on it and make it possible to view the individual certificates
// TODO: If the user has less than 100% show all awarded certificates for the profession if he clicks on it
Vue.component( 'certs_overview',
  {
    props:    ['model'],
    methods: {
      select: function(profession) {
        model.profession = profession

        model.mode = 'certs_details'
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

        //correct percentage if necessary
        if (percent > 100) percent = ((counter-1)/total)*100

        return Math.round((percent + Number.EPSILON) * 100) / 100
      }
    },
    beforeMount(){
      // TODO: check if this.model.certificates is already populated and skip if it is
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

        <!-- loop over all professions -->
        <div v-for="(profession, index) in model.certs_p" class="card my-3 mx-auto" style="max-width: 540px;" @click="select(this.model.certs_p[index])">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img :src="'../../images/' + details[profession].image" class="card-img p-1" :alt="details[profession].profession">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">{{this.model.materials.professions[this.model.certs_p[index]].profession}}</h5>
                <p class="card-text">
                  Fortschritt: {{getPercentage(this.model.certs_p[index])}}%
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>`
  }
)
