const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to handle user sign-in
router.post('/signin', async (req, res) => {
    const { username, location, latitude, longitude } = req.body;
    await userController.signIn(username, location, latitude, longitude);
    res.redirect('/signin-success');
});

// Route to handle user sign-out
router.post('/signout', async (req, res) => {
    const { username, location, latitude, longitude } = req.body;
    await userController.signOut(username, location, latitude, longitude);
    res.redirect('/signout-success');
});

module.exports = router;
