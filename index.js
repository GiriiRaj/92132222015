const express = require('express');
const logger = require('./middleware/logger'); // Logging middleware
const shortenerRoutes = require('./routes/shortener'); // ✅ Import the shortener routes

const app = express();
const PORT = 3000;

app.use(express.json()); // Middleware to parse JSON body
app.use(logger);         // Custom logger

app.use('/api', shortenerRoutes); // ✅ Mount the /api route

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
