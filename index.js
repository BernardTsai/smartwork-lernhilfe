const yaml    = require('js-yaml')
const express = require('express')
const parser  = require('body-parser')
const fs      = require('fs')
const del     = require('del')
const multer  = require('multer')
const http    = require('http')
const https   = require('https')
const bcrypt  = require('bcrypt')
const jwt     = require('jsonwebtoken')
const app     = express()

//------------------------------------------------------------------------------

//read config.json
const config = JSON.parse(fs.readFileSync('config.json'));

const JWT_SECRET = process.env.JWT_SECRET || config.jwtSecret;
const HTTP_PORT  = process.env.HTTP_PORT  || config.httpPort;
const HTTPS_PORT = process.env.HTTPS_PORT || config.httpsPort;
const USERS_PATH = process.env.USERS_PATH || config.usersPath;

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

function appendToLog(line, req) {
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

  var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || req.socket.remoteAddress
  line += " - requesting IP Address: " + ip;

  log.write(formattedTime + '  ' + line + '\n')
}

//------------------------------------------------------------------------------

function loadLogs(req, res) {
  var log      = req.body.log      ? req.body.log      : ""
  const { email, type } = req.decoded

  if (type == "Administrator") {

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
            appendToLog(logLine, req)

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
            appendToLog(logLine, req)

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

  } else {
    var logLine = 'WARNING: |loadLogs| user ' + req.decoded.email + ' tried to access logs without permission!'
    appendToLog(logLine, req)

    res.status(403);
    writeResponse(res, "no permission!");
    return false;
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
  file          = req.params["file"] ? req.params["file"] : "questions"

  if(file != "settings" && file != "questions") {
    var logLine = 'WARNING: |questionnaire| load file. Wrong file requested: ' + file
    appendToLog(logLine, req)

    response = "no permission"
    res.status(403);
    writeResponse(res, response)
    return
  }

  directory = './data/materials/profession-' + profession + "/qualification-" + qualification
  filename  = directory + '/' + file + '.yaml'
  response  = {}

  // read overview information
  fs.readFile(filename,
    // callback function that is called when reading file is done
    function(err, data) {
      if (err) {
        console.log(err)

        var logLine = 'ERROR: |questionnaire| load questions Err: ' + err.toString()
        appendToLog(logLine, req)

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
        appendToLog(logLine, req)

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
    appendToLog(logLine, req)

    writeResponse(res, {success: 'no', err: 'certificate already exists'})
    return
  }

  try {
    fs.writeFileSync(filename, yaml.safeDump(quiz))
  }
  catch (e) {
    var logLine = 'ERROR: |saveQuiz| unable to save certificate-' + profession + "-" + qualification + ' for user ' + email + '. Err: ' + e.toString()
    appendToLog(logLine, req)

    writeResponse(res, {success: 'no', err: e.toString()})
    return
  }

  writeResponse(res, {success: 'yes', err: ''})
}

//------------------------------------------------------------------------------

// Create a route to handle user registration
function createAccount(req, res) {
  // Extract the username and password from the request body
  const { emailNew, passwordNew, typeNew } = req.body;
  const { email, type } = req.decoded;
  response = {
    'email':     "email",
    'password':  "password",
    'msg':       "error"
  }

  if (typeNew == "Administrator" && type != "Administrator") {
    var logLine = 'WARNING: |createAccount| Requesting user ' + email + ' does not have permission to create Administrator accounts'
    appendToLog(logLine, req)

    response.msg = "no permission"
    res.status(403);
    writeResponse(res, response)
    return
  }

  else if (type == "Ausbilder" || type == "Administrator") {
    // check if emailNew is valid and passwordNew has been defined
    if (emailNew == '' || passwordNew == '' || typeNew == ''  || emailNew.includes('..') || emailNew.includes('/')) {
      var logLine = 'WARNING: |createAccount| Possible manipulation attempt detected: User to create includes cd command (../) or is empty. Requesting user: ' + email + ' tried to create ' + emailNew
      appendToLog(logLine, req)

      writeResponse(res, response)
      return
    }

    // Check if the user already exists
    const directory = `${USERS_PATH}/${emailNew}`
    const filePath = directory + `/user.json`;
    if (fs.existsSync(directory)) {
      var logLine = 'WARNING: |createAccount| Account creation denied: ' + emailNew + ' already exists. Requesting user: ' + req.decoded.email
      appendToLog(logLine, req)
      return res.status(400).json({ message: "User already taken" });
    }

    // Hash the password
    bcrypt.hash(passwordNew, 10, (err, hash) => {
      if (err) {
        // If there was an error hashing the password, send a 500 status code with the error message
        res.status(500).send({ message: err.message });
        return;
      }

      // Create the user's directory
      fs.mkdirSync(directory);
      fs.mkdirSync(directory + '/certificates')

      // Create new user Object
      const user = {
        email: emailNew,
        password: hash,
        type: typeNew,
      };

      // write the user object to the file
      fs.writeFileSync(filePath, JSON.stringify(user));

      var logLine = 'INFO: |createAccount| new account created ' + emailNew + '. Requesting user: ' //+ email
      appendToLog(logLine, req)

      // Respond with a success message
      response.msg = "account created"
      response.email = emailNew
      response.password = passwordNew
      writeResponse(res, response)
    });
  } else {
    var logLine = 'WARNING: |createAccount| Requesting user ' + email + ' does not have permission to create accounts'
    appendToLog(logLine, req)

    response.msg = "no permission"
    res.status(403);
    writeResponse(res, response)
    return
  }
}

//------------------------------------------------------------------------------

function login(req, res) {
  // Extract the username and password from the request body
  username = req.body.email    ? req.body.email    : ""
  password = req.body.password ? req.body.password : ""

  response = {
    'email':     username,
    'password':  password,
    'type':      "",
    'validated': "no",
    'token':     ""
  }

  // check if email is valid and password has been defined
  if (username == '' || password == '' || username.includes('..') || username.includes('/')) {
    var logLine = "";
    if (username == '') logLine = 'INFO: |login| email is empty.';
    else if (password == '') logLine = 'INFO: |login| password for user ' + username + ' was empty.';
    else logLine = 'WARNING: |login| possible manipulation attempt detected! Email: ' + username + ' includes cd command (../).';
    appendToLog(logLine, req)

    writeResponse(res, response)
    return
  }

  // Wir suchen die Benutzerdatei mit dem eingegebenen Benutzernamen
  const directory = `${USERS_PATH}/${username}`
  const filePath = directory + `/user.json`;
  const userData = fs.readFileSync(filePath);
  const user = JSON.parse(userData);

  // Wenn der Benutzer nicht gefunden wurde, senden wir eine Fehlermeldung zurück
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Compare the provided password to the stored hash
  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      // If there was an error comparing the passwords, send a 500 status code with the error message
      res.status(500).send({ message: err.message });
      return;
    }

    if (!result) {
      // If the passwords do not match, send a 401 status code with an error message
      var logLine = 'INFO: |login| Login attempt failed: wrong password for user ' + username
      appendToLog(logLine, req)
      res.status(401).send({ message: 'Incorrect username or password' });
      return;
    }

    // If the passwords match, create a JSON Web Token
    const token = jwt.sign({ email: username, type: user.type }, JWT_SECRET);

    response.type = user.type;
    response.validated = "yes";
    response.token = token;

    // Send the token back to the client
    writeResponse(res, response)

  });
}

