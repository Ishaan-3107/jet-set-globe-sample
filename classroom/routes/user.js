const express = require('express');

const router = express.Router();

// Index route
router.get('/', (req, res) => {
    res.send('Get all users');
});

// Show route
router.get('/:id', (req, res) => {
    const { id } = req.params;
    res.send(`Get user with ID: ${id}`);
});

// Post route
router.post('/', (req, res) => {
    res.send('Create a new user');
});

// Delete route
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    res.send(`Delete user with ID: ${id}`);
});


module.exports = router;