const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const app = express();
const axios = require('axios');

const mongodbUri = process.env.MONGODB_URI || 'mongodb+srv://itsupport:GSB110011@cluster0.kkzdiku.mongodb.net/LMS?retryWrites=true&w=majority';
const client = new MongoClient(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

async function connectMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB successfully');
        const database = client.db('LMS');
        db = database;
        
        // After establishing the connection, call functions that depend on the database connection
        await insertUsersAndAttendanceDataToDB(); // Call to insert users and attendance data
        await readAttendanceDataFromDB(); // Call to load attendance data
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
}

// Importing the moment library
const moment = require('moment-timezone');

// Set the desired time zone (Singapore/Malaysia/Brunei)
const bruneiTime = moment.tz('Asia/Brunei').format('YYYY-MM-DD HH:mm:ss');

console.log('Current Date in Singapore/Malaysia/Brunei:', bruneiTime);

// Example usage of moment.js
const currentDate = moment(); // Get the current date and time

// Formatting dates
console.log('Current Date:', currentDate.format('YYYY-MM-DD')); // Output: Current Date: 2023-12-21

// Adding or subtracting time
const futureDate = moment().add(7, 'days'); // Get the date 7 days from now
console.log('Future Date:', futureDate.format('YYYY-MM-DD')); // Output: Future Date: 2023-12-28

// Calculating differences between dates
const startDate = moment('2023-12-01', 'YYYY-MM-DD'); // Creating a specific date
const endDate = moment(); // Using the current date
const daysDifference = endDate.diff(startDate, 'days');
console.log('Days difference:', daysDifference); // Output: Days difference: 20

async function insertUsersAndAttendanceDataToDB() {
    try {
        const users = [
            { username: 'Hasbul', phoneNumber: '+6737181101'},
            { username: 'Khai', phoneNumber: 'not applicable'}
            
        ];

        const attendanceData = [
            { username: 'Hasbul', location: 'Home', signIn: new Date('2023-12-21T10:00:00Z'), signOut: new Date('2023-12-21T17:00:00Z') },
            { username: 'Khai', location: 'Home', signIn: new Date('2023-12-21T10:00:00Z'), signOut: new Date('2023-12-21T17:00:00Z') }

        ];

        const database = client.db('LMS');
        const usersCollection = database.collection('users');
        const attendanceCollection = database.collection('attendanceData');

        for (const user of users) {
            const existingUser = await usersCollection.findOne({ username: user.username });

            if (!existingUser) {
                await usersCollection.insertOne(user);
                console.log(`Added user: ${user.username}`);
            } else {
                console.log(`User ${user.username} already exists in the database`);
            }
        }

        const resultUsers = await usersCollection.insertMany(users);
        console.log(`${resultUsers.insertedCount} users inserted`);

        const resultAttendance = await attendanceCollection.insertMany(attendanceData);
        console.log(`${resultAttendance.insertedCount} attendance data inserted`);
    } catch (err) {
        console.error('Error inserting users and attendance data:', err);
        throw new Error('Failed to insert data to the database');
    }
}


// Read attendance data from the database
async function readAttendanceDataFromDB() {
    try {
        if (!db) {
            throw new Error('MongoDB connection not established.');
        }
        const attendanceCollection = db.collection('attendanceData');
        const attendanceData = await attendanceCollection.find({}).toArray();

        if (!attendanceData || attendanceData.length === 0) {
            console.log('No attendance data found in the collection.');
        } else {
            console.log('Attendance data loaded from MongoDB:', attendanceData);
        }
     // Sample log for latitude and longitude in the first record (if available)
    if (attendanceData.length > 0) {
        const firstRecord = attendanceData[0];
        if (firstRecord.latitude && firstRecord.longitude) {
            console.log('Latitude:', firstRecord.latitude);
            console.log('Longitude:', firstRecord.longitude);
        }  else {
            console.log('Latitude or Longitude not found in the first record.');
        }
    } else {
        console.log('No attendance data found in the collection.');
    }

    return attendanceData;
 } catch (err) {
     console.error('Error loading attendance data from MongoDB:', err);
     throw new Error('Failed to read attendance data from the database');
 }
}


