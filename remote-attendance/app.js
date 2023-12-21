const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const app = express();

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
const moment = require('moment');

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
            { name: 'Ema', email: 'ema.karmila@globex.com.bn', signIn: '00:00:00 AM', signOut: '12:00:00 PM' },
            { name: 'Hasbul', email: 'not applicable', signIn: '09:30:00 AM', signOut: '05:30:00 PM' },
            { name: 'Khai', email: 'not applicable', signIn: '09:30:00 AM', signOut: '05:30:00 PM' },
            // Add more user objects as needed
        ];

        const attendanceData = [
            { username: 'Ema', location: 'Office', signIn: '09:00:00 AM', signOut: '06:00:00 PM', date: '2023-12-21' },
            { username: 'Hasbul', location: 'Home', signIn: '10:00:00 AM', signOut: '05:00:00 PM', date: '2023-12-21' },
            { username: 'Khai', location: 'Home', signIn: '10:00:00 AM', signOut: '05:00:00 PM', date: '2023-12-21' },
            // Add more attendance records as needed
        ];

        const database = client.db('LMS');
        const usersCollection = database.collection('users');
        const attendanceCollection = database.collection('attendanceData');

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
async function readAttendanceDataFromDB(client) {
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
        const attendanceData = await readAttendanceDataFromDB(client);
        res.render('attendanceLog', { attendanceData });
    } catch (err) {
        console.error('Error loading attendance data:', err);
        res.status(500).send('Error loading attendance data' + err.message);
    }
});

// Record attendance
app.post('/add-attendance', async (req, res) => {
    const { username, location, signIn, signOut, date } = req.body;

    try {
        const attendanceCollection = db.collection('attendanceData');

        await attendanceCollection.insertOne({
            username,
            location,
            signIn,
            signOut,
            date
        });

        res.redirect('/map'); // Redirect to the map page or another appropriate location
    } catch (err) {
        console.error('Error adding attendance:', err);
        res.status(500).send('Error adding attendance');
    }
});

app.get('/attendance-log', async (req, res) => {
    try {
        console.log('Attempting to retrieve attendance data...');
        const attendanceData = await readAttendanceDataFromDB(client);

        res.render('attendanceLog', { attendanceData });
    } catch (err) {
        console.error('Error fetching attendance log:', err);
        res.status(500).send('Error fetching attendance log');
    }
});

// Attendance recording route
app.post('/attendance', async (req, res) => {
    const { latitude, longitude } = req.body;

    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString();

    if (latitude && longitude) {
        try {
            const attendanceCollection = db.collection('attendance');

            await attendanceCollection.insertOne({
                location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                timestamp: new Date(),
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
    const currentTime = new Date().toLocaleTimeString();

    try {
        const attendanceCollection = db.collection('attendance'); // Get attendanceCollection from the database

        const existingUser = await attendanceCollection.findOne({ username });

        if (existingUser) {
            await attendanceCollection.updateOne(
                { _id: new ObjectId(existingUser._id) },
                {
                    $set: {
                        signIn: currentTime,
                        location,
                        latitude,
                        longitude,
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
                latitude,
                longitude,
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
    const currentTime = new Date().toLocaleTimeString();

    try {
        const attendanceCollection = db.collection('attendance'); // Get attendanceCollection from the database

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


