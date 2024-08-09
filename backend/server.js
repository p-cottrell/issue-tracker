//server.js

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const incidentRoutes = require('./routes/incidentRoutes');

require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
// Body Parser??

// Define Routes
app.use('/users', userRoutes);
app.use('/incident', incidentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));