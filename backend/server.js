const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const IssueRoutes = require('./routes/IssueRoutes');
const UserRoutes = require('./routes/userRoutes');
const OccurrenceRoutes = require('./routes/occurrenceRoutes');
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
app.use(cookieParser());

// Define Routes
app.use('/api/issues', IssueRoutes);
app.use('/api/users', UserRoutes);
app.use('/api/occurrences', OccurrenceRoutes);

// Handle 404 errors for undefined routes
app.use((req, res) => {
    res.status(404).send('Route not found');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
