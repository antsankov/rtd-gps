////////////////////////////////////////////
//Declare global vars here. Remove these in future
var globalMap; 
var markers = [];
var circles = [];

//our bv_stops, a dictionary of the stops
// see http://www3.rtd-denver.com/schedules/getSchedule.action?routeId=BV for stops
// see http://www.latlong.net/ for coordinates
var bvStops = {
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



//these are the options for getting the gps coordinates 
var options = {
  enableHighAccuracy: true,
  timeout: 30000,
  maximumAge: 0
};
/////////////////////////////////////////////

var busLineSelect = document.getElementById("busLineSelect");
var toleranceSelect = document.getElementById("toleranceSelect");
var destinationSelect = document.getElementById("destinationSelect");

///////////Spinner///////////////
var opts = {
  lines: 13, // The number of lines to draw
  length: 20, // The length of each line
  width: 10, // The line thickness
  radius: 30, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#000', // #rgb or #rrggbb or array of colors
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '50%', // Top position relative to parent
  left: '50%' // Left position relative to parent
};

// a simple wrapper function around computeDistance that takes a tolerance. EVERYTHING IN METERS
function calcDistance(loc1,loc2,tolerance) {

  var distance = google.maps.geometry.spherical.computeDistanceBetween(loc1, loc2);
  if (distance <= tolerance){
    //make a noise
    console.log("TIME TO WAKE UP")
    console.log("Distance")
    //alert("TIME TO WAKE UP");
  }
}

//this updates the map with our new position. 
function updateMap(destination,tolerance){
  //calculate our current position and run some other stuff. We might need to loop this every 10 seconds.
  function success(pos) {
    
    var crd = pos.coords;

    var current = new google.maps.LatLng(crd.latitude,crd.longitude);
    // globalMap.panTo(current)

    calcDistance(current,destination,tolerance);
    markers.pop().setMap(null);
    circles.pop().setMap(null);
    
    var current_marker = new google.maps.Marker({
      position: current,
      map: globalMap,
      title:current.toString()
    }); 

    var circleOptions = {
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          map: globalMap,
          center: current,
          radius: tolerance    
    };

    centerCircle = new google.maps.Circle(circleOptions);

    markers.push(current_marker);
    circles.push(centerCircle);
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

  var button = document.getElementById('startButton');
  console.log(button)
  //tell the spinner where to spawn. 
  var target = document.getElementById('map-canvas');



  /**************IMPORTANT*************
  THIS IS WHERE WE LISTEN TO THE 'tolearnce box' to start drawing the map!
  **************************************/

  button.addEventListener("click", function(){ 
    //create the spinner 
    var spinner = new Spinner(opts).spin(target);

    var busLine = busLineSelect.options[busLineSelect.selectedIndex].value;

    var destinationOption = destinationSelect.options[destinationSelect.selectedIndex].value;
    var destinationCoord = bvStops[destinationOption];

    var tolerance = toleranceSelect.options[toleranceSelect.selectedIndex].value;

    initialize(spinner,busLine,destinationCoord,parseInt(tolerance,10));
  });

  function initialize(spinner,busLine,destination,tolerance) {
    function success(pos) {
      var crd = pos.coords;
      var current = new google.maps.LatLng(crd.latitude,crd.longitude);

      //the map options for google maps
      var mapOptions = {
        center: current,
        zoom: 11
      }

      //instantiate the google map object
      globalMap = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
      spinner.stop()

      //some markers on the map
      var destinationMarker = new google.maps.Marker({
        position: destination,
        map: globalMap,
        title: "DESTINATION"
      });
      markers.push(destinationMarker)

      var current_marker = new google.maps.Marker({
        position: current,
        map: globalMap,
        title:"START"
      });
      markers.push(current_marker)

      var circleOptions = {
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: globalMap,
            center: current,
            radius: tolerance    
      };

      centerCircle = new google.maps.Circle(circleOptions);
      circles.push(centerCircle);


    };
    function error(err) {
      console.warn('ERROR(' + err.code + '): ' + err.message);
    };
    navigator.geolocation.getCurrentPosition(success, error, options);

    /* updates the map every 5 seconds */
    window.setInterval(function(){
      updateMap(destination,tolerance)   
    },5000);
  }
});