//------------------------------------------------------------------------------

function changePassword(req, res) {
  email = req.decoded.email ? req.decoded.email : ""
  newPassword = req.body.newpassword ? req.body.newpassword : ""
  response = {
    'email':     email,
    'password':  "",
    'validated': "no",
    'success':   "no"
  }

  if (newPassword == '') {
    var logLine = 'INFO: |changePassword| ' + email + ' -> new password is empty.'
    appendToLog(logLine, req)

    writeResponse(res, response)
    return
  }

  // Wir suchen die Benutzerdatei mit dem eingegebenen Benutzernamen
  const directory = `${USERS_PATH}/${email}`
  const filePath = directory + `/user.json`;
  const userData = fs.readFileSync(filePath);
  const user = JSON.parse(userData);

  // Hash the new password
  bcrypt.hash(newPassword, 10, (err, hash) => {
    if (err) {
      // If there was an error hashing the password, send a 500 status code with the error message
      res.status(500).send({ message: err.message });
      return;
    }

    // replace password hash
    user.password = hash;

    // write the user object to the file
    fs.writeFileSync(filePath, JSON.stringify(user));

    var logLine = 'INFO: |changePassword| Password changed! Requesting user: ' + email
    appendToLog(logLine, req)

    // Respond with a success message
    response.password = newPassword
    response.validated = "yes"
    response.success = "yes"
    writeResponse(res, response)
  });

}

