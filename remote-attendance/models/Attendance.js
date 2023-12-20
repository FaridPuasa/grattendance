// Define the schema for Attendance
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    username: String,
    signIn: String,
    signOut: String,
    location: String,
    latitude: Number,
    longitude: Number,
    date: String
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;