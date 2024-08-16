const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const occurrenceRoutes = require('./routes/occurrenceRoutes');

require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true
}));

// Init Middleware
app.use(express.json());

// Define Routes
app.use('/users', userRoutes);
app.use('/incidents', incidentRoutes);
app.use('/occurrences', occurrenceRoutes);

app.use((req, res) => {
    res.status(404).send('Route not found');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Port configure
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));