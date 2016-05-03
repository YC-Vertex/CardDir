var mapPrimary; // For left eye and overview
var mapSecondary; // For right eye

function initMap() {
  $(document).ready(function() {
    //TODO: Check availablity of geolocation
    
    navigator.geolocation.getCurrentPosition(function(position) {
      var latlon = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      mapPrimary = new google.maps.Map(
        document.getElementById("primary-map"), {
          zoom: 19,
          center: latlon
        });

      mapSecondary = new google.maps.Map(
        document.getElementById("secondary-map"), {
          zoom: 19,
          center: latlon
        });
    });

    //TODO: Watch Position 
  });
}
