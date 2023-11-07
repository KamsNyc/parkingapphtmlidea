// Initialize Mapbox map
mapboxgl.accessToken = 'pk.eyJ1Ijoia2Ftc3Rlc3QiLCJhIjoiY2xqMW9lcHY2MGcwNzNjczZvNm51dWsyZCJ9.mW6hQOh7sGgutKxpEGFCYg';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  zoom: 14 // Default zoom level
});

// Store user's parking location
var parkingLocation = null;
var isParkingVerified = false;
var carMarker = null;

// Function to add a marker at the specified coordinates
function addMarker(coordinates, options = {}) {
  if (options.markerType === 'car') {
    // Create a car-shaped marker
    var el = document.createElement('div');
    el.className = 'marker-car';
    carMarker = new mapboxgl.Marker(el).setLngLat(coordinates).addTo(map);
    map.flyTo({ center: coordinates }); // Zoom to the car marker
  } else {
    // Create a default marker
    var marker = new mapboxgl.Marker().setLngLat(coordinates).addTo(map);
    parkingLocation = coordinates;
    map.getSource('parkingLocation').setData({ type: 'Point', coordinates: coordinates });
    document.getElementById('verifyBtn').disabled = false;
  }
}

// Function to handle verifying the parking
function verifyParking() {
  isParkingVerified = true;

  // Disable verify button
  document.getElementById('verifyBtn').disabled = true;

  // Remove car marker if it exists
  if (carMarker) {
    carMarker.remove();
  }

  // Show notification to the user
  showNotification('Parking location verified');

  // Display the saved location
  displaySavedLocation();

  // Unbind click event for parking selection
  map.off('click', handleMapClick);
}

// Function to display the saved location
function displaySavedLocation() {
  var savedLocationDiv = document.getElementById('savedLocation');
  savedLocationDiv.innerHTML = '';

  var card = document.createElement('div');
  card.className = 'location-card';

  var name = document.createElement('h3');
  name.textContent = 'Parking Location';
  card.appendChild(name);

  var time = document.createElement('p');
  time.textContent = 'Created: ' + new Date().toLocaleString();
  card.appendChild(time);

  var directionsBtn = document.createElement('a');
  directionsBtn.href = '#';
  directionsBtn.textContent = 'Directions';
  directionsBtn.className = 'directions-btn';
  directionsBtn.addEventListener('click', function() {
    openInGoogleMaps(parkingLocation);
  });
  card.appendChild(directionsBtn);

  savedLocationDiv.appendChild(card);
}

// Function to show a notification
function showNotification(message) {
  var notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;

  document.querySelector('.notification-container').appendChild(notification);

  // Automatically remove the notification after 3 seconds
  setTimeout(function() {
    notification.remove();
  }, 3000);
}

// Function to save the parking location data to local storage
function saveParkingLocation() {
  localStorage.setItem('parkingLocation', JSON.stringify(parkingLocation));
}

// Function to load the saved parking location from local storage
function loadParkingLocation() {
  var savedLocation = JSON.parse(localStorage.getItem('parkingLocation'));
  if (savedLocation) {
    parkingLocation = savedLocation;
    displaySavedLocation();
  }
}

// Function to open Google Maps for directions
function openInGoogleMaps(coordinates) {
  var url = `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`;
  window.open(url);
}

// Add event listener to verify button
document.getElementById('verifyBtn').addEventListener('click', verifyParking);

// Create the parking location data source
map.on('load', function() {
  map.addSource('parkingLocation', {
    type: 'geojson',
    data: { type: 'Point', coordinates: [] }
  });

  // Create the parking location layer
  map.addLayer({
    id: 'parkingLocation',
    type: 'circle',
    source: 'parkingLocation',
    paint: {
      'circle-color': '#f00',
      'circle-radius': 6,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  });

  // Load saved parking location from local storage
  loadParkingLocation();
});

// Handle map click event for parking selection
function handleMapClick(e) {
  if (!isParkingVerified) {
    var coordinates = [e.lngLat.lng, e.lngLat.lat];
    addMarker(coordinates);
  }
}

// Get user's current location on page load
navigator.geolocation.getCurrentPosition(function(position) {
  var coordinates = [position.coords.longitude, position.coords.latitude];
  addMarker(coordinates, { markerType: 'car' });
  map.setCenter(coordinates);
  map.on('click', handleMapClick);
}, function(error) {
  console.error('Error getting current location:', error);
});
