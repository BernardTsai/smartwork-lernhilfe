const yaml    = require('js-yaml')
const express = require('express')
const parser  = require('body-parser')
const fs      = require('fs')
const del     = require('del')
const multer  = require('multer')
const app     = express()
const port    = 8080

//------------------------------------------------------------------------------

function getDateOb() {
  // current timestamp in milliseconds
  var ts = Date.now();
  var date_ob = new Date(ts);
  return date_ob
}

var log = fs.createWriteStream('./logs/log_' + getDateOb().getFullYear() + '-' + (getDateOb().getMonth()+1) + '-' + getDateOb().getDate(), {
  flags: 'a' // 'a' means appending (old data will be preserved)
})

function appendToLog(line) {
  // current timestamp in milliseconds
  var ts = Date.now();

  var date_ob = new Date(ts);
  var date = date_ob.getDate();
  var month = date_ob.getMonth() + 1;
  var year = date_ob.getFullYear();
  var hours = date_ob.getHours();
  var minutes = date_ob.getMinutes();
  var seconds = date_ob.getSeconds();

  formattedTime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds

  log.write(formattedTime + '  ' + line + '\n')
}

//------------------------------------------------------------------------------

function loadLogs(req, res) {
  var log      = req.body.log      ? req.body.log      : ""
  var email    = req.body.email    ? req.body.email    : ""
  var password = req.body.password ? req.body.password : ""

  authenticate(email, password, "Administrator", loadLogsCB, res);

  function loadLogsCB() {

    directory = './logs/'

    // if a log was requested
    if (log != "") {

      filename  = directory + log
      response  = {}

      // read log
      fs.readFile(filename,
      // callback function that is called when reading file is done
        function(err, data) {
          if (err) {
            var logLine = 'ERROR: |loadLogs| unable to read File. Err: ' + err.toString()
            appendToLog(logLine)

            console.log(err)
            writeResponse(res, {err: err.toString()})
            return
          }

          if (data) {
            information = data.toString('utf8')

            response = information
          }

          writeResponse(res, response)
        }
      )
    }
    // if no log was requested - return list of existing logs
    else {
      // get list of all files
      fs.readdir(directory,
        function (err, files) {
          if (err) {
            var logLine = 'ERROR: |loadLogs| unable to read directory. Err: ' + err.toString()
            appendToLog(logLine)

            console.log('Unable to scan directory: ' + err)
            writeResponse(res, {err: err.toString()})
            return
          }
          if (files.length == 0) { files = "no logs found" }
          else if (files) {
            //listing all files using forEach
            files.forEach(function (file) {
              // ToDo:
              // Maybe file certificate or something..
            })
          }
          writeResponse(res, files)
        }
      )
    }

  }
}

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

        var logLine = 'ERROR: |questionnaire| load questions Err: ' + err.toString()
        appendToLog(logLine)

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

        var logLine = 'ERROR: |Overview| load materials Err: ' + err.toString()
        appendToLog(logLine)

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

  if (fs.existsSync(filename)) {
    var logLine = 'WARNING: |saveQuiz| Unable to save certificate-' + profession + "-" + qualification + ' for user ' + email + '. Certificate already exists'
    appendToLog(logLine)

    writeResponse(res, {success: 'no', err: 'certificate already exists'})
    return
  }

  try {
    fs.writeFileSync(filename, yaml.safeDump(quiz))
  }
  catch (e) {
    var logLine = 'ERROR: |saveQuiz| unable to save certificate-' + profession + "-" + qualification + ' for user ' + email + '. Err: ' + e.toString()
    appendToLog(logLine)

    writeResponse(res, {success: 'no', err: e.toString()})
    return
  }

  writeResponse(res, {success: 'yes', err: ''})
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

  var requiredType = (typeNew == "Schüler/Azubi") ? "Ausbilder" : "Administrator"
  authenticate(email, password, requiredType, createAccountCB, res);

  function createAccountCB() {
    // check if emailNew is valid and passwordNew has been defined
    if (emailNew == '' || passwordNew == '' || typeNew == ''  || emailNew.includes('..') || emailNew.includes('/')) {
      var logLine = 'WARNING: |createAccount| Possible manipulation attempt detected: User to create includes cd command (../) or is empty. Requesting user: ' + email + ' tried to create ' + emailNew
      appendToLog(logLine)

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

      var logLine = 'INFO: |createAccount| new account created ' + emailNew + '. Requesting user: ' + email
      appendToLog(logLine)

      response.msg = "account created"
      response.email = emailNew
      response.password = passwordNew
      writeResponse(res, response)
      return
    }
    // if account already exists
    else {
      var logLine = 'WARNING: |createAccount| Account created denied: ' + emailNew + 'already exists. Requesting user: ' + email
      appendToLog(logLine)

      response.msg = "account already exists"
      writeResponse(res, response)
      return
    }

  }

}

