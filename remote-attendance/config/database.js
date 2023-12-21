// Configuration for MongoDB connection
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = 'mongodb://localhost:3000/LMS'; // Replace with your MongoDB connection URI
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
