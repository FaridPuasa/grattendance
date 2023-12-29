// getLocationName.js
const axios = require('axios');

// Function to retrieve location name from latitude and longitude
const getLocationName = async (latitude, longitude) => {
    try {
        // Check if latitude or longitude is undefined or not numeric
        if (latitude === undefined || longitude === undefined || isNaN(latitude) || isNaN(longitude)) {
            console.error('Invalid latitude or longitude:', latitude, longitude);
            return 'Invalid coordinates';
        }

        const apiKey = 'AgkWMZlk5ts6xb8cJkzUar2iJMWTexduafRzsyANqeAF2b_PN0D2CZAKo8hfNqkB'; // Replace with your Bing Maps API key
        const url = `https://dev.virtualearth.net/REST/v1/Locations/${latitude},${longitude}?key=${apiKey}`;

        const response = await axios.get(url);
        const data = response.data;

        if (data && data.resourceSets && data.resourceSets.length > 0 && data.resourceSets[0].resources.length > 0) {
            const location = data.resourceSets[0].resources[0].name;
            return location;
        } else {
            return 'Location not found';
        }
    } catch (error) {
        console.error('Error retrieving location:', error);
        return 'Error fetching location';
    }
};

module.exports = getLocationName; // Export the function to be used in other files
