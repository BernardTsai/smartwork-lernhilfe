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

// loadCerts: get list of all certificates
function loadCerts() {
  var request = new XMLHttpRequest();
  // callback function to process the results
  function loadCertCB() {
    if (this.readyState == 4) {
      // check status
      if (this.status != 200) {
        return
      }
      // modify responseText to correctly populate model.certificates
      // TODO: catch exception if there are no certificates!
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
  var params  = JSON.stringify( { cert: '', email: model.email } )

  request.onreadystatechange = loadCertCB
  request.open('POST', '/loadcertificate', false);  // synchronous request
  request.setRequestHeader('Content-type', 'application/json');
  request.send(params);
}

// loadCert: load all certificates
function loadCert() {
  var request = new XMLHttpRequest();
  for (var i = 0; i < this.model.certificates.length; i++) {
    var params  = JSON.stringify( { cert: this.model.certificates[i].filename, email: model.email } )
    this.model.certificates[i].certificate = loadData('POST', '/loadcertificate', params);
  }
}

//------------------------------------------------------------------------------
