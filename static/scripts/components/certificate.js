Vue.component( 'certificate',
  {
    props:    ['model'],
    methods: {
//      select: function(index) {
//        model.qualification = index
//        model.question      = -1
//        model.mode          = "questionnaire"
//      },

      printCert: function() {
        alert("Ohne Funktion")
//        var printContents = document.getElementById('certificate').innerHTML;
//        var originalContents = document.body.innerHTML;

//        document.body.innerHTML = printContents;

//        window.print();

//        document.body.innerHTML = originalContents;
      }
    },
    beforeMount(){
      if (this.model.certificates[this.model.certificate].certificate.qualification > -1) {
        var qualification = this.model.certificates[this.model.certificate].certificate.qualification
        this.model.questionnaire = loadData( "GET", "/questionnaire/" + this.model.profession + "/" + qualification)
      }
      // load everything a bit different for final cert to display qualifications insted of question titles
      else if (this.model.certificates[this.model.certificate].certificate.qualification == -1) {
        this.model.questionnaire = []
        var qualifications = this.model.materials.professions[this.model.certificates[this.model.certificate].certificate.profession].qualifications
        for (let i in qualifications) {
          var content = {
            title: ""
          }
          this.model.questionnaire.push(content)
          this.model.questionnaire[i].title = qualifications[i].qualification
        }
      }
    },
    mounted() {
      $('#certificate').on('contextmenu', function(e) {
        var top = e.pageY - 10;
        var left = e.pageX - 90;
        $("#context-menu").css({
          display: "block",
          top: top,
          left: left
        }).addClass("show");
        return false; //blocks default Webbrowser right click menu
      }).on("click", function() {
        $("#context-menu").removeClass("show").hide();
      });

      $("#context-menu a").on("click", function() {
        $(this).parent().removeClass("show").hide();
      });
    },
    computed: {
      certificate: function() {
        return this.model.certificates[this.model.certificate].certificate
      },

      details: function() {
        return this.model.materials.professions[this.model.certificates[this.model.certificate].certificate.profession]
      },

      certDate: function() {
        var certDateString = "";
        var date = new Date(this.certificate.date);

        certDateString += date.getDate() + '.' + (date.getMonth()+1) + '.' + date.getFullYear()

        return certDateString;
      }
    },
    template: `
      <div id="certificate" class="mt-3 shadow p-3 mb-5 mx-3 bg-white rounded">
        <div class="bg-light px-3 d-flex">
          <a class="navbar-brand" @click="home()">
            <img src="images/logo.png" width="30" height="30" alt="">
            smart<span class="text-danger">work</span>
          </a>
          <span class="ml-auto">{{certDate}}</span>
        </div>
        <div class="bg-light px-3">
          <p class="h1">Zertifikat</p>
          <p class="h3"><b>Berufsfeld:</b> {{details.profession}}</p>
          <p class="h3" v-if="this.model.certificates[this.model.certificate].certificate.qualification > -1">
            <b>Qualifikation:</b> {{details.qualifications[certificate.qualification].qualification}}
          </p>
          <p class="h3 text-success" v-if="this.model.certificates[this.model.certificate].certificate.qualification == -1">
            <b>Finales Zertifikat</b>
          </p>
        </div>

        <div v-for="(q, i) in model.questionnaire" class="px-3 py-2 d-flex">
          {{i+1}}. {{q.title}}
          <div v-if="this.model.certificates[this.model.certificate].certificate.qualification == -1" class="ml-auto">
            <span class="far fa-check-circle text-success"></span>
          </div>
          <div v-else-if="this.model.certificates[this.model.certificate].certificate.questions[i]" class="ml-auto" @click="console.log(i)">
            <span v-if="this.model.certificates[this.model.certificate].certificate.questions[i].success=='yes'" class="far fa-check-circle text-success"></span>
            <span v-if="this.model.certificates[this.model.certificate].certificate.questions[i].success!='yes'" class="far fa-times-circle text-danger"></span>
          </div>
        </div>

        <div class="px-3 text-success">
          {{certificate.email}} hat das Zertifikat am {{certDate}} erhalten!
        </div>

        <div class="dropdown-menu dropdown-menu-sm" id="context-menu">
          <a class="dropdown-item" href="#" @click="model.mode='home'">Zur Startseite</a>
          <a class="dropdown-item" href="#" @click="printCert()">Zertifikat drucken</a>
        </div>

      </div>`
  }
)
