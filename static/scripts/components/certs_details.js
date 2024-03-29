Vue.component( 'certs_details',
  {
    props:    ['model'],
    methods: {
      select: function(index) {
        model.certificate = this.model.tmp[index]

        model.mode = 'certificate'
      },
      // collect all certificates for the selected profession
      getCerts: function() {
        var certs = [];
        for (var i = 0; i < this.model.certificates.length; i++) {
          if (this.model.certificates[i].certificate.profession == this.model.profession) certs.push(i);
        }
        this.model.tmp = certs;
      },
      certDate: function(ms) {
        var certDateString = "";
        var date = new Date(ms);

        certDateString += date.getDate() + '.' + (date.getMonth()+1) + '.' + date.getFullYear()

        return certDateString;
      }
    },
    beforeMount(){
      loadCerts()
      loadCert();
      this.getCerts();
    },
    computed: {
      details: function() {
        return this.model.materials.professions
      }
    },
    template: `
      <div id="certificates" class="container">
        <h3 class="text-center">{{this.model.materials.professions[this.model.profession].profession}}</h3>
        <!-- loop over all professions -->
        <div v-for="(certificate, index) in model.tmp" class="card my-3 mx-auto" style="max-width: 540px;" @click="select(index)">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img :src="'../../images/' + details[this.model.profession].image" class="card-img p-1" :alt="details[this.model.profession].profession">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title" v-if="this.model.certificates[this.model.tmp[index]].certificate.qualification > -1">
                  {{ details[this.model.certificates[this.model.tmp[index]].certificate.profession].
                     qualifications[this.model.certificates[this.model.tmp[index]].certificate.qualification].
                     qualification }}
                </h5>
                <h5 class="card-title text-success" v-if="this.model.certificates[this.model.tmp[index]].certificate.qualification == -1">
                  Finales Zertifikat
                </h5>
                <p class="card-text">
                  Erhalten am: {{ certDate(this.model.certificates[this.model.tmp[index]].certificate.date) }}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>`
  }
)
