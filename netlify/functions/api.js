const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import and setup routes
const setupRoutes = async () => {
  try {
    // Dynamic import for ES modules
    const { registerRoutes } = await import('../../server/routes.ts');
    await registerRoutes(app);
    console.log('Routes registered for Netlify function');
  } catch (error) {
    console.error('Error setting up routes:', error);
    // Fallback basic route
    app.get('/', (req, res) => {
      res.json({ message: 'PhantomPay API', status: 'running' });
    });
  }
};

setupRoutes();

module.exports.handler = serverless(app);