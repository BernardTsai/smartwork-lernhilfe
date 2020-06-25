Vue.component( 'settings-usercontrol',
  {
    props:    ['model'],
    methods: {
      //select: function(index) {
        //model.profession = index

        //model.mode = 'profession'
      //}
    },
    template: `
      <div id="settings-usercontrol" class="container">

        <h3 class="text-center">Benutzerverwaltung</h3>

        <!-- Button trigger modal -->
        <div class="card my-3 mx-auto" style="max-width: 540px;" data-toggle="modal" data-target="#exampleModalCenter">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="images/logo.png" class="card-img p-1" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Benutzer hinzuf&uumlgen</h5>
                <p class="card-text">
                  Erstelle ein neuen Account f&uumlr einen Benutzer
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Modal title</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <h5>Popover in a modal</h5>
                <p>This <a href="#" role="button" class="btn btn-secondary popover-test" title="Popover title" data-content="Popover body content is set in this attribute.">button</a> triggers a popover on click.</p>
                <hr>
                <h5>Tooltips in a modal</h5>
                <p><a href="#" class="tooltip-test" title="Tooltip">This link</a> and <a href="#" class="tooltip-test" title="Tooltip">that link</a> have tooltips on hover.</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary">Save changes</button>
              </div>
            </div>
          </div>
        </div>




        <!-- HIER VLLT ALLE NUTZER ANZEIGEN UND BEIM ANKLCKEN EINE NUTZERS DIE OPTIONEN FUER DIESEN ANZEIGEN. ZB. LOESCHEN, PW RESET ETC. -->
        <div class="card my-3 mx-auto" style="max-width: 540px;">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img src="images/logo.png" class="card-img p-1" alt="LOGO">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">Benutzer entfernen</h5>
                <p class="card-text">
                  L&oumlscht ein Benutzeraccount mit allen zugeh&oumlrigen Daten
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- loop over all professions
        <div v-for="(profession, index) in model.materials.professions" class="card my-3 mx-auto" style="max-width: 540px;" @click="select(index)">
          <div class="row no-gutters">
            <div class="col-md-2 my-auto">
              <img :src="'../../images/' + profession.image" class="card-img p-1" :alt="profession.profession">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">{{profession.title}}</h5>
                <p class="card-text">
                  {{profession.description}}
                </p>
              </div>
            </div>
          </div>
        </div>
        -->

      </div>`
  }
)
