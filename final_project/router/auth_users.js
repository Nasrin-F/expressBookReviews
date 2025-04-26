const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');  // Assuming this contains the books data

const regd_users = express.Router();

let users = [
  { username: "testuser", password: "testpassword" } // Add a test user for login
];

// Function to check if the username exists
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Function to authenticate user credentials
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login. Check credentials." });
  }

  // Generate a JWT token when login is successful
  const accessToken = jwt.sign(
    { username: username },
    'secret_key', // Replace this with a secure key in production
    { expiresIn: '1h' } // Token expires in 1 hour
  );

  // Store the token in session (optional, depending on your use case)
  req.session.authorization = { accessToken };

  // Send the token back to the client
  res.status(200).json({
    message: "User successfully logged in",
    token: accessToken
  });
});

// JWT Authentication middleware to protect routes that require login
regd_users.use("/auth/*", (req, res, next) => {
  const token = req.session?.authorization?.accessToken || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, 'secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }
    req.user = user;
    next();
  });
});

// Route for deleting a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the review exists for the current user
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this book by the current user" });
  }

  // Delete the review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});

// Export the router
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