//------------------------------------------------------------------------------

function login(req, res) {
  email    = req.body.email    ? req.body.email    : ""
  password = req.body.password ? req.body.password : ""
  response = {
    'email':     email,
    'password':  password,
    'type':      "",
    'validated': "no"
  }

//---------
  //do like here to authenticate - don't use for login - only for demo purposes here
//  authenticate(email, password, loginCB);

//  function loginCB() {
//---------

  // check if email is valid and password has been defined
  if (email == '' || password == '' || email.includes('..') || email.includes('/')) {
//    var logLine = 'WARNING: |login| possible manipulation attempt detected! ' + email + ' includes cd command (../) or is empty.'
    var logLine = "";
    if (email == '') logLine = 'INFO: |login| email is empty.';
    else if (password == '') logLine = 'INFO: |login| password is empty.';
    else logLine = 'WARNING: |login| possible manipulation attempt detected! Email: ' + email + ' includes cd command (../).';
    appendToLog(logLine)

    writeResponse(res, response)
    return
  }

  // check if directory exists
  directory = './data/students/' + email
  filename  = directory + '/password'

  // check if directory exists
  if (!fs.existsSync(directory)) {
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

        if (response.validated != "yes") {
          var logLine = 'INFO: |login| Login attempt failed: wrong password for user ' + email
          appendToLog(logLine)
        }

        // read type-file
        fs.readFile(directory + '/type',
          // callback function that is called when reading file is done
          function(err, data) {
            if (err) {
              var logLine = 'WARNING: |login| failed to read type file for user ' + email
              appendToLog(logLine)

              console.log(err)
              writeResponse(res, {err: err.toString()})
              return
            }

            if (data) {
              response.type = data.toString('utf8').trim()
            }

//            console.log(email + " wurde eingeloggt!");
//            console.log(response);

            writeResponse(res, response)
          }
        )

      }
      //writeResponse(res, response)
    }
  )