app.use(express.static(path.join(__dirname, 'public')));

// Set 'views' directory for any views rendered
app.set('views', path.join(__dirname, 'public', 'views'));

// Set EJS as the view engine
app.set('view engine', 'ejs');


// Define the authenticateUser middleware function
function authenticateUser(req, res, next) {
    // Extract username and password from the request body
    const { username, password } = req.body;

    // Check if the username and password match any user in the hardcoded credentials
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // If credentials are valid, set user information on the request object
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    } else {
        // If credentials are invalid, send an unauthorized response
        res.status(401).send('Invalid credentials');
    }

    // For demonstration purposes, let's assume authentication is successful
    const isAuthenticated = true;

    if (isAuthenticated) {
        // If authenticated, proceed to the next middleware or route handler
        next();
    } else {
        // If not authenticated, send an unauthorized response or redirect to login
        res.status(401).send('Unauthorized');
    }
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Variable to track the MongoDB connection status
let isConnected = false;

// Routes
const attendanceRoutes = require('./routes/attendanceRoutes');
const userRoutes = require('./routes/userRoutes');
app.use('/attendance', authenticateUser, attendanceRoutes);
app.use('/user', userRoutes);

// Protected route using the authenticateUser middleware
app.get('/protectedRoute', authenticateUser, (req, res) => {
    res.send('This is a protected route');
});

// Route for the root path to render the attendance log
app.get('/', async (req, res) => {
    try {
        const attendanceData = await readAttendanceDataFromDB();
        res.render('attendanceLog', { attendanceData });
    } catch (err) {
        console.error('Error loading attendance data:', err);
        res.status(500).send('Error loading attendance data' + err.message);
    }
});


// Route to render the attendance log
app.get('/attendance-log', async (req, res) => {
    try {
        console.log('Attempting to retrieve attendance data...');
        const attendanceData = await readAttendanceDataFromDB();

        // Fetch location names for each attendance record
        for (const record of attendanceData) {
            const latitude = record.latitude;
            const longitude = record.longitude;

            // Fetch location name using getLocationName function
            const locationName = await getLocationName(latitude, longitude);

            // Update the attendance record with the location name
            record.locationName = locationName;
        }

        // Render the attendance log page with the updated attendanceData
        res.render('attendanceLog', { attendanceData });
    } catch (err) {
        console.error('Error fetching attendance log:', err);
        res.status(500).send('Error fetching attendance log');
    }
});


