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

  // read overview information
  fs.readFile(filename,
    // callback function that is called when reading file is done
    function(err, data) {
      if (err) {
        console.log(err)
        writeResponse(res, {err: err.toString()})
        return
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
        writeResponse(res, {err: err.toString()})
        return
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

function saveQuiz(req, res) {
  var quiz  = req.body.quiz  ? req.body.quiz  : ""
  var email = req.body.email ? req.body.email : ""

  // check if email and quiz have been defined
  if (email == "" || quiz == "") {
    writeResponse(res, {err: 'missing parameters'})
    return
  }

  // determine profession and qualification
  profession    = quiz.profession
  qualification = quiz.qualification

  // write file
  directory = './data/students/' + email + '/certificates'
  filename  = directory + '/certificate-' + profession + "-" + qualification

  try {
    fs.writeFileSync(filename, yaml.safeDump(quiz))
  }
  catch (e) {
    writeResponse(res, {err: e.toString()})
    return
  }

  writeResponse(res, {err: ''})
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
  filename  = directory + '/password'

  // check if directory exists
  if (!fs.existsSync(directory)) {
    // create directory
    fs.mkdirSync(directory)
    fs.mkdirSync(directory + '/certificates')

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
      writeResponse(res, response)
    }
  )
}

//------------------------------------------------------------------------------

function saveCertificate(req, res) {
  var certs  = req.body.certs  ? req.body.certs  : ""
  var email = req.body.email ? req.body.email : ""

  // check if email and certs have been defined
  if (email == "" || certs == "") {
    writeResponse(res, {err: 'missing parameters'})
    return
  }

  // current timestamp in milliseconds
  var ts = Date.now();

  var date_ob = new Date(ts);
  var date = date_ob.getDate();
  var month = date_ob.getMonth() + 1;
  var year = date_ob.getFullYear();
  var hours = date_ob.getHours();
  var minutes = date_ob.getMinutes();

  // write file
  directory = './data/students/' + email + '/certificates'
  filename  = directory + '/final-certificate_' + year + "-" + month + "-" + date + "_" + hours + "-" + minutes

  try {
    fs.writeFileSync(filename, yaml.safeDump(certs))
  }
  catch (e) {
    writeResponse(res, {err: e.toString()})
    return
  }

  writeResponse(res, {err: ''})
}

//------------------------------------------------------------------------------

function loadCertificate(req, res) {
  var cert  = req.body.cert  ? req.body.cert  : ""
  var email = req.body.email ? req.body.email : ""

  // check if email has been defined
  if (email == "") {
    writeResponse(res, {err: 'missing parameter'})
    return
  }

  // check cert for change dir i.e. if cert includes '../' and abort if true
  if (cert.includes('../')) {
    writeResponse(res, {err: 'manipulation detected'})
    return
  }

  directory = './data/students/' + email + '/certificates/'

  // if a certificate was requested
  if (cert != "") {

    filename  = directory + cert
    response  = {}

    // read certificate
    fs.readFile(filename,
      // callback function that is called when reading file is done
      function(err, data) {
        if (err) {
          console.log(err)
          writeResponse(res, {err: err.toString()})
          return
        }

        if (data) {
          information = data.toString('utf8')

          response = yaml.safeLoad(information)
        }

        writeResponse(res, response)
      }
    )
  }
  // if no certificate was requested - return list of existing certificates
  else {
    // get list of all files
    fs.readdir(directory,
      function (err, files) {
        if (err) {
          console.log('Unable to scan directory: ' + err)
	  writeResponse(res, {err: err.toString()})
	  return
        }
	if (files) {
	  //listing all files using forEach
          files.forEach(function (file) {
            // ToDo:
            // Maybe check certificate or something..
	  })
	}
        writeResponse(res, files)
      }
    )
  }
}

//------------------------------------------------------------------------------

app.use( parser.json() )                         // support json encoded bodies
app.use( parser.urlencoded({ extended: true }) ) // support encoded bodies
app.use( express.static('./static') )            // static files from root

app.post('/login',                                    login)
app.get( '/overview',                                 overview)
app.get( '/questionnaire/:profession/:qualification', questionnaire)
app.post( '/quiz',                                    saveQuiz)
app.post('/certificate',                              saveCertificate)
app.post('/loadcertificate',                          loadCertificate)

server = app.listen(port, () => console.log(`Server listening on port ${port}!`))
server.timeout = 5000
