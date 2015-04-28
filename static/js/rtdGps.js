var globalMap; 
var updateProcess;
var markers = [];
var circles = [];
var wokenUp = false; 
var windowOpen = false; 

//these are the options for getting the gps coordinates from the browser.
var gpsOptions = {
  enableHighAccuracy: true,
  timeout: 30000,
  maximumAge: 0
};
/////////////////////////////////////////////

var busLineSelect = document.getElementById("busLineSelect");
var toleranceSelect = document.getElementById("toleranceSelect");
var destinationSelect = document.getElementById("destinationSelect");

///////////Spinner options///////////////
var spinnerOptions = {
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
//////////////Helper Functions////////////////////////////

//calculates whether or not we're within alert range of our final stop. 
function calcDistance(loc1,loc2,tolerance) {

  var distance = google.maps.geometry.spherical.computeDistanceBetween(loc1, loc2);
  if (wokenUp == false && distance <= tolerance){

    //if the window is open, close it
    if (windowOpen){
      bootbox.hideAll();
      windowOpen = false;
    }
    // if it isn't open, open it again. 
    if (!windowOpen){
      windowOpen = true; 
      bootbox.alert("Time to wakeup! You are " + parseInt(distance,10) + " meters from the stop!", function() {
        windowOpen = false; 
        wokenUp = true;
        });
    };

    // if the distance is less than 1000 meters, call the siren
    if (distance < 1000){
      console.log(" REALLY TIME TO WAKE UP");
      document.getElementById('siren').play();
    }
    // if the distance is greater than 1000 meters but less than the tolerance, play the nicer alarm.  
    if (distance > 1000) {
      console.log("kind of need to wake up");
      document.getElementById('alarm').play();
    }
  }
  //if they are already woken up, don't do anything.
  if (wokenUp){
   
} console.log("YOU'RE AWAKE!")
  }

//clears any html options in an HTML selctbox
function removeOptions(selectbox){
    var i;
    for(i=selectbox.options.length-1;i>=1;i--){
        selectbox.remove(i);
    }
}

////////////////////////////////////////////////

//this updates the map with our new position. 
function updateMap(destination,tolerance){
  //this actually gets our location and calls the success or failure function below
  navigator.geolocation.getCurrentPosition(success, error, gpsOptions);

  //calculate our current position and run some other stuff. We might need to loop this every 10 seconds.
  function success(pos) {
    var crd = pos.coords;
    var current = new google.maps.LatLng(crd.latitude,crd.longitude);
    // globalMap.panTo(current)

    calcDistance(current,destination,tolerance);

    markers.pop().setMap(null);    
    var current_marker = new google.maps.Marker({
      position: current,
      map: globalMap,
      title:current.toString()
    }); 
    markers.push(current_marker);
    
    //this removes any old circle left behind if the map is refreshed
    if (oldCircle = circles.pop()){
      oldCircle.setMap(null);
    }
    
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
  }

  function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  }
}

/********************
This is where the Google maps is initially rendered
*********************/

function initialize(spinner,busLine,destination,tolerance) {

  //checks if an update process is already running. 
  if (updateProcess){ 
    circles = [];
    clearInterval(updateProcess);
  }

  //this is the actual location updater that kicks off the process.
  navigator.geolocation.getCurrentPosition(success, error, gpsOptions);

  function success(pos) {
    var crd = pos.coords;
    var current = new google.maps.LatLng(crd.latitude,crd.longitude);

    //the map options for google maps
    var mapOptions = {
      center: current,
      zoom: 11
    };
    globalMap = null;
    //instantiate the google map object
    globalMap = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
    spinner.stop();

    //some markers on the map
    var destinationMarker = new google.maps.Marker({
      position: destination,
      map: globalMap,
      title: "DESTINATION"
    });
    markers.push(destinationMarker);

    var current_marker = new google.maps.Marker({
      position: current,
      map: globalMap,
      title:"START"
    });
    markers.push(current_marker);

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

    /* updates the map every 5 seconds */
    updat`eProcess = setInterval(function(){
      updateMap(destination,tolerance);
    },5000);
  }
  function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  }
}


/*
Jquery stuff for when the page is loaded.
*/
$(document).ready(function(){
  //tell the spinner where to spawn. 
  var target = document.getElementById('map-canvas');

  busStopSelect.disabled = true;
  toleranceSelect.disabled = true; 
  //this is where we listen to any changes for our bus line select. 
  busLineSelect.addEventListener("change", function(){
    //data for our ajax request, we only need the busLine
    var data = {route : busLineSelect.options[busLineSelect.selectedIndex].value}
    //the body for our ajax request. this is all a json.
    $.ajax({
      url: 'stops',
      data: data,
      type: 'POST',
      success: function(response){
        //parse the response from our python server to an array of objects.
        stops = JSON.parse(response)
        //this is the form we are going to be using
        stopSelect = document.getElementById('busStopSelect');
        removeOptions(stopSelect);

        //iterate through all of the stops we just got and adds it to the form 
        for (stop of stops){
          var routeString = route.properties.ROUTE

          var value = document.createElement("OPTION");
          //create a stirng for our value that is a json of latitude and logitude. 
          var valueCoordinates = JSON.stringify({latitude : stop.properties.LAT, longitude : stop.properties.LONG});
          value.setAttribute("value", valueCoordinates);

          var text = document.createTextNode(stop.properties.STOPNAME);
          value.appendChild(text);

          stopSelect.appendChild(value);
        }
      },
      error: function(error){
        console.log(error);
      }
    })
  //once it's been populated, we can reenable our busStop selector
  busStopSelect.disabled = false;
  })
  
  //here is another basic listener for our busStop box. 
  busStopSelect.addEventListener("change", function (){
    toleranceSelect.disabled = false;
  })

  var button = document.getElementById('startButton');

  button.addEventListener("click", function(){ 

    var busLine = busLineSelect.options[busLineSelect.selectedIndex].value;
    var destinationOption = busStopSelect.options[busStopSelect.selectedIndex].value;
    var destinationCoord = JSON.parse(busStopSelect.value);
    var tolerance = parseInt(toleranceSelect.options[toleranceSelect.selectedIndex].value,10);

    //check if all of the boxes have been filled first 
    if (busLine && destinationOption && destinationCoord && !isNaN(tolerance)) {
      //read the coordiantes of our option and create the destination google maps object to pass to our initializer. 
      var destinationStop = new google.maps.LatLng(destinationCoord.latitude,destinationCoord.longitude);
      //create the spinner for us to put while the map is loading. 
      var spinner = new Spinner(spinnerOptions).spin(target);
      //run the initializer feature to create the map 
      initialize(spinner,busLine,destinationStop,tolerance);
    }
    else {
      alert("Selection unfilled!");
    }
  });
});