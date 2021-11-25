//------------------------------------------------------------------------------

// loadData: loads json data from a URL via http method and returns an object
function loadData(method, url, params) {
  var request = new XMLHttpRequest();

  request.open(method, url, false)  // synchronous request
  if (method == "POST") request.setRequestHeader('Content-type', 'application/json');
  request.send(params)

  if (request.status === 200) {
    result = jsyaml.safeLoad(request.responseText)

    return result
  } else {
    return {}
  }
}

//------------------------------------------------------------------------------

// loadCerts: get list of all certificates
function loadCerts(email) {
  var paramEmail  = email ? email : model.email

  var request = new XMLHttpRequest();
  // callback function to process the results
  function loadCertCB() {
    if (this.readyState == 4) {
      // check status
      if (this.status != 200) {
        return
      }
      // check if user has certificates at all
      if (request.responseText.indexOf("no such file or directory") > -1) {
        model.certificates = []
        return
      }
      // modify responseText to correctly populate model.certificates
      var certTmp = request.responseText
      certTmp = certTmp.replace(/\n/g, "")
      certTmp = certTmp.replace(/- /g, '"\n- certificate: {}\n  filename: "')
      certTmp = certTmp.replace('"', '')
      certTmp += '"'

      model.certificates = jsyaml.safeLoad(certTmp)
//      console.log(request.responseText)
    }
  }
  // issue request to server backend
  var params  = JSON.stringify( { cert: '', email: paramEmail } )

  request.onreadystatechange = loadCertCB
  request.open('POST', '/loadcertificate', false);  // synchronous request
  request.setRequestHeader('Content-type', 'application/json');
  request.send(params);
}

//------------------------------------------------------------------------------

// loadCert: load all certificates
function loadCert(email) {
  var paramEmail  = email ? email : model.email

  var request = new XMLHttpRequest();
  for (var i = 0; i < this.model.certificates.length; i++) {
    var params  = JSON.stringify( { cert: this.model.certificates[i].filename, email: paramEmail } )
    this.model.certificates[i].certificate = loadData('POST', '/loadcertificate', params);
  }
}

//------------------------------------------------------------------------------

// get all professions for which a certificate exists
function getProfessions() {
  var professions = [];
  var professionTmp;
  if (this.model.certificates.includes('no certificates found')) {
    this.model.certificates = []
    this.model.certs_p = []
    return;
  }

  for (var i = 0; i < this.model.certificates.length; i++) {
    if (this.model.certificates[i].filename.includes('final-certificate-')) {
      professionTmp = this.model.certificates[i].filename[18];
      // check professions to avoid dublicates
      var found = false;
      for (var j = 0; j < professions.length; j++) {
        if (professions[j] == professionTmp) found = true;
      }
      if (!found) professions.push(professionTmp);
    }
    else if (this.model.certificates[i].filename.includes('certificate-')) {
      professionTmp = this.model.certificates[i].filename[12];
      // check professions to avoid dublicates
      var found = false;
      for (var j = 0; j < professions.length; j++) {
        if (professions[j] == professionTmp) found = true;
      }
      if (!found) professions.push(professionTmp);
    }
  }
//  console.log(professions);
  this.model.certs_p = professions;
}

//------------------------------------------------------------------------------
