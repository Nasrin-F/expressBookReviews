const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Use JSON parser middleware
app.use(express.json());

// Setup session middleware (optional, since we will use tokens)
app.use("/customer", session({
    secret: "fingerprint_customer", // Store session secret securely (e.g. via environment variables in production)
    resave: true,
    saveUninitialized: true
}));

// JWT Authentication middleware for /customer/auth/* routes
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check session or Authorization header for JWT
    const token =
        req.session.authorization?.accessToken ||  // Check session first
        req.headers['authorization']?.split(' ')[1]; // Otherwise, check for Authorization header with Bearer token

    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    // Use the correct secret key (same as used when signing the JWT)
    const jwtSecret = process.env.JWT_SECRET || 'secret_key';  // Store secret securely (use env variables)

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token." });
        }
        req.user = user;  // Store the decoded user information for later use in the route
        next();
    });
});

// Use customer routes (auth, etc.)
app.use("/customer", customer_routes);  // All customer routes start with /customer
app.use("/", genl_routes);  // Public routes that don't need authentication

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