//------------------------------------------------------------------------------

function passwordReset(req, res) {
  email       = req.decoded.email ? req.decoded.email : ""
  type        = req.decoded.type  ? req.decoded.type  : ""
  emailTar    = req.body.emailTar    ? req.body.emailTar    : ""
  passwordTar = req.body.passwordTar ? req.body.passwordTar : ""
  response = {
    'email':     email,
    'password':  "",
    'msg':   "error"
  }

  // check if emailNew is valid and passwordNew has been defined
  if (emailTar == '' || passwordTar == '' || emailTar.includes('..') || emailTar.includes('/')) {
    var logLine = 'WARNING: |passwordReset| Target user ' + emailTar + ' includes cd command (../) or is empty or passsword is empty. Requesting user: ' + email
    appendToLog(logLine, req)

    writeResponse(res, response)
    return
  }

  // check if user exists and load user data
  const directory = `${USERS_PATH}/${emailTar}`
  if (!fs.existsSync(directory)) {
    var logLine = 'WARNING: |passwordReset| Password reset denied: ' + emailTar + ' does not exist. Requesting user: ' + email
    appendToLog(logLine, req)
    return res.status(400).json({ message: "User not found" });
  }
  const filePath = directory + `/user.json`;
  const userData = fs.readFileSync(filePath);
  const userTar = JSON.parse(userData);

  // stop others from resetting Admin passwords
  if (userTar.type == "Administrator" && type == "Ausbilder") {
    var logLine = 'WARNING: |passwordReset| reset denied. Requesting user ' + email + ' with type Ausbilder tried to reset admin password of ' + emailTar
    appendToLog(logLine, req)

    response.msg = "no permission"
    res.status(403);
    writeResponse(res, response)
    return
  }

  // only Admin and instructors have permission to reset pw
  if (type == "Ausbilder" || type == "Administrator") {
    // Hash the new password
    bcrypt.hash(passwordTar, 10, (err, hash) => {
      if (err) {
        // If there was an error hashing the password, send a 500 status code with the error message
        res.status(500).send({ message: err.message });
        return;
      }

      // replace password hash
      userTar.password = hash;

      // write the user object to the file
      fs.writeFileSync(filePath, JSON.stringify(userTar));

      var logLine = 'INFO: |changePassword| Password of user: ' + userTar.email  + 'changed! Requesting user: ' + email
      appendToLog(logLine, req)

      // Respond with a success message
      response.msg = "success"
      response.email = userTar.email
      response.password = passwordTar
      writeResponse(res, response)
      return
    });
  }else {
    var logLine = 'WARNING: |passwordReset| Requesting user ' + email + ' does not have permission to reset passwords!'
    appendToLog(logLine, req)

    response.msg = "no permission"
    res.status(403);
    writeResponse(res, response)
    return
  }
}

//------------------------------------------------------------------------------