//--------
//  }
//--------

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

  authenticate(email, password, "Schüler/Azubi", changePasswordCB, res);

  function changePasswordCB() {
    if (newPassword == '') {
      var logLine = 'INFO: |changePassword| ' + email + ' -> new password is empty.'
      appendToLog(logLine)

      writeResponse(res, response)
      return
    }

    // check if directory exists
    directory = './data/students/' + email
    filename  = directory + '/password'

    // check if directory exists
    if (!fs.existsSync(directory)) {
      // maybe some messing around because this shouldn't happen -> deauth
      var logLine = 'WARNING: |changePassword| Possible manipulation attempt detected: user ' + email + ' does not exist'
      appendToLog(logLine)

      //console.log(`Directory (i.e. user) doesn't exist!`)
      response.validated = "no"
      response.success = "no"
      writeResponse(res, response)
      return
    }

    // write new password
    try {
      fs.writeFileSync(filename, newPassword)
    }
    catch (e) {
      var logLine = 'ERROR: |changePassword| unable to write file. Requesting user: ' + email
      appendToLog(logLine)

      writeResponse(res, {err: e.toString()})
      return
    }

    response.password = newPassword
    response.validated = "yes"
    response.success = "yes"
    writeResponse(res, response)

  }


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

  authenticate(emailReq, passwordReq, "Ausbilder", passwordResetCB, res);

  function passwordResetCB(type) {
    // check if emailNew is valid and passwordNew has been defined
    if (emailTar == '' || passwordTar == '' || emailTar.includes('..') || emailTar.includes('/')) {
      var logLine = 'WARNING: |passwordReset| Target user ' + emailTar + 'includes cd command (../) or is empty or passsword is empty. Requesting user: ' + emailReq
      appendToLog(logLine)

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
          if (tarType == "Administrator" && type == "Ausbilder") {
            var logLine = 'WARNING: |passwordReset| reset denied. Requesting user ' + emailReq + 'with type Ausbilder tried to reset admin password of ' + emailTar
            appendToLog(logLine)

            response.msg = "no permission"
            res.status(403);
            writeResponse(res, response)
            return
          }

          // only Admin and instructors have permission to reset pw
          if (type == "Ausbilder" || type == "Administrator") {

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
              var logLine = 'ERROR: |passwordReset| failed. Requesting user ' + emailReq + 'tried to reset password of non existing account ' + emailTar
              appendToLog(logLine)

              response.msg = "error: Account not found!"
              writeResponse(res, response)
              return
            }
          }
          else {
            var logLine = 'WARNING: |passwordReset| Requesting user ' + emailReq + 'does not have permission to reset passwords!'
            appendToLog(logLine)

            response.msg = "no permission"
            res.status(403);
            writeResponse(res, response)
            return
          }
        }
      }
    )


  }

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

  authenticate(emailReq, passwordReq, "Ausbilder", deleteAccountCB, res);

  function deleteAccountCB(type) {
    // check if emailTar is valid
    if (emailTar == '' || emailTar.includes('..') || emailTar.includes('/')) {
      var logLine = 'WARNING: |deleteAccount| target user ' + emailTar + 'includes cd command (../) or is empty.'
      appendToLog(logLine)

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

          // stop others from deleting an Admin account
          if (tarType == "Administrator" && type == "Ausbilder") {
            var logLine = 'WARNING: |deleteAccount| denied. Requesting user ' + emailReq + 'tried to delete admin account: ' + emailTar
            appendToLog(logLine)

            response.msg = "no permission"
            res.status(403);
            writeResponse(res, response)
            return
          }

          // only allow deletion if permissions are granted
          if (type == "Ausbilder" || type == "Administrator") {

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

//                  writeResponse(res, response)
//                  return
                }
                catch (err) {
                  console.error(`Error while deleting ${directory}.`);
                  console.error({err: err.toString()});

                  var logLine = 'ERROR: |deleteAccount| failed to remove user ' + emailTar + '. Requesting user: ' + emailReq + '. Err: ' + err.toString()
                  appendToLog(logLine)

                  response.msg = "failed"
                  response.email = ""
                  response.password = ""

                  writeResponse(res, response)
                  return
                }
                var logLine = 'INFO: |deleteAccount| removed user ' + emailTar + ' successfully. Requesting user: ' + emailReq
                appendToLog(logLine)

                writeResponse(res, response)
                return
              })();

            }
            // if account doesn't exist
            else {
              var logLine = 'ERROR: |deleteAccount| Requesting user ' + emailReq + 'tried to remove non existing account: ' + emailTar
              appendToLog(logLine)

              response.msg = "error: Account not found!"
              writeResponse(res, response)
              return
            }
          }
          else {
            var logLine = 'WARNING: |deleteAccount| Requesting user ' + emailReq + 'does not have permission to delete accounts'
            appendToLog(logLine)

            response.msg = "no permission"
            res.status(403);
            writeResponse(res, response)
            return
          }
        }
      }
    )


  }


}

//------------------------------------------------------------------------------

