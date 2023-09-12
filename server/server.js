// Import the 'app' Express instance and the 'connectionToDB' function
import app from './app.js';
import connectionToDB from './config/dbConnection.js';

// Define the port where the server will listen. Use the environment variable PORT if available, or default to 5001.
const PORT = process.env.PORT || 5001;

// Start the Express server
app.listen(PORT, async () => {
    // Call the 'connectionToDB' function to establish a database connection (assuming it returns a promise)
    await connectionToDB();
    
    // Log a message indicating that the app is running and listening on the specified port
    console.log(`App is running at http://localhost:${PORT}`);
});
