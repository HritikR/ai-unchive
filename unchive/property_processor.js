this.addEventListener('message', function(e) {
  var type = e.data.type;
  var propertyJSON = e.data.propertyJson;
  var customJSON = e.data.customJSON;

  this.postMessage({'properties' : []});
}, false);
