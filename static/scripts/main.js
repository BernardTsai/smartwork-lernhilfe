//------------------------------------------------------------------------------

var data = `
---
model:         "smartwork-lernhilfe"
version:       "0.0.0"
mode:          "login"
email:         "bernard@tsai.eu"
password:      "test"
validated:     ""
materials:     {}
profession:    -1
qualification: -1
question:      -1
questionnaire: {}
quiz:
  profession:    -1
  qualification: -1
  date:          ""
  length:        -1
  question:      -1
  # questions: list of {options: ['string'] answers: ['string'], status: ""}
  questions:     []
  status:        ""
  mode:          ""
`

// load data framework
var model = jsyaml.safeLoad(data);

// load training course information
model.materials = loadData( "GET", "/overview")

//------------------------------------------------------------------------------

var app

function main() {
  // console.clear()

  app = new Vue({
    el:   '#app',
    data: {model: model},
    template: `<app v-bind:model="model"></app>`
  })
}

window.onload = main;

//------------------------------------------------------------------------------
