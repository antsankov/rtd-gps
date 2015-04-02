var globalMap; 
var markers = [];

//our destinations, a dictionary of the stops
var destinations = {
    'boulder_transit_center' : new google.maps.LatLng(40.017103,-105.276444),
    'broadway_16th' : new google.maps.LatLng(40.005663,-105.272381),
    'broadway_27th' : new google.maps.LatLng(39.996074,-105.261018)
}

var destination = destinations['broadway_27th'];

//these are the options for getting the gps coordinates 
var options = {
  enableHighAccuracy: true,
  timeout: 30000,
  maximumAge: 0
};

// a simple wrapper function around computeDistance that takes a tolerance. EVERYTHING IN METERS
function calcDistance(loc1,loc2,tolerance) {
  var distance = google.maps.geometry.spherical.computeDistanceBetween(loc1, loc2);
  if (distance <= tolerance)
    console.log("TIME TO WAKE UP");
  else
    console.log("Everything ok");
}

function initializeMap(){ 
  function success(pos) {
    var crd = pos.coords;
    var current = new google.maps.LatLng(crd.latitude,crd.longitude);

    //the map options for google maps
    var mapOptions = {
      center: current,
      zoom: 14
    }

    //instantiate the google map object
    globalMap = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);

    //some markers on the map
    var destinationMarker = new google.maps.Marker({
      position: destination,
      map: globalMap,
      title: "Where I am going!"
    });
    markers.push(destinationMarker)

    var current_marker = new google.maps.Marker({
      position: current,
      map: globalMap,
      title:"Hello World!"
    });
    markers.push(current_marker)
    
  };

  function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  };
  navigator.geolocation.getCurrentPosition(success, error, options);
}

//this is where we make the actual map
function updateMap(){
  //calculate our current position and run some other stuff. We might need to loop this every 10 seconds.
  function success(pos) {
    
    var crd = pos.coords;

    var current = new google.maps.LatLng(crd.latitude,crd.longitude);
    globalMap.panTo(current)

    calcDistance(current,destination,500)
    console.log(crd.latitude);
   
    markers.pop().setMap(null);
    
    var current_marker = new google.maps.Marker({
      position: current,
      map: globalMap,
      title:current.toString()
    }); 
    markers.push(current_marker);
  };

  function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  };
  //this actually gets our location
  navigator.geolocation.getCurrentPosition(success, error, options);
}

google.maps.event.addDomListener(window, 'load', initializeMap());

window.setInterval(function(){
    //this updates the map every 5 seconds
    updateMap()   
},5000);
