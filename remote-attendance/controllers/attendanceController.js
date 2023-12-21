const Attendance = require('../models/Attendance');

// Function to update attendance with location
const updateLocation = async (latitude, longitude) => {
    try {
        // Find or create an attendance entry based on your logic
        let attendance = await Attendance.findOneAndUpdate(
            {}, // Your query to find the attendance entry (for illustration purpose, using an empty query to update the first found entry)
            { $set: { latitude, longitude, location: `${latitude},${longitude}`, updatedAt: new Date() } },
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
