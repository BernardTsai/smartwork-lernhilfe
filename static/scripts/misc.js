//------------------------------------------------------------------------------

// loadData: loads json data from a URL via http method and returns an object
function loadDataOLD(method, url) {
  var request = new XMLHttpRequest();

  request.open(method, url, false)  // synchronous request
  request.send(null)

  if (request.status === 200) {
    result = jsyaml.safeLoad(request.responseText)

    return result
  } else {
    return {}
  }
}

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
