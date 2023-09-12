//=============================== Import necessary modules============================================//
import express from 'express'; // Import the Express framework
import cors from 'cors'; // Middleware for handling Cross-Origin Resource Sharing (CORS)
import cookieParser from 'cookie-parser'; // Middleware for parsing cookies
import { config } from 'dotenv'; // Load environment variables from a .env file
import morgan from 'morgan'; // Logger middleware for logging HTTP requests
import userRoutes from "./routes/user.routes.js"; // Import user routes
import errorMiddleware from './middlewares/error.middelware.js'; // Import error middleware

// Load environment variables from .env file
config();

// Create an instance of the Express application
const app = express();

// Parse JSON payloads in incoming requests
app.use(express.json());

// Configure CORS middleware to allow requests from a specified origin
app.use(cors({
    origin: [process.env.FRONTEND_URL], // Allow requests from this origin
    credentials: true // Enable credentials (cookies, HTTP authentication, etc.)
}));

// Parse cookies attached to the client request object
app.use(cookieParser());

// Use Morgan logger middleware to log incoming requests (in 'dev' format)
app.use(morgan('dev'));

// Define a simple route to respond to a /ping endpoint
app.use('/ping', function(req, res) {
    res.send('/Pong');
});

// Routes for the 'user' module
app.use('/api/v1/user', userRoutes);

// Handle all other routes with a 404 error response
app.all('*', (req, res) => {
    res.status(404).send('OPPS!! 404 page not found');
});

// Use the custom error middleware to handle errors
app.use(errorMiddleware);

// Export the Express app for use in other modules
export default app;
