const User = require('../models/User'); // Import User model

// Function to handle user sign-in
const signIn = async (username, location, latitude, longitude) => {
    try {
        // Check if the user exists in the database
        let user = await User.findOne({ username });

        if (!user) {
            // If user doesn't exist, create a new user entry
            user = new User({
                username,
                // Other relevant fields
            });
        }

        // Update user's sign-in information
        user.signIn = new Date();
        user.location = location;
        user.latitude = latitude;
        user.longitude = longitude;

        // Save the updated user information in the database
        await user.save();
        
        // Return the user object or any other relevant data upon successful sign-in
        return user;
    } catch (error) {
        // Handle errors, e.g., database connection error or validation error
        throw new Error(`Error signing in user: ${error.message}`);
    }
};

// Function to handle user sign-out
const signOut = async (username, location, latitude, longitude) => {
    try {
        // Find the user in the database
        let user = await User.findOne({ username });

        if (!user) {
            // Handle if the user doesn't exist (optional)
            throw new Error('User not found');
        }

        // Update user's sign-out information
        user.signOut = new Date();
        user.location = location;
        user.latitude = latitude;
        user.longitude = longitude;

        // Save the updated user information in the database
        await user.save();
        
        // Return the user object or any other relevant data upon successful sign-out
        return user;
    } catch (error) {
        // Handle errors, e.g., database connection error or validation error
        throw new Error(`Error signing out user: ${error.message}`);
    }
};

module.exports = {
    signIn,
    signOut
};
