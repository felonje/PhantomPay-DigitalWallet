import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { registerRoutes } from '../../server/routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'PhantomPay API', status: 'running' });
});

// Setup routes
const initializeApp = async () => {
  try {
    await registerRoutes(app);
    console.log('Routes registered for Netlify function');
  } catch (error) {
    console.error('Error setting up routes:', error);
  }
};

initializeApp();

export const handler = serverless(app);