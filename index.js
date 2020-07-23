const yaml    = require('js-yaml')
const express = require('express')
const parser  = require('body-parser')
const fs      = require('fs')
const del     = require('del')
const app     = express()
const port    = 8080

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

function createAccount(req, res) {
  emailNew    = req.body.emailNew    ? req.body.emailNew    : ""
  passwordNew = req.body.passwordNew ? req.body.passwordNew : ""
  typeNew     = req.body.typeNew     ? req.body.typeNew     : ""
  email       = req.body.email       ? req.body.email       : ""
  password    = req.body.password    ? req.body.password    : ""
  response = {
    'email':     email,
    'password':  password,
    'msg':       "error"
  }

  // check if email is valid and password has been defined
  if (email == '' || password == '' || email.includes('..') || email.includes('/')) {
    writeResponse(res, response)
    return
  }

  // check if emailNew is valid and passwordNew has been defined
  if (emailNew == '' || passwordNew == '' || typeNew == ''  || emailNew.includes('..') || emailNew.includes('/')) {
    writeResponse(res, response)
    return
  }

  // check if directory exists
  directory = './data/students/' + email
  filename  = directory + '/password'
  check = {
    'validated': "no",
    'type':      ""
  }

  // read file password-file
  fs.readFile(filename,
    // callback function that is called when reading file is done
    function(err, data) {
      // error will reading password file
      if (!err) {
        real_password = data.toString('utf8').trim()
        check.validated = (password === real_password ? "yes" : "no")

        // read file type-file
        fs.readFile(directory + '/type',
          // callback function that is called when reading file is done
          function(err, data) {
            // error will reading password file
            if (!err) {
              type = data.toString('utf8').trim()
              check.type = type

              if (check.validated == "no") {
                response.msg = "don't mess with me"
                writeResponse(res, response)
                return
              }

              if (check.type == "Schüler/Azubi") {
                response.msg = "no permission"
                writeResponse(res, response)
                return
              }

              if (check.type == "Ausbilder" && typeNew == "Administrator") {
                response.msg = "no permission"
                writeResponse(res, response)
                return
              }

              // check if directory exists
              directory = './data/students/' + emailNew
              filename  = directory + '/password'

              // check if directory exists
              if (!fs.existsSync(directory)) {
                // create directory
                fs.mkdirSync(directory)
                fs.mkdirSync(directory + '/certificates')

                // write password file
                var writeStream = fs.createWriteStream(filename)
                writeStream.write(passwordNew)
                writeStream.end()

                // write permission file
                writeStream = fs.createWriteStream(directory + '/type')
                writeStream.write(typeNew)
                writeStream.end()

                response.msg = "account created"
                response.email = emailNew
                response.password = passwordNew
                writeResponse(res, response)
                return
              }
              // if account already exists
              else {
                response.msg = "account already exists"
                writeResponse(res, response)
                return
              }
            }
          }
        )
      }
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
  filename  = directory + '/password'

  // check if directory exists
  if (!fs.existsSync(directory)) {
// commented out - replaced by account creation function
    // create directory
//    fs.mkdirSync(directory)
//    fs.mkdirSync(directory + '/certificates')

    // write password file
//    var writeStream = fs.createWriteStream(filename)
//    writeStream.write(password)
//    writeStream.end()

//    response.validated = "yes"
//    writeResponse(res, response)
//    return

    // account not found
    response.validated = "no"
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

function changePassword(req, res) {
  email    = req.body.email    ? req.body.email    : ""
  oldPassword = req.body.oldpassword ? req.body.oldpassword : ""
  newPassword = req.body.newpassword ? req.body.newpassword : ""
  response = {
    'email':     email,
    'password':  oldPassword,
    'validated': "no",
    'success':   "no"
  }

  // check if email is valid and password has been defined
  if (email == '' || oldPassword == '' || newPassword == '' || email.includes('..') || email.includes('/')) {
    //console.log(`email, old or new password ist empty or invalid`)
    //console.log(email)
    //console.log(oldPassword)
    //console.log(newPassword)
    writeResponse(res, response)
    return
  }

  // check if directory exists
  directory = './data/students/' + email
  filename  = directory + '/password'

  // check if directory exists
  if (!fs.existsSync(directory)) {
    // maybe some messing around because this shouldn't happen -> deauth
    //console.log(`Directory (i.e. user) doesn't exist!`)
    response.validated = "no"
    response.success = "no"
    writeResponse(res, response)
    return
  }

  // read file password file to check if old Password is correct
  fs.readFile(filename,
    // callback function that is called when reading file is done
    function(err, data) {
      // error will reading password file
      if (!err) {
        real_password = data.toString('utf8').trim()
        response.validated = (oldPassword === real_password ? "yes" : "no")

        // check if old password was correct
        if (response.validated === "no") {
          // just to make sure..
          //console.log(`validated: no!`)

          response.validated = "no"
          response.success = "no"
          writeResponse(res, response)
          return
        }
        else if (response.validated === "yes") {
          // write new password
          //console.log(`validated: yes!`)

          try {
            fs.writeFileSync(filename, newPassword)
          }
          catch (e) {
            writeResponse(res, {err: e.toString()})
            return
          }

          response.password = newPassword
          response.validated = "yes"
          response.success = "yes"
        }
      }
      writeResponse(res, response)
    }
  )
}

//------------------------------------------------------------------------------

function passwordReset(req, res) {
  emailReq       = req.body.emailReq    ? req.body.emailReq    : ""
  passwordReq    = req.body.passwordReq ? req.body.passwordReq : ""
  emailTar       = req.body.emailTar    ? req.body.emailTar    : ""
  passwordTar    = req.body.passwordTar ? req.body.passwordTar : ""
  response = {
    'email':     emailReq,
    'password':  passwordReq,
    'msg':       "error"
  }

  // check if email is valid and password has been defined
  if (emailReq == '' || passwordReq == '' || emailReq.includes('..') || emailReq.includes('/')) {
    writeResponse(res, response)
    return
  }

  // check if emailNew is valid and passwordNew has been defined
  if (emailTar == '' || passwordTar == '' || emailTar.includes('..') || emailTar.includes('/')) {
    writeResponse(res, response)
    return
  }

  // check if directory exists
  directory = './data/students/' + emailReq
  filename  = directory + '/password'
  check = {
    'validated': "no",
    'type':      ""
  }

  // read file password-file of requesting user
  fs.readFile(filename,
    // callback function that is called when reading file is done
    function(err, data) {
      // error will reading password file
      if (!err) {
        real_password = data.toString('utf8').trim()
        check.validated = (passwordReq === real_password ? "yes" : "no")

        // read file type-file of requesting user
        fs.readFile(directory + '/type',
          // callback function that is called when reading file is done
          function(err, data) {
            // error will reading type file
            if (!err) {
              type = data.toString('utf8').trim()
              check.type = type

              if (check.validated == "no") {
                response.msg = "don't mess with me!"
                writeResponse(res, response)
                return
              }

              // check type of target user
              directory = './data/students/' + emailTar
              filename  = directory + '/type'

              fs.readFile(filename,
                // callback function that is called when reading file is done
                function(err, data) {
                  // error will reading type file
                  if (!err) {
                    tarType = data.toString('utf8').trim()

                    // stop others from resetting Admin passwords
                    if (tarType == "Administrator" && check.type == "Ausbilder") {
                      response.msg = "no permission"
                      writeResponse(res, response)
                      return
                    }

                    // only Admin and instructors have permission to reset pw
                    if (check.type == "Ausbilder" || check.type == "Administrator") {

                      // check if directory exists
                      directory = './data/students/' + emailTar
                      filename  = directory + '/password'

                      // check if directory exists
                      if (fs.existsSync(directory)) {
                        // write password file
                        var writeStream = fs.createWriteStream(filename)
                        writeStream.write(passwordTar)
                        writeStream.end()

                        response.msg = "success"
                        response.email = emailTar
                        response.password = passwordTar
                        writeResponse(res, response)
                        return
                      }
                      // if account doesn't exist
                      else {
                        response.msg = "error: Account not found!"
                        writeResponse(res, response)
                        return
                      }
                    }
                    else {
                      response.msg = "no permission"
                      writeResponse(res, response)
                      return
                    }
                  }
                }
              )
            }
          }
        )
      }
    }
  )
}

//------------------------------------------------------------------------------

function deleteAccount(req, res) {
  emailReq       = req.body.emailReq    ? req.body.emailReq    : ""
  passwordReq    = req.body.passwordReq ? req.body.passwordReq : ""
  emailTar       = req.body.emailTar    ? req.body.emailTar    : ""
  response = {
    'email':     emailReq,
    'password':  passwordReq,
    'msg':       "error"
  }

  // check if email is valid and password has been defined
  if (emailReq == '' || passwordReq == '' || emailReq.includes('..') || emailReq.includes('/')) {
    writeResponse(res, response)
    return
  }

  // check if emailNew is valid and passwordNew has been defined
  if (emailTar == '' || emailTar.includes('..') || emailTar.includes('/')) {
    writeResponse(res, response)
    return
  }

  // check if directory exists
  directory = './data/students/' + emailReq
  filename  = directory + '/password'
  check = {
    'validated': "no",
    'type':      ""
  }

  // read file password-file of requesting user
  fs.readFile(filename,
    // callback function that is called when reading file is done
    function(err, data) {
      // error will reading password file
      if (!err) {
        real_password = data.toString('utf8').trim()
        check.validated = (passwordReq === real_password ? "yes" : "no")

        // read file type-file of requesting user
        fs.readFile(directory + '/type',
          // callback function that is called when reading file is done
          function(err, data) {
            // error will reading type file
            if (!err) {
              type = data.toString('utf8').trim()
              check.type = type

              if (check.validated == "no") {
                response.msg = "don't mess with me!"
                writeResponse(res, response)
                return
              }

              // maybe check if user exists first

              // check type of target user
              directory = './data/students/' + emailTar
              filename  = directory + '/type'

              fs.readFile(filename,
                // callback function that is called when reading file is done
                function(err, data) {
                  // error will reading type file
                  if (!err) {
                    tarType = data.toString('utf8').trim()

                    // stop others from deleting an Admin account
                    if (tarType == "Administrator" && check.type == "Ausbilder") {
                      response.msg = "no permission"
                      writeResponse(res, response)
                      return
                    }

                    // only allow deletion if permissions are granted
                    if (check.type == "Ausbilder" || check.type == "Administrator") {

                      // check if directory exists
                      directory = './data/students/' + emailTar

                      // check if directory exists
                      if (fs.existsSync(directory)) {

                        // delete directory recursively
                        (async () => {
                          try {
                            await del(directory);

                            console.log(`${directory} is deleted!`);

                            response.msg = "success"
                            response.email = ""
                            response.password = ""

                            writeResponse(res, response)
                            return
                          }
                          catch (err) {
                            console.error(`Error while deleting ${directory}.`);
                            console.error({err: err.toString()});

                            response.msg = "failed"
                            response.email = ""
                            response.password = ""

                            writeResponse(res, response)
                            return
                          }
                        })();

                      }
                      // if account doesn't exist
                      else {
                        response.msg = "error: Account not found!"
                        writeResponse(res, response)
                        return
                      }
                    }
                    else {
                      response.msg = "no permission"
                      writeResponse(res, response)
                      return
                    }
                  }
                }
              )
            }
          }
        )
      }
    }
  )
}

//------------------------------------------------------------------------------

function getAllUsers(req, res) {
  // TODO: validate requesting user first

  response = {}

  directory = './data/students/'

  fs.readdir(directory,
    function (err, files) {
      if (err) {
        console.log('Unable to scan directory: ' + err)
        writeResponse(res, {err: err.toString()})
        return
      }
      if (files) {
        //listing all files using forEach
        response = files
        files.forEach(function (file, index) {
          // read type file of user
          fs.readFile(directory + file + '/type',
            // callback function that is called when reading file is done
            function (err, data) {
              // error will reading type files
              if (!err) {
                response[index] = {
                  'email': file,
                  'type':  data.toString('utf8').trim()
                }
                // wait with writeResponse until response is filled
                if (index == response.length-1) writeResponse(res, response);
              }
            }
          )
        })
      }
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
app.post('/changepassword',                           changePassword)
app.post('/createaccount',                            createAccount)
app.post('/getallusers',                              getAllUsers)
app.post('/passwordreset',                            passwordReset)
app.post('/deleteaccount',                            deleteAccount)

server = app.listen(port, () => console.log(`Server listening on port ${port}!`))
server.timeout = 5000