function deleteAccount(req, res) {
  emailReq    = req.decoded.email
  typeReq     = req.decoded.type
  emailTar    = req.body.emailTar    ? req.body.emailTar    : ""
  response = {
    'email':     emailReq,
    'msg':       "error"
  }

  // check if emailTar is valid
  if (emailTar == '' || emailTar.includes('..') || emailTar.includes('/')) {
    var logLine = 'WARNING: |deleteAccount| target user ' + emailTar + ' includes cd command (../) or is empty. Requesting user: ' + emailReq
    appendToLog(logLine, req)

    writeResponse(res, response)
    return
  }

  // check if user exists and load user data
  const directory = `${USERS_PATH}/${emailTar}`
  if (!fs.existsSync(directory)) {
    var logLine = 'WARNING: |deleteAccount| User: ' + emailTar + ' does not exist. Requesting user: ' + email
    appendToLog(logLine, req)
    return res.status(400).json({ message: "User not found" });
  }
  const filePath = directory + `/user.json`;
  const userData = fs.readFileSync(filePath);
  const userTar = JSON.parse(userData);

  // stop others from deleting an Admin account
  if (userTar.type == "Administrator" && typeReq == "Ausbilder") {
    var logLine = 'WARNING: |deleteAccount| denied. Requesting user ' + emailReq + ' tried to delete admin account: ' + emailTar
    appendToLog(logLine, req)

    response.msg = "no permission"
    res.status(403);
    writeResponse(res, response)
    return
  }

  // only allow deletion if permissions are granted
  if (typeReq == "Ausbilder" || typeReq == "Administrator") {
    // delete directory recursively
    (async () => {
      try {
        await del(directory);

        console.log(`${directory} is deleted!`);

        response.msg = "success"
        response.email = ""
        response.password = ""

      } catch (err) {
        console.error(`Error while deleting ${directory}.`);
        console.error({err: err.toString()});

        var logLine = 'ERROR: |deleteAccount| failed to remove user ' + emailTar + '. Requesting user: ' + emailReq + '. Err: ' + err.toString()
        appendToLog(logLine, req)

        response.msg = "failed"
        response.email = ""
        response.password = ""

        writeResponse(res, response)
        return
      }
      var logLine = 'INFO: |deleteAccount| removed user ' + emailTar + ' successfully. Requesting user: ' + emailReq
      appendToLog(logLine, req)

      writeResponse(res, response)
      return
    })();
  } else {
    var logLine = 'WARNING: |deleteAccount| Requesting user ' + emailReq + ' does not have permission to delete accounts'
    appendToLog(logLine, req)

    response.msg = "no permission"
    res.status(403);
    writeResponse(res, response)
    return
  }
}

//------------------------------------------------------------------------------

