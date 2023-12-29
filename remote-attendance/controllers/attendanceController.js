const Attendance = require('../models/Attendance');
const getLocationName = require('./getLocationName'); // Assuming getLocationName is defined in a separate file

// Function to update attendance with location
const updateLocation = async (latitude, longitude) => {
    try {
        // Fetch the location name using latitude and longitude
        const locationName = await getLocationName(latitude, longitude);

        // Update the attendance entry with location details
        let attendance = await Attendance.findOneAndUpdate(
            {}, // Your query to find the attendance entry (for illustration purpose, using an empty query to update the first found entry)
            {
                $set: {
                    latitude,
                    longitude,
                    location: locationName, // Update with the fetched location name
                    updatedAt: new Date()
                }
            },
            { upsert: true, new: true }
        );

        // Return the updated attendance entry or handle the result as needed
        return attendance;
    } catch (error) {
        // Handle errors, e.g., database connection error or validation error
        throw new Error(`Error updating attendance: ${error.message}`);
    }
};

module.exports = {
    updateLocation
};
