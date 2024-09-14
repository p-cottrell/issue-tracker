const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const IssueRoutes = require('./routes/IssueRoutes');
const UserRoutes = require('./routes/userRoutes');
const OccurrenceRoutes = require('./routes/occurrenceRoutes');
require('dotenv').config();

const app = express();



// AWS S3 Configuration
// const AWS = require('aws-sdk');
// const multer = require('multer');
// const multerS3 = require('multer-s3');

// // Configure AWS with your access and secret keys
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Store in environment variables
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION// e.g., 'us-west-1'
// });

// const s3 = new AWS.S3();

// // Configure multer-s3 to upload files to S3
// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.AWS_BUCKET_NAME, // Bucket name
//     acl: 'public-read', // Or private, depending on your needs
//     key: function (req, file, cb) {
//       cb(null, `uploads/${Date.now().toString()}_${file.originalname}`); // Define path for uploaded file
//     }
//   })
// });

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
