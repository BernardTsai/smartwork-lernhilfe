// TODO: If the user has 100% show the final certificate if he clicks on it and make it possible to view the individual certificates
// TODO: If the user has less than 100% show all awarded certificates for the profession if he clicks on it
Vue.component( 'certs_overview',
  {
    props:    ['model'],
    methods: {
      select: function(profession) {
        model.tmp = profession

        model.mode = 'certs_details'
      },
      // get all professions for which a certificate exists
      getProfessions: function() {
        var professions = [];
        var professionTmp;
        for (var i = 0; i < this.model.certificates.length; i++) {
          if (this.model.certificates[i].filename.includes('certificate-')) {
            professionTmp = this.model.certificates[i].filename[12];
            // check if professions to avoid dublicates
            var found = false;
            for (var j = 0; j < professions.length; j++) {
              if (professions[j] == professionTmp) found = true;
            }
            if (!found) professions.push(professionTmp);
          }
        }
//        console.log(professions);
        this.model.tmp = professions;
      },
      getPercentage: function(profession) {
        var total = this.model.materials.professions[profession].qualifications.length;
        var counter = 0;
        for (var i = 0; i < this.model.certificates.length; i++) {
          if (this.model.certificates[i].filename.includes('certificate-' + profession)) counter++;
        }
	var percent = (counter/total)*100
        return Math.round((percent + Number.EPSILON) * 100) / 100
      }
    },
    beforeMount(){
      // TODO: check if this.model.certificates is already populated and skip if it is
      loadCerts();
      this.getProfessions();
    },
    computed: {
      details: function() {
        return this.model.materials.professions
      }
    },
    template: `
      <div id="certificates" class="container">

        <!-- loop over all professions -->
        <div v-for="(profession, index) in model.tmp" class="card my-3 mx-auto" style="max-width: 540px;" @click="select(this.model.tmp[index])">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="../../images/logo.png" class="card-img p-1" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">{{this.model.materials.professions[this.model.tmp[index]].profession}}</h5>
                <p class="card-text">
                  Fortschritt: {{getPercentage(this.model.tmp[index])}}%
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>`
  }
)