function getAllUsers(req, res) {
  // TODO: validate requesting user first

  response = {}

  directory = './data/students/'

  fs.readdir(directory,
    function (err, files) {
      if (err) {
        var logLine = 'ERROR: |getAllUsers| failed to read directory ' + directory + ' Err: ' + err.toString()
        appendToLog(logLine)

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

function getAllGroups(req, res) {
  // TODO: validate requesting user first

  response = {}

  directory = './data/groups/'

  fs.readdir(directory,
    function (err, files) {
      if (err) {
        var logLine = 'ERROR: |getAllGroups| failed to read directory ' + directory + ' Err: ' + err.toString()
        appendToLog(logLine)

        console.log('Unable to scan directory: ' + err)
        writeResponse(res, {err: err.toString()})
        return
      }
      if (files) {
        //listing all files using forEach
        response = files
        files.forEach(function (file, index) {
          // read group files
          fs.readFile(directory + file,
            // callback function that is called when reading file is done
            function (err, data) {
              // error will reading group file
              if (!err) {
                response[index] = {
                  'groupName': file,
                  'members':  data.toString('utf8')
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

function createGroup(req, res) {
  members   = req.body.members   ? req.body.members   : ""
  groupName = req.body.groupName ? req.body.groupName : ""
  email     = req.body.email     ? req.body.email     : ""
  password  = req.body.password  ? req.body.password  : ""
  response = {
    'groupName': groupName,
    'members':   members,
    'msg':       "error"
  }

  authenticate(email, password, "Ausbilder", createGroupCB, res);

  function createGroupCB() {
    // check if groupName is valid has been defined
    if (members == '' || groupName == ''  || groupName.includes('..') || groupName.includes('/')) {
      var logLine = 'ERROR: |createGroup| no groupName and/or members defined and/or groupName includes cd command (../)'
      appendToLog(logLine)

      writeResponse(res, response)
      return
    }

    // check if directory exists
    directory = './data/groups/'
    filename  = directory + groupName

    // check if file exists
    if (!fs.existsSync(filename)) {

      try {
        fs.writeFileSync(filename, yaml.safeDump(members))
      }
      catch (e) {
        var logLine = 'ERROR: |createGroup| failed to write file. Err: ' + e.toString()
        appendToLog(logLine)

        writeResponse(res, {err: e.toString()})
        return
      }

      var logLine = 'INFO: |createGroup| added group ' + groupName + ' successfully. Requesting user: ' + email
      appendToLog(logLine)

      response.msg = "success"
      response.groupName = groupName
      response.members = members
      writeResponse(res, response)
      return
    }
    // if group already exists
    else {
      var logLine = 'WARNING: |createGroup| denied. Group ' + groupName + ' already exists.'
      appendToLog(logLine)

      response.msg = "group already exists"
      writeResponse(res, response)
      return
    }
  }

}

//------------------------------------------------------------------------------

function deleteGroup(req, res) {
  emailReq       = req.body.emailReq    ? req.body.emailReq    : ""
  passwordReq    = req.body.passwordReq ? req.body.passwordReq : ""
  groupName      = req.body.groupName   ? req.body.groupName   : ""
  response = {
    'email':     emailReq,
    'password':  passwordReq,
    'msg':       "error"
  }

  authenticate(emailReq, passwordReq, "Ausbilder", deleteGroupCB, res);

  function deleteGroupCB(type) {
    // check if groupName is valid
    if (groupName == '' || groupName.includes('..') || groupName.includes('/')) {
      var logLine = 'WARNING: |deleteGroup| possible manipulation attempt detected. GroupName ' + groupName + ' contains cd command (../) or is empty.'
      appendToLog(logLine)

      writeResponse(res, response)
      return
    }

    if (type == "Schüler/Azubi") {
      var logLine = 'WARNING: |deleteGroup| possible manipulation attempt detected. User ' + emailReq + ' does not have permission to delete groups.'
      appendToLog(logLine)

      response.msg = "no permission"
      res.status(403);
      writeResponse(res, response)
      return
    }

    directory = './data/groups/'
    filename  = directory + groupName

    // check if file exists
    if (fs.existsSync(filename)) {
      // remove group file
      try {
        fs.unlinkSync(filename)

//        response.msg = "success"
//        writeResponse(res, response)
//        return
      } catch(err) {
         var logLine = 'ERROR: |deleteGroup| failed to remove group ' + groupName + '. Requesting user: ' + emailReq + ' Err: ' + err.toString()
         appendToLog(logLine)

        console.error(err)
        writeResponse(res, {err: err.toString()})
        return
      }
      var logLine = 'INFO: |deleteGroup| removed group ' + groupName + ' successfully. Requesting user: ' + emailReq
      appendToLog(logLine)

      response.msg = "success"
      writeResponse(res, response)
      return
    }
    else {
      var logLine = 'ERROR: |deleteGroup| group ' + groupName + ' does not exist. Requesting user: ' + emailReq
      appendToLog(logLine)

      response.msg = "error: groups doesn't exist"
      writeResponse(res, response)
      return
    }
  }


}

//------------------------------------------------------------------------------



//------------------------------------------------------------------------------

function editGroup(req, res) {
  email     = req.body.email     ? req.body.email     : ""
  password  = req.body.password  ? req.body.password  : ""
  groupName = req.body.groupName ? req.body.groupName : ""
  groupNew  = req.body.data      ? req.body.data      : ""
  response = {
    'success': "no",
    'msg':     ""
  }

  // check if email is valid and password has been defined
  if (email == '' || password == '' || email.includes('..') || email.includes('/')) {
    var logLine = 'WARNING: |editGroup| possible manipulation attempt detected. User ' + email + ' contains cd command (../) or is empty and/or password is empty.'
    appendToLog(logLine)

    writeResponse(res, response)
    return
  }

  // check if groupName is valid and has been defined
  if (groupName == '' || groupName.includes('..') || groupName.includes('/')) {
    var logLine = 'WARNING: |editGroup| possible manipulation attempt detected. Group ' + groupName + ' contains cd command (../) or is empty.'
    appendToLog(logLine)

    writeResponse(res, response)
    return
  }

  directory = './data/students/' + email
  filename  = directory + '/password'

  // read file password-file of requesting user
  fs.readFile(filename,
    // callback function that is called when reading file is done
    function(err, data) {
      // error will reading password file
      if (!err) {
        real_password = data.toString('utf8').trim()
        validated = (password === real_password ? "yes" : "no")
        if (validated == "no") {
          response.msg = "don't mess with me!"
          writeResponse(res, response)
          return
        }

        // read file type-file of requesting user
        fs.readFile(directory + '/type',
          // callback function that is called when reading file is done
          function(err, data) {
            // error will reading type file
            if (!err) {
              type = data.toString('utf8').trim()

              if (type == "Schüler/Azubi") {
                var logLine = 'WARNING: |editGroup| possible manipulation attempt detected. User ' + email + ' does not have permission.'
                appendToLog(logLine)

                response.msg = "no permission"
                writeResponse(res, response)
                return
              }

              directory = './data/groups/'
              filename  = directory + groupName

              // check if file exists
              if (fs.existsSync(filename)) {
                // read file group-file
                fs.readFile(filename,
                  // callback function that is called when reading file is done
                  function(err, data) {
                    // error will reading group file
                    if (!err) {
                      group = data.toString('utf8')
                      group = yaml.safeLoad(group)
//                      console.log(group)

                      group = groupNew

//                      console.log(group)
//                      console.log("");

                      try {
                        fs.writeFileSync(filename, yaml.safeDump(group))
                        response.success = "yes"
                      }
                      catch (e) {
                        var logLine = 'ERROR: |editGroup| failed to save file for group ' + groupName + '. Requesting user: ' + email + 'Err: ' + e.toString()
                        appendToLog(logLine)

                        writeResponse(res, {err: e.toString()})
                        return
                      }
                    }
                    var logLine = 'INFO: |editGroup| edited group ' + groupName + ' successfully. Requesting user: ' + email
                    appendToLog(logLine)

                    writeResponse(res, response)
                  }
                )
              }
            }
          }
        )
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
    var logLine = 'WARNING: |saveCertificate| possible manipulation attempt detected. User ' + email + ' or certs is empty.'
    appendToLog(logLine)

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
//  filename  = directory + '/final-certificate_' + year + "-" + month + "-" + date + "_" + hours + "-" + minutes
  filename  = directory + '/final-certificate-' + certs.profession

  try {
    fs.writeFileSync(filename, yaml.safeDump(certs))
  }
  catch (e) {
    var logLine = 'ERROR: |saveCertificate| failed to write file certificate-' + certs.profession + ' for user: ' + email + '. Err: ' + e.toString()
    appendToLog(logLine)

    writeResponse(res, {err: e.toString()})
    return
  }

   var logLine = 'INFO: |saveCertificate| final certificate-' + certs.profession + ' created successfully for user: ' + email
   appendToLog(logLine)

  writeResponse(res, {err: ''})
}

//------------------------------------------------------------------------------

function loadCertificate(req, res) {
  var cert  = req.body.cert  ? req.body.cert  : ""
  var email = req.body.email ? req.body.email : ""

  // check if email has been defined
  if (email == "") {
    var logLine = 'WARNING: |loadCertificate| possible manipulation attempt detected. User ' + email + ' is empty.'
    appendToLog(logLine)

    writeResponse(res, {err: 'missing parameter'})
    return
  }

  // check cert for change dir i.e. if cert includes '../' and abort if true
  if (cert.includes('../')) {
    var logLine = 'WARNING: |loadCertificate| possible manipulation attempt detected. cert ' + cert + ' includes cd command (../).'
    appendToLog(logLine)

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
           var logLine = 'ERROR: |loadCertificate| Err: ' + err.toString()
           appendToLog(logLine)

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
           var logLine = 'ERROR: |loadCertificate| failed to scan directory. Err: ' + err.toString()
           appendToLog(logLine)

          console.log('Unable to scan directory: ' + err)
	  writeResponse(res, {err: err.toString()})
	  return
        }
        if (files.length == 0) { files = "no certificates found" }
	else if (files) {
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

function saveMaterials(req, res) {
  var email         = req.body.email         ? req.body.email         : ""
  var password      = req.body.password      ? req.body.password      : ""
  var profession    = req.body.profession    ? req.body.profession    : ""
  var qualification = req.body.qualification ? req.body.qualification : ""
  var materials     = req.body.materials     ? req.body.materials     : ""
  response = {
    'success': false,
    'msg':     ""
  }


  // check if email and quiz have been defined
  if (email == "" || password == "" || email.includes('..') || email.includes('/') || profession == "" || qualification == "") {
    var logLine = 'WARNING: |saveMaterials| possible manipulation attempt detected. User ' + email + ' includes cd command (../) or is empty and/or password/professsion/qualification is empty.'
    appendToLog(logLine)

    writeResponse(res, {err: 'missing parameters'})
    return
  }

  directory = './data/students/' + email
  filename  = directory + '/password'

  //check if user has permission
  fs.readFile(filename,
    // callback function that is called when reading file is done
    function(err, data) {
      // error will reading password file
      if (!err) {
        real_password = data.toString('utf8').trim()
        validated = (password === real_password ? "yes" : "no")

        // read file type-file
        fs.readFile(directory + '/type',
          // callback function that is called when reading file is done
          function(err, data) {
            // error will reading password file
            if (!err) {
              type = data.toString('utf8').trim()

              if (validated == "no") {
                var logLine = 'WARNING: |saveMaterials| possible manipulation attempt detected. User ' + email + ' does not use correct password.'
                appendToLog(logLine)

                response.msg = "not validated"
                writeResponse(res, response)
                return
              }

              if (type == "Schüler/Azubi") {
                var logLine = 'WARNING: |saveMaterials| possible manipulation attempt detected. User ' + email + ' does not have permission.'
                appendToLog(logLine)

                response.msg = "no permission"
                writeResponse(res, response)
                return
              }

              // check if directory exists
              directory = './data/materials/profession-' + profession + '/qualification-' + qualification
              filename  = directory + '/questions.yaml'

              // check if directory exists
              if (!fs.existsSync(directory)) {
                // create directory
                fs.mkdirSync(directory)
              }

              // write question.yaml file
              try {
                fs.writeFileSync(filename, yaml.safeDump(materials))
              }
              catch (e) {
                var logLine = 'ERROR: |saveMaterials| failed to write file ' + filename + '. Requesting user: ' + email + '. Err: ' + e.toString()
                appendToLog(logLine)

                writeResponse(res, {err: e.toString()})
                return
              }
              var logLine = 'INFO: |saveMaterials| saved ' + filename + ' successfully. Requesting user: ' + email
              appendToLog(logLine)

              response.success = true
              writeResponse(res, response)
              return
            }
          }
        )
      }
    }
  )
}

//------------------------------------------------------------------------------

function saveUpload(req, res, next) {
  var user = yaml.safeLoad(req.body.user);
  var quiz = yaml.safeLoad(req.body.quiz);
//  console.log(user);
//  console.log(quiz);

  //TODO: authentication before continuing

//  console.log(req.file)

  const tempPath = req.file.path;
  const targetPath = './data/materials/profession-' + quiz.profession + '/qualification-' + quiz.qualification + '/' + req.file.originalname;
//  const targetPath = './tmp/uploaded/' + req.file.originalname;

//  if (path.extname(req.file.originalname).toLowerCase() === ".png") {
    fs.rename(tempPath, targetPath, err => {
//      if (err) return handleError(err, res);

      res
        .status(200)
        .contentType("text/plain")
        .end("File uploaded!");
    });
//  } else {
//    fs.unlink(tempPath, err => {
//      if (err) return handleError(err, res);

//      res
//        .status(403)
//        .contentType("text/plain")
//        .end("Only .png files are allowed!");
//    });
//  }
}
//------------------------------------------------------------------------------

function getImage(req, res) {
  profession    = req.params["profession"]
  qualification = req.params["qualification"]
  fileName      = req.params["filename"]

  //TODO: make sure only the image can be requested
  // maybe only allow png and jpg to be uploaded and check if either .jpg or .png is in the fileName. If not abort. 

  const path = '/data/materials/profession-' + profession + '/qualification-' + qualification + '/' + fileName;
  res.sendFile(__dirname + path);
}

//------------------------------------------------------------------------------

function deleteImage(req, res) {
  emailReq       = req.body.emailReq      ? req.body.emailReq      : ""
  passwordReq    = req.body.passwordReq   ? req.body.passwordReq   : ""
  profession     = req.body.profession    ? req.body.profession    : ""
  qualification  = req.body.qualification ? req.body.qualification : ""
  imageName      = req.body.imageName     ? req.body.imageName     : ""
  response = {
    'email':     emailReq,
    'password':  passwordReq,
    'msg':       "error"
  }

  // check if email is valid and password has been defined
  if (emailReq == '' || passwordReq == '' || emailReq.includes('..') || emailReq.includes('/')) {
    var logLine = 'WARNING: |deleteImage| possible manipulation attempt detected. User ' + emailReq + ' contains cd command (../) or is empty and/or password is empty.'
    appendToLog(logLine)

    writeResponse(res, response)
    return
  }

  // check if emailNew is valid and passwordNew has been defined
  if (imageName == '' || imageName.includes('..') || imageName.includes('/')) {
    var logLine = 'WARNING: |deleteImage| possible manipulation attempt detected. ImageName ' + imageName + ' contains cd command (../) or is empty.'
    appendToLog(logLine)

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
                var logLine = 'WARNING: |deleteImage| possible manipulation attempt detected. User ' + emailReq + ' does not use correct password.'
                appendToLog(logLine)

                response.msg = "don't mess with me!"
                res.status(403)
                writeResponse(res, response)
                return
              }

              if (check.type == "Schüler/Azubi") {
                var logLine = 'WARNING: |deleteImage| possible manipulation attempt detected. User ' + emailReq + ' does not have permission to delete files.'
                appendToLog(logLine)

                response.msg = "no permission"
                res.status(403)
                writeResponse(res, response)
                return
              }

              // check type of target user
              directory = './data/materials/profession-' + profession.toString() + '/qualification-' + qualification.toString() + '/'
              filename  = directory + imageName

              // check if file exists
              if (fs.existsSync(filename)) {
                // remove group file
                try {
                  fs.unlinkSync(filename)

//                  response.msg = "success"
//                  writeResponse(res, response)
//                  return
                } catch(err) {
                  var logLine = 'ERROR: |deleteImage| failed to remove file ' + imageName + '. Requesting user: ' + emailReq + ' Err: ' + err.toString()
                  appendToLog(logLine)

                  console.error(err)
                  writeResponse(res, {err: err.toString()})
                  return
                }
                var logLine = 'INFO: |deleteImage| removed file ' + filename + ' successfully. Requesting user: ' + emailReq
                appendToLog(logLine)

                response.msg = "success"
                writeResponse(res, response)
                return
              }
              else {
                var logLine = 'ERROR: |deleteImage| file ' + filename + ' does not exist. Requesting user: ' + emailReq
                appendToLog(logLine)

                response.msg = "error: file does not exist"
                res.status(404)
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

var questionsFileLocked = false;

function updateStat(req, res) {
  var profession    = req.body.profession    ? req.body.profession    : ""
  var qualification = req.body.qualification ? req.body.qualification : ""
  var questionIndex = req.body.questionIndex ? req.body.questionIndex : ""
  var result        = req.body.result        ? req.body.result        : ""

//  var self = this;

  // wait if file is locked
  var _flagCheck = setInterval(function() {
    if (questionsFileLocked == false) {
        clearInterval(_flagCheck);
        updateResult(); // the function to run once file is unlocked
    }
  }, 100); // interval set at 100 milliseconds

  function updateResult() {
    // lock file
    questionsFileLocked = true;

    directory = './data/materials/profession-' + profession.toString() + "/qualification-" + qualification.toString()
    filename  = directory + '/questions.yaml'
    questions = {}

    // read questions file
    fs.readFile(filename,
      // callback function that is called when reading file is done
      function(err, data) {
        if (err) {
          console.log(err)

          var logLine = 'ERROR: |updateStats| load questions Err: ' + err.toString()
          appendToLog(logLine)
          // unlock file
          questionsFileLocked = false
          writeResponse(res, {err: err.toString()})
          return
        }

        if (data) {
          information = data.toString('utf8')

          questions = yaml.safeLoad(information)

          // calculate moving average
          var stat = questions[questionIndex].stats

          var recentAverageSmoothingFactor = 100.0;
          stat = (stat * recentAverageSmoothingFactor + result) / (recentAverageSmoothingFactor + 1.0);
          questions[questionIndex].stats = stat;

          // write question.yaml file
          try {
            fs.writeFileSync(filename, yaml.safeDump(questions))
          }
          catch (e) {
            var logLine = 'ERROR: |updateStats| failed to write file ' + filename + '. Err: ' + e.toString()
            appendToLog(logLine)
            // unlock file
            questionsFileLocked = false;
            writeResponse(res, {err: e.toString()})
            return
          }

          // call questionnaire() to send response with updated stats
          req.params["profession"] = profession
          req.params["qualification"] = qualification
          questionnaire(req, res)
        }
        // unlock file
        questionsFileLocked = false;
      }
    )
  }
}

//------------------------------------------------------------------------------

// to authenticate before performing an action
function authenticate(email, password, minType, callback, res) {
//  var validated = "";

  // check if email is valid and password has been defined
  if (email == '' || password == '' || email.includes('..') || email.includes('/')) {
    var logLine = "";
    if (email == '') logLine = 'INFO: |authenticate| email is empty.';
    else if (password == '') logLine = 'INFO: |authenticate| password is empty.';
    else logLine = 'WARNING: |authenticate| possible manipulation attempt detected! Email: ' + email + ' includes cd command (../).';
    appendToLog(logLine)

    res.status(401);
    writeResponse(res, "not authenticated");
    return false;
  }

  // check if directory exists
  directory = './data/students/' + email
  filename  = directory + '/password'

  // check if directory exists
  if (!fs.existsSync(directory)) {
    var logLine = "";
    logLine = 'INFO: |authenticate| account: ' + email + ' does not exist.';
    appendToLog(logLine);

    res.status(401);
    writeResponse(res, "not authenticated");
    return false;
  }

  // read file password file
  fs.readFile(filename,
    // callback function that is called when reading file is done
    function(err, data) {
      // error will reading password file
      if (!err) {
        real_password = data.toString('utf8').trim()
        validated = (password === real_password ? "yes" : "no")

        if (validated != "yes") {
          var logLine = 'INFO: |authenticate| Login attempt failed: wrong password for user ' + email
          appendToLog(logLine)

          res.status(401);
          writeResponse(res, "not authenticated");
          return false;
        }
        else if (validated === "yes") {

          // check user type
          fs.readFile(directory + '/type',
            // callback function that is called when reading file is done
            function(err, data) {
              if (err) {
                var logLine = 'WARNING: |authenticate| failed to read type file for user ' + email
                appendToLog(logLine)

                console.log(err)
                writeResponse(res, {err: err.toString()})
                return false
              }
              var type = "";
              if (data) {
                type = data.toString('utf8').trim()
              }

              if (type == "Administrator") {
                callback(type);
                return true;
              }
              else if (type == "Ausbilder" && minType == "Ausbilder") {
                callback(type);
                return true;
              }
              else if (type == "Ausbilder" && minType == "Schüler/Azubi") {
                callback(type);
                return true;
              }
              else if (type == minType) {
                callback(type);
                return true;
              }
              else {
                var logLine = 'WARNING: |authenticate| user ' + email + ' tried to access ' + callback.toString().split(' ')[1] + ' without permission!'
                appendToLog(logLine)

                res.status(403);
                writeResponse(res, "no permission!");
                return false;
              }
            }
          )
        }
      }
    }
  )
}

//------------------------------------------------------------------------------

app.use( parser.json() )                         // support json encoded bodies
app.use( parser.urlencoded({ extended: true }) ) // support encoded bodies
app.use( express.static('./static') )            // static files from root

app.post('/login',                                                      login)
app.get( '/overview',                                                   overview)
app.get( '/questionnaire/:profession/:qualification',                   questionnaire)
app.post('/quiz',                                                       saveQuiz)
app.post('/certificate',                                                saveCertificate)
app.post('/loadcertificate',                                            loadCertificate)
app.post('/changepassword',                                             changePassword)
app.post('/createaccount',                                              createAccount)
app.post('/getallusers',                                                getAllUsers)
app.post('/passwordreset',                                              passwordReset)
app.post('/deleteaccount',                                              deleteAccount)
app.post('/getallgroups',                                               getAllGroups)
app.post('/creategroup',                                                createGroup)
app.post('/deletegroup',                                                deleteGroup)
app.post('/editGroup',                                                  editGroup)
app.post('/savematerials',                                              saveMaterials)
app.post('/loadlogs',                                                   loadLogs)
app.post('/upload', multer({ dest: './tmp/uploaded' }).single('image'), saveUpload)
app.get( '/getimage/:profession/:qualification/:filename',              getImage)
app.post('/deleteimage',                                                deleteImage)
app.post('/updatestat',                                                 updateStat)

server = app.listen(port, () => console.log(`Server listening on port ${port}!`))
server.timeout = 5000
