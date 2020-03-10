Vue.component( 'home',
  {
    props:    ['model'],
    methods: {

    },
    template: `
      <div id="home" class="container">

        <div class="card my-3 mx-auto" style="max-width: 540px;" @click="model.mode = 'professions'">
          <div class="row no-gutters">
            <div class="col-md-4 my-auto">
              <img src="../../images/qualifications.png" class="card-img" alt="Lernfelder">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">Lernfelder</h5>
                <p class="card-text">
                  Hier wählen Sie das Lernfeld aus für welches Sie sich interessieren.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="card my-3 mx-auto" style="max-width: 540px;" @click="model.mode = 'login'">
          <div class="row no-gutters">
            <div class="col-md-4 my-auto">
              <img src="../../images/certificate.png" class="card-img" alt="Zertifikate">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">Zertifikate</h5>
                <p class="card-text">
                  Hier finden Sie die von Ihnen bereits erworbenen Zertifikate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>`
  }
)
