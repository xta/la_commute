$(function() {

  // global

  window.Commutes = window.Commutes || {};
  Commutes.Markers = [];
  Commutes.CurrentDestination = "";

  // setup map

  var map_center = [34.0928092, -118.3286614];

  var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  });

  Commutes.Map = L.map('map', {
    center: map_center,
    zoom: 11,
    scrollWheelZoom: false,
  }).addLayer(layer);

  // add map data

  $.get('./assets/drivetime.csv', function(data) {
    handleData(data);
  }, 'text');

  // select dropdown event handler

  $( "select#destinations" ).change(function(event) {
    var selected = this.value;

    if (selected === Commutes.CurrentDestination) {
      console.log("do nothing");
      // do nothing
    } else {
      removeAllMarkers();
      addLocationsForDestination(selected);
    }
  });

  // map marker helpers

  function handleData(data) {
    Commutes.drivetimes = $.csv.toObjects(data);
    addLocationsForDestination("Downtown Los Angeles");
  }

  function addLocationsForDestination(destination) {
    for (i = 0; i < Commutes.drivetimes.length; i++) {
      var commute = Commutes.drivetimes[i];

      if (commute.To_Name === destination) {
        if (commute.From_Name === destination) {
          var destination_marker = L.marker([commute.From_GPS_X, commute.From_GPS_Y]).addTo(Commutes.Map).bindPopup(destination);
          Commutes.Markers.push(destination_marker);
        } else {
          var fromPopUpText = formatPopUpText(commute);
          addStartingLocation([commute.From_GPS_X, commute.From_GPS_Y], commute.Traffic, commute.Rounded_Traffic_Minutes, fromPopUpText);
        }
      }
    }
    Commutes.CurrentDestination = destination;
  }

  function formatPopUpText(starting_location) {
    var formatted = "<strong>";
    formatted += starting_location.From_Name;
    formatted += "</strong><br>";
    formatted += starting_location.Rounded_Distance_Miles;
    formatted += " miles (";
    formatted += starting_location.Rounded_Traffic_Minutes;
    formatted += " minutes)<br>";
    formatted += "<em>with ";
    formatted += starting_location.Description;
    formatted += "</em>";
    return formatted;
  }

  function addStartingLocation(location, labelClass, labelText, popUpText) {
    var icon = L.divIcon({
      className: labelClass,
      html: labelText
    });

    var start_marker = L.marker(location, {icon: icon}).addTo(Commutes.Map).bindPopup(popUpText);
    Commutes.Markers.push(start_marker);
  }

  function removeAllMarkers() {
    for (i = 0; i < Commutes.Markers.length; i++) {
      var marker = Commutes.Markers[i];
      Commutes.Map.removeLayer(marker);
    }
  }

});
