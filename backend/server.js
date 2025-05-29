require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - Support both direct paths and /api/ prefix
app.use('/', authRoutes);
app.use('/api', authRoutes); // Add support for /api/ prefix

// Health check
app.get('/health', (req, res) => {
  res.send('GitHub Auth API is running');
});

app.listen(PORT, () => {
  console.log(`Server started and running on port ${PORT}`);
}); 