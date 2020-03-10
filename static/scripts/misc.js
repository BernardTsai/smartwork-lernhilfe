//------------------------------------------------------------------------------

// loadData: loads json data from a URL via http method and returns an object
function loadData(method, url) {
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

//------------------------------------------------------------------------------
