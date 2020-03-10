const yaml    = require('js-yaml')
const express = require('express')
const parser  = require('body-parser')
const fs      = require('fs')
const app     = express()
const port    = 3000

//------------------------------------------------------------------------------

function writeResponse(res, response) {
  res.set({ 'content-type': 'application/x-yaml; charset=utf-8' })
  res.write(yaml.safeDump(response))
  res.end()
}

//------------------------------------------------------------------------------

function questionnaire(req, res) {
  profession    = req.params["profession"]
  qualification = req.params["qualification"]

  directory = './data/materials/profession-' + profession + "/qualification-" + qualification
  filename  = directory + '/questions.yaml'
  response  = {}

  console.log(filename)

  // read overview information
  fs.readFile(filename,
    // callback function that is called when reading file is done
    function(err, data) {
      if (err) {
        console.log(err)
      }

      if (data) {
        information = data.toString('utf8')

        response = yaml.safeLoad(information)
      }

      writeResponse(res, response)
    }
  )
}

//------------------------------------------------------------------------------

function overview(req, res) {
  directory = './static/data'
  filename  = directory + '/materials.yaml'
  response  = {}

  // read overview information
  fs.readFile(filename,
    // callback function that is called when reading file is done
    function(err, data) {
      if (err) {
        console.log(err)
      }

      if (data) {
        information = data.toString('utf8')

        response = yaml.safeLoad(information)
      }

      writeResponse(res, response)
    }
  )
}

//------------------------------------------------------------------------------

function login(req, res) {
  email    = req.body.email    ? req.body.email    : ""
  password = req.body.password ? req.body.password : ""
  response = {
    'email':     email,
    'password':  password,
    'validated': "no"
  }

  // check if email is valid and password has been defined
  if (email == '' || password == '' || email.includes('..') || email.includes('/')) {
    writeResponse(res, response)
    return
  }

  // check if directory exists
  directory = './data/students/' + email
  filename  = directory + '/passwort'

  // check if directory exists
  if (!fs.existsSync(directory)) {
    // create directory
    fs.mkdirSync(directory)

    // write password file
    var writeStream = fs.createWriteStream(filename)
    writeStream.write(password)
    writeStream.end()

    response.validated = "yes"
    writeResponse(res, response)
    return
  }

  // read file password file
  fs.readFile(filename,
    // callback function that is called when reading file is done
    function(err, data) {
      // error will reading password file
      if (!err) {
        real_password = data.toString('utf8').trim()
        response.validated = (password === real_password ? "yes" : "no")
      }

      console.log(response)
      writeResponse(res, response)
    }
  )
}

//------------------------------------------------------------------------------

app.use( parser.json() )                         // support json encoded bodies
app.use( parser.urlencoded({ extended: true }) ) // support encoded bodies
app.use( express.static('./static') )            // static files from root

app.post('/login',                                    login)
app.get( '/overview',                                 overview)
app.get( '/questionnaire/:profession/:qualification', questionnaire)

server = app.listen(port, () => console.log(`Server listening on port ${port}!`))
server.timeout = 5000
