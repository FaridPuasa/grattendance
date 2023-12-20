const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Route to update location
router.post('/updateLocation', async (req, res) => {
    const { latitude, longitude } = req.body;
    await attendanceController.updateLocation(latitude, longitude);
    res.status(200).json({ message: 'Location updated successfully' });
});

module.exports = router;
