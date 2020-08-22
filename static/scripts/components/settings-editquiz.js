Vue.component( 'settings-editquiz',
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
      }
    },
    beforeMount(){
      // TODO: check if this.model.certificates is already populated and skip if it is
//      loadCerts()
//      loadCert();
//      this.getCerts();
    },
    mounted(){
      // display selection in dropdown-menu
      $(".dropdown-menu").on('click', 'button', function(){
        $(".btn:first-child").text($(this).text());
        $(".btn:first-child").val($(this).text());
      });
    },
    computed: {
//      details: function() {
//        return this.model.materials.professions
//      }
    },
    template: `
      <div id="settings-editquiz" class="container">
        <h3 class="text-center">Quizverwaltung</h3>

        <!-- trigger modal quiz creation-->
        <div class="card my-3 mx-auto" style="max-width: 540px;" data-toggle="modal" data-target="#quizAddModal">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/user-plus.svg" class="card-img p-3" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Neues Quiz erstellen</h5>
                <p class="card-text">
                  Erstellen eines neuen Quiz mit Zuweisung zu einem Qualifikationsbaustein
                </p>
              </div>
            </div>
          </div>
        </div>

        <br>
        <hr style="max-width: 540px;">
        <br>
        <h3 class="text-center">Quiz bearbeiten</h3>

        <div class="dropdown text-center">
          <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Lernfeld ausw&aumlhlen
          </button>
          <small class="form-text text-muted">Ausw&aumlhlen des Lernfeldes um fortzufahren</small>
          <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
            <button class="dropdown-item" type="button" v-for="(profession, index) in this.model.materials.professions">{{profession.description}}</button>
          </div>
        </div>







      </div>`
  }
)
