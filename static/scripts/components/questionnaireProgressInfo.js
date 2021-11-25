const questionnaireProgressInfo = {
    props: ['data'],
    methods: {

    },
    computed: {

    },
    data() {
      return {
        id: null
      }
    },
    mounted() {
      this.id = this._uid

      // wait until element exists before doing anything with it
      var self = this;
      var element = "#" + this.id;
      var checkExist = setInterval(function() {
        if ($(element).length) {
          clearInterval(checkExist);
//          self.doSomething();
        }
      }, 100); // check every 100ms

    },
    template: /*html*/`
      <div :id="id" class="card bg-light px-2">
        <div style="text-align: left; justify-content: center;">
          <div style="display: flex; align-items: center;">
            <a class="mr-1">Frage</a><h3>{{data.index}}/{{data.count}}</h3>
          </div>
          <hr class="m-0">
          <p class="my-2">Erreichbare<br>Punkte: <b>{{data.points}}</b></p>
        </div>
      </div>
    `,
  }

export { questionnaireProgressInfo }