// Function to retrieve location name from latitude and longitude
async function getLocationName(latitude, longitude) {
    const apiKey = 'AgkWMZlk5ts6xb8cJkzUar2iJMWTexduafRzsyANqeAF2b_PN0D2CZAKo8hfNqkB';
    const url = `https://dev.virtualearth.net/REST/v1/Locations/${latitude},${longitude}?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data && data.resourceSets && data.resourceSets.length > 0) {
            const location = data.resourceSets[0].resources[0].name;
            return location;
        } else {
            return 'Location not found';
        }
    } catch (error) {
        console.error('Error retrieving location:', error);
        return 'Error fetching location';
    }
}

// Attendance recording route
app.post('/attendance', async (req, res) => {
    const { latitude, longitude } = req.body;

    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString();

    if (latitude && longitude) {
        try {
            const locationName = await getLocationName(latitude, longitude);

            await attendanceCollection.insertOne({
                location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                timestamp: new Date(),
                date: currentDate,
                signIn: currentTime,
                signOut: null // Assuming this will be updated later when user signs out
            });

            res.status(200).json({ message: 'Attendance recorded successfully' });
        } catch (err) {
            console.error('Error recording attendance:', err);
            res.status(500).json({ error: 'Error recording attendance' });
        }
    } else {
        res.status(400).json({ error: 'Latitude and longitude are required' });
    }
});

// Route to render the sign-in form
app.get('/signin', async (req, res) => {
    if (!isConnected) {
        try {
            await connectMongoDB(); // Connect if not already connected
            renderSignInForm(req, res);
        } catch (err) {
            console.error('Error connecting to MongoDB:', err);
            res.status(500).send('Error connecting to MongoDB');
        }
    } else {
        renderSignInForm(req, res);
    }
});

// Function to render the sign-in form
function renderSignInForm(req, res) {
    const bingMapsAPIKey = 'AgkWMZlk5ts6xb8cJkzUar2iJMWTexduafRzsyANqeAF2b_PN0D2CZAKo8hfNqkB';
    res.render('signin', { bingMapsAPIKey });
}

const { time } = require('console');

// Route to handle sign-in form submission
app.post('/signin', async (req, res) => {
    await connectMongoDB(); // Ensure MongoDB connection before processing sign-in

    const { username, location, latitude, longitude } = req.body;
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = moment().tz('Asia/Brunei').format('HH:mm:ss'); // Get time in Brunei timezone

    try {
        const attendanceCollection = db.collection('attendanceData'); // Get attendanceCollection from the database

        const existingUser = await attendanceCollection.findOne({ username });

        if (existingUser) {
            await attendanceCollection.updateOne(
                { _id: new ObjectId(existingUser._id) },
                {
                    $set: {
                        signIn: currentTime,
                        location,
                        latitude: parseFloat(latitude), // Parse latitude to float
                        longitude: parseFloat(longitude), // Parse longitude to float
                        date: currentDate
                    }
                }
            );
            console.log('Updated sign-in for existing user:', username);
        } else {
            await attendanceCollection.insertOne({
                username,
                signIn: currentTime,
                signOut: null,
                location,
                latitude: parseFloat(latitude), // Parse latitude to float
                longitude: parseFloat(longitude), // Parse longitude to float
                date: currentDate
            });
            console.log('Added new sign-in entry:', username);
        }

        res.redirect('/signin-success');
    } catch (err) {
        console.error('Error processing sign-in:', err);
        res.status(500).send('Error processing sign-in');
    }
});

// Route to render the sign-out form
app.get('/signout', async (req, res) => {
    if (!isConnected) {
        try {
            await connectMongoDB(); // Connect if not already connected
            renderSignOutForm(req, res);
        } catch (err) {
            console.error('Error connecting to MongoDB:', err);
            res.status(500).send('Error connecting to MongoDB');
        }
    } else {
        renderSignOutForm(req, res);
    }
});

// Function to render the sign-out form
function renderSignOutForm(req, res) {
    const bingMapsAPIKey = 'AgkWMZlk5ts6xb8cJkzUar2iJMWTexduafRzsyANqeAF2b_PN0D2CZAKo8hfNqkB';
    res.render('signout', { bingMapsAPIKey });
}

// Route to handle sign-out
app.post('/signout', async (req, res) => {
    await connectMongoDB(); // Ensure MongoDB connection before processing sign-out

    const { username } = req.body;
    const currentTime = moment().tz('Asia/Brunei').format('HH:mm:ss'); // Get time in Brunei timezone

    try {
        const attendanceCollection = db.collection('attendanceData'); // Get attendanceCollection from the database

        await attendanceCollection.updateOne(
            { username },
            { $set: { signOut: currentTime } }
        );
        console.log('Updated sign-out for user:', username);
        res.redirect('/signout-success');
    } catch (err) {
        console.error('Error processing sign-out:', err);
        res.status(500).send('Error processing sign-out');
    }
});

// Route to handle the map
app.get('/map', (req, res) => {
    // Render the map.html file
    res.sendFile(path.join(__dirname, 'public/css/map.html'));
});

// Route to handle successful sign-in
app.get('/signin-success', (req, res) => {
    res.send('Sign-In successful!'); // You can customize this response or render a success page here
});

// Route to handle successful sign-out
app.get('/signout-success', (req, res) => {
    res.send('Sign-Out successful!'); // You can customize this response or render a success page here
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    try {
        await connectMongoDB();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
});