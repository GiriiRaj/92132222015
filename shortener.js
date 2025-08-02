const express = require('express');
const router = express.Router();

// In-memory database with expiry tracking
const urlDatabase = {};

// POST /api/shorten
router.post('/shorten', (req, res) => {
    const { originalUrl, preferredCode, expiryMinutes } = req.body;

    if (!originalUrl) {
        return res.status(400).json({ error: 'originalUrl is required' });
    }

    // Set expiry time
    const expiresIn = (expiryMinutes && !isNaN(expiryMinutes)) ? expiryMinutes : 30;
    const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000); // Add minutes in ms

    // Determine the short code
    let shortCode = preferredCode || Math.random().toString(36).substring(2, 8);

    // Check for conflicts if preferredCode is already used
    if (urlDatabase[shortCode]) {
        return res.status(409).json({ error: 'Short code already in use. Choose another preferredCode.' });
    }

    // Save data to the in-memory store
    urlDatabase[shortCode] = {
        originalUrl,
        expiresAt
    };

    res.json({
        shortUrl: `http://localhost:3000/api/${shortCode}`,
        expiresAt,
        originalUrl
    });
});

// GET /api/:code
router.get('/:code', (req, res) => {
    const code = req.params.code;
    const entry = urlDatabase[code];

    if (!entry) {
        return res.status(404).json({ error: 'Short URL not found' });
    }

    // Check if expired
    if (new Date() > new Date(entry.expiresAt)) {
        delete urlDatabase[code]; // Clean up
        return res.status(410).json({ error: 'Short URL has expired' });
    }

    // Redirect if valid
    res.redirect(entry.originalUrl);
});

module.exports = router;
