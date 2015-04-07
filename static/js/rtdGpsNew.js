////////////////////////////////////////////
//Declare global vars here. Remove these in future
var globalMap; 
var markers = [];

//our bv_stops, a dictionary of the stops
// see http://www3.rtd-denver.com/schedules/getSchedule.action?routeId=BV for stops
// see http://www.latlong.net/ for coordinates
var bv_stops = {
    'boulder_transit_center' : new google.maps.LatLng(40.017103,-105.276444),
    'broadway_16th' : new google.maps.LatLng(40.005663,-105.272381),
    'broadway_27th' : new google.maps.LatLng(39.996074,-105.261018),
    'table_mesa_pr' : new google.maps.LatLng(39.986404, -105.233055),
    'mcaslin_pr'    : new google.maps.LatLng(39.959366, -105.167381),
    'flatiron_circle_pr' : new google.maps.LatLng(39.933660, -105.122424),
    'church_ranch_pr' : new google.maps.LatLng(39.888028, -105.073054),
    'wewatta_21st' : new google.maps.LatLng(39.756907, -104.996797),
    'union_station' : new google.maps.LatLng(39.752651, -105.001685)
}

var destination = bv_stops['broadway_27th'];

//these are the options for getting the gps coordinates 
var options = {
  enableHighAccuracy: true,
  timeout: 30000,
  maximumAge: 0
};
/////////////////////////////////////////////


// a simple wrapper function around computeDistance that takes a tolerance. EVERYTHING IN METERS
function calcDistance(loc1,loc2) {

  var toleranceSelect = document.getElementById("toleranceSelect");
  var tolerance = toleranceSelect.options[toleranceSelect.selectedIndex].value;

  var distance = google.maps.geometry.spherical.computeDistanceBetween(loc1, loc2);
  if (distance <= tolerance)
    //make a noise
    console.log("TIME TO WAKE UP");
  else
    console.log("Everything ok");
}

//this updates the map with our new position. 
function updateMap(){
  //calculate our current position and run some other stuff. We might need to loop this every 10 seconds.
  function success(pos) {
    
    var crd = pos.coords;

    var current = new google.maps.LatLng(crd.latitude,crd.longitude);
    globalMap.panTo(current)

    calcDistance(current,destination);
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
};

/********************
This is where the Google maps is actually rendered
*********************/

$(document).ready(function(){

  var busLineSelect = document.getElementById("busLineSelect");
  var busLine = busLineSelect.options[busLineSelect.selectedIndex].value;

  var destinationSelect = document.getElementById("destinationSelect");
  var destination = destinationSelect.options[destinationSelect.selectedIndex].value;

  var toleranceSelect = document.getElementById("toleranceSelect");
  var tolerance = toleranceSelect.options[toleranceSelect.selectedIndex].value;

  //google.maps.event.addDomListener(window, 'load', initialize);

  google.maps.event.addDomListener(toleranceSelect, 'click', function() {
      if (this.value != "") {
              // get the value of the select box #country and set the map center to this
              initialize();
      }
  });


  function initialize() {
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
      console.log(markers)
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

    /* updates the map every 5 seconds */
    window.setInterval(function(){
      updateMap()   
    },5000);
  }
});