function getAllUsers(req, res) {
  response = {}

  directory = './data/students/'

  fs.readdir(directory,
    function (err, files) {
      if (err) {
        var logLine = 'ERROR: |getAllUsers| failed to read directory ' + directory + ' Err: ' + err.toString()
        appendToLog(logLine, req)

        console.log('Unable to scan directory: ' + err)
        writeResponse(res, {err: err.toString()})
        return
      }
      if (files) {
        //listing all files using forEach
        response = files
        files.forEach(function (file, index) {

          // read type file of user
          fs.readFile(directory + file + '/user.json',
            // callback function that is called when reading file is done
            function (err, data) {
              // error will reading type files
              if (!err) {
                response[index] = {
                  'email': file,
                  'type': JSON.parse(data).type
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
  response = {}

  directory = './data/groups/'

  fs.readdir(directory,
    function (err, files) {
      if (err) {
        var logLine = 'ERROR: |getAllGroups| failed to read directory ' + directory + ' Err: ' + err.toString()
        appendToLog(logLine, req)

        console.log('Unable to scan directory: ' + err)
        writeResponse(res, {err: err.toString()})
        return
      }
      if (files) {
        //listing all files using forEach
        response = files
        files.forEach(function (file, index) {
          // read group files
          var data = fs.readFileSync(directory + file, 'utf8');
          response[index] = {
            'groupName': file,
            'members':   data.toString('utf8')
          }
        })
        writeResponse(res, response);
      }
    }
  )
}

//------------------------------------------------------------------------------

function createGroup(req, res) {
  members   = req.body.members   ? req.body.members   : ""
  groupName = req.body.groupName ? req.body.groupName : ""
  const { email, type } = req.decoded
  response = {
    'groupName': groupName,
    'members':   members,
    'msg':       "error"
  }

  if (type == "Ausbilder" || type == "Administrator") {
    // check if groupName is valid has been defined
    if (members == '' || groupName == ''  || groupName.includes('..') || groupName.includes('/')) {
      var logLine = 'ERROR: |createGroup| no groupName and/or members defined and/or groupName includes cd command (../)'
      appendToLog(logLine, req)

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
        appendToLog(logLine, req)

        writeResponse(res, {err: e.toString()})
        return
      }

      var logLine = 'INFO: |createGroup| added group ' + groupName + ' successfully. Requesting user: ' + email
      appendToLog(logLine, req)

      response.msg = "success"
      response.groupName = groupName
      response.members = members
      writeResponse(res, response)
      return
    }
    // if group already exists
    else {
      var logLine = 'WARNING: |createGroup| denied. Group ' + groupName + ' already exists.'
      appendToLog(logLine, req)

      response.msg = "group already exists"
      writeResponse(res, response)
      return
    }
  } else {
    var logLine = 'WARNING: |createGroup| user ' + email + ' tried to create a group without permission!'
    appendToLog(logLine, req)

    res.status(403);
    writeResponse(res, "no permission!");
    return false;
  }

}

//------------------------------------------------------------------------------

function deleteGroup(req, res) {
  groupName      = req.body.groupName   ? req.body.groupName   : ""
  const { email, type } = req.decoded;
  response = {
    'email':     email,
    'msg':       "error"
  }

  if (type == "Ausbilder" || type == "Administrator") {
    // check if groupName is valid
    if (groupName == '' || groupName.includes('..') || groupName.includes('/')) {
      var logLine = 'WARNING: |deleteGroup| possible manipulation attempt detected. GroupName ' + groupName + ' contains cd command (../) or is empty.'
      appendToLog(logLine, req)

      writeResponse(res, response)
      return
    }

    if (type == "Schüler/Azubi") {
      var logLine = 'WARNING: |deleteGroup| possible manipulation attempt detected. User ' + email + ' does not have permission to delete groups.'
      appendToLog(logLine, req)

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

      } catch(err) {
         var logLine = 'ERROR: |deleteGroup| failed to remove group ' + groupName + '. Requesting user: ' + email + ' Err: ' + err.toString()
         appendToLog(logLine, req)

        console.error(err)
        writeResponse(res, {err: err.toString()})
        return
      }
      var logLine = 'INFO: |deleteGroup| removed group ' + groupName + ' successfully. Requesting user: ' + email
      appendToLog(logLine, req)

      response.msg = "success"
      writeResponse(res, response)
      return
    }
    else {
      var logLine = 'ERROR: |deleteGroup| group ' + groupName + ' does not exist. Requesting user: ' + email
      appendToLog(logLine, req)

      response.msg = "error: groups doesn't exist"
      writeResponse(res, response)
      return
    }
  } else {
    var logLine = 'WARNING: |deleteGroup| user ' + email + ' tried to delete the group ' + groupName + ' without permission!'
    appendToLog(logLine, req)

    res.status(403);
    writeResponse(res, "no permission!");
    return false;
  }
}

//------------------------------------------------------------------------------

function editGroup(req, res) {
  groupName = req.body.groupName ? req.body.groupName : ""
  groupNew  = req.body.data      ? req.body.data      : ""
  const { email, type } = req.decoded
  response = {
    'success': "no",
    'msg':     ""
  }

  if (type == "Ausbilder" || type == "Administrator") {
    // check if groupName is valid and has been defined
    if (groupName == '' || groupName.includes('..') || groupName.includes('/')) {
      var logLine = 'WARNING: |editGroup| possible manipulation attempt detected. Group ' + groupName + ' contains cd command (../) or is empty.'
      appendToLog(logLine, req)

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

            group = groupNew

            try {
              fs.writeFileSync(filename, yaml.safeDump(group))
              response.success = "yes"
            }
            catch (e) {
              var logLine = 'ERROR: |editGroup| failed to save file for group ' + groupName + '. Requesting user: ' + email + 'Err: ' + e.toString()
              appendToLog(logLine, req)

              writeResponse(res, {err: e.toString()})
              return
            }
          }
          var logLine = 'INFO: |editGroup| edited group ' + groupName + ' successfully. Requesting user: ' + email
          appendToLog(logLine, req)

          writeResponse(res, response)
        }
      )
    }
  } else {
    var logLine = 'WARNING: |editGroup| user ' + email + ' tried to edit the group ' + groupName + ' without permission!'
    appendToLog(logLine, req)

    res.status(403);
    writeResponse(res, "no permission!");
    return false;
  }
}

//------------------------------------------------------------------------------

function saveCertificate(req, res) {
  var certs  = req.body.certs  ? req.body.certs  : ""
  var email = req.body.email ? req.body.email : ""

  // check if email and certs have been defined
  if (email == "" || certs == "") {
    var logLine = 'WARNING: |saveCertificate| possible manipulation attempt detected. User ' + email + ' or certs is empty.'
    appendToLog(logLine, req)

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
    appendToLog(logLine, req)

    writeResponse(res, {err: e.toString()})
    return
  }

   var logLine = 'INFO: |saveCertificate| final certificate-' + certs.profession + ' created successfully for user: ' + email
   appendToLog(logLine, req)

  writeResponse(res, {err: ''})
}

//------------------------------------------------------------------------------

function loadCertificate(req, res) {
  var cert  = req.body.cert  ? req.body.cert  : ""
  var email = req.body.email ? req.body.email : ""

  // check if email has been defined
  if (email == "") {
    var logLine = 'WARNING: |loadCertificate| possible manipulation attempt detected. User ' + email + ' is empty.'
    appendToLog(logLine, req)

    writeResponse(res, {err: 'missing parameter'})
    return
  }

  // check cert for change dir i.e. if cert includes '../' and abort if true
  if (cert.includes('../')) {
    var logLine = 'WARNING: |loadCertificate| possible manipulation attempt detected. cert ' + cert + ' includes cd command (../).'
    appendToLog(logLine, req)

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
           appendToLog(logLine, req)

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
           appendToLog(logLine, req)

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
  const { email, type } = req.decoded
  var profession    = req.body.profession    ? req.body.profession    : ""
  var qualification = req.body.qualification ? req.body.qualification : ""
  var materials     = req.body.materials     ? req.body.materials     : ""
  var quizSettings  = req.body.settings      ? req.body.settings      : ""
  response = {
    'success': false,
    'msg':     ""
  }

  if (type == "Ausbilder" || type == "Administrator") {
    if (profession == "" || qualification == "") {
      var logLine = 'ERROR: |saveMaterials| profession and/or qualification not defined!'
      appendToLog(logLine, req)

      writeResponse(res, {err: 'missing parameters'})
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

    // write questions.yaml file
    try {
      fs.writeFileSync(filename, yaml.safeDump(materials))
    }
    catch (e) {
      var logLine = 'ERROR: |saveMaterials| failed to write file ' + filename + '. Requesting user: ' + email + '. Err: ' + e.toString()
      appendToLog(logLine, req)

      writeResponse(res, {err: e.toString()})
      return
    }


    // save quiz settings
    filename = directory + '/settings.yaml'

    // check if directory exists
    if (!fs.existsSync(directory)) {
      // create directory
      fs.mkdirSync(directory)
    }

    // write settings.yaml file
    try {
      fs.writeFileSync(filename, yaml.safeDump(quizSettings))
    }
    catch (e) {
      var logLine = 'ERROR: |saveMaterials| failed to write file ' + filename + '. Requesting user: ' + email + '. Err: ' + e.toString()
      appendToLog(logLine, req)

      writeResponse(res, {err: e.toString()})
      return
    }

    var logLine = 'INFO: |saveMaterials| saved ' + filename + ' successfully. Requesting user: ' + email
    appendToLog(logLine, req)

    response.success = true
    writeResponse(res, response)
    return

  } else {
    var logLine = 'WARNING: |saveMaterials| user ' + email + ' tried to edit material without permission!'
    appendToLog(logLine, req)

    res.status(403);
    writeResponse(res, "no permission!");
    return false;
  }
}

//------------------------------------------------------------------------------



//------------------------------------------------------------------------------

function saveUpload(req, res, next) {
  var user = yaml.safeLoad(req.body.user);
  var quiz = yaml.safeLoad(req.body.quiz);

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
  const { email, type } = req.decoded
  profession     = req.body.profession    ? req.body.profession    : ""
  qualification  = req.body.qualification ? req.body.qualification : ""
  imageName      = req.body.imageName     ? req.body.imageName     : ""
  response = {
    'email':     email,
    'msg':       "error"
  }

  if (type == "Ausbilder" || type == "Administrator") {
    // check if imageName is valid and has been defined
    if (imageName == '' || imageName.includes('..') || imageName.includes('/')) {
      var logLine = 'WARNING: |deleteImage| possible manipulation attempt detected. ImageName ' + imageName + ' contains cd command (../) or is empty.'
      appendToLog(logLine, req)

      writeResponse(res, response)
      return
    }

    directory = './data/materials/profession-' + profession.toString() + '/qualification-' + qualification.toString() + '/'
    filename  = directory + imageName

    // check if file exists
    if (fs.existsSync(filename)) {
      // remove image file
      try {
        fs.unlinkSync(filename)

      } catch(err) {
        var logLine = 'ERROR: |deleteImage| failed to remove file ' + imageName + '. Requesting user: ' + email + ' Err: ' + err.toString()
        appendToLog(logLine, req)

        console.error(err)
        writeResponse(res, {err: err.toString()})
        return
      }
      var logLine = 'INFO: |deleteImage| removed file ' + filename + ' successfully. Requesting user: ' + email
      appendToLog(logLine, req)

      response.msg = "success"
      writeResponse(res, response)
      return
    }
    else {
      var logLine = 'ERROR: |deleteImage| file ' + filename + ' does not exist. Requesting user: ' + email
      appendToLog(logLine, req)

      response.msg = "error: file does not exist"
      res.status(404)
      writeResponse(res, response)
      return
    }
  } else {
    var logLine = 'WARNING: |deleteImage| user ' + email + ' tried to delete an image without permission!'
    appendToLog(logLine, req)

    res.status(403);
    writeResponse(res, "no permission!");
    return false;
  }
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
          appendToLog(logLine, req)
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
            appendToLog(logLine, req)
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

app.use( parser.json() )                         // support json encoded bodies
app.use( parser.urlencoded({ extended: true }) ) // support encoded bodies
app.use( express.static('./static') )            // static files from root

// Add headers
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Pass to next layer of middleware
  next();
})

// redirect http to https
app.use((req, res, next) => {
  req.secure ? next() : res.redirect('https://' + req.headers.host + req.url)
})


// exclude /login from jwt  validation
app.post('/login',                                                      login)
app.get( '/overview',                                                   overview)
app.get( '/getimage/:profession/:qualification/:filename',              getImage)

// Create a route to validate JSON web tokens
app.use((req, res, next) => {
//  console.log(`${req.method} ${req.url}`);
  // Extract the token from the request header
  const token = req.headers.authorization;
  if (!token) {
    console.log("validate: no token provided");
    console.log(`${req.method} ${req.url}`);
    // If no token was provided, send a 401 status code with an error message
    res.status(401).send({ message: 'No token provided' });
    return;
  }

  // Verify the token using the secret
  jwt.verify(token.split(" ")[1], JWT_SECRET, (err, decoded) => {
    if (err) {
      // If the token is invalid, send a 401 status code with an error message
      res.status(401).send({ message: 'Token is invalid' });
      return;
    }

    // If the token is valid, attach the decoded token to the request object
    req.decoded = decoded;

    // Call the next middleware function
    next();
  });
});

app.get( '/questionnaire/:profession/:qualification',                   questionnaire)
app.get( '/questionnaire/:profession/:qualification/:file',             questionnaire)
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
app.post('/deleteimage',                                                deleteImage)
app.post('/updatestat',                                                 updateStat)

const privateKey = fs.readFileSync('/root/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/root/cert.pem', 'utf8');
const ca = fs.readFileSync('/root/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

http.createServer(app).listen(HTTP_PORT, () => console.log(`http server is running on port ${HTTP_PORT}`))
https.createServer(credentials, app).listen(HTTPS_PORT, () => console.log(`https server is running at port ${HTTPS_PORT}`))
//server = app.listen(port, () => console.log(`Server listening on port ${port}!`))
//server.timeout = 5000
