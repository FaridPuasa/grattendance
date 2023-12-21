// Add this code to 'public/js/bingMap.js'

let map;

function loadMapScenario() {
    map = new Microsoft.Maps.Map(document.getElementById('map'), {
        credentials: 'AgkWMZlk5ts6xb8cJkzUar2iJMWTexduafRzsyANqeAF2b_PN0D2CZAKo8hfNqkB' // Replace with your API key
    });

    // Assuming 'data' is passed from the server-side
    data.forEach(entry => {
        const location = new Microsoft.Maps.Location(5.027297, 115.072052); // Use latitude and longitude from your data
        const pin = new Microsoft.Maps.Pushpin(location);
        map.entities.push(pin);
    });

    // Set the map view
map.setView({
    center: new Microsoft.Maps.Location(5.027297, 115.072052), // Center coordinates
    zoom: 10 // Zoom level
});

  // Add controls (optional)
  map.controls.add(new Microsoft.Maps.ZoomControl());
  map.controls.add(new Microsoft.Maps.MapTypeControl());
}
