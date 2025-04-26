const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;  // Destructure username and password from the request body

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // If everything is okay, register the new user
  users[username] = { password };  // Store the new user in the 'users' object (you can later hash the password for security)

  // Send success response
  res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  const allBooks = Object.values(books);
  const matchingBooks = allBooks.filter(book => book.author === author);

  if (matchingBooks.length > 0) {
    res.status(200).json(matchingBooks);
  } else {
    res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title.toLowerCase();  // Retrieve title from the request parameters (convert to lowercase for case-insensitive search)
  const matchingBooks = [];

  // Loop through all books to check if their title matches
  for (let key in books) {
    if (books[key].title.toLowerCase() === title) { // Compare titles (case-insensitive)
      matchingBooks.push(books[key]); // Add matching book to the result array
    }
  }

  // If matching books are found, return them as JSON
  if (matchingBooks.length > 0) {
    res.status(200).json(matchingBooks);
  } else {
    // If no book matches the title, return a 404 with a relevant message
    res.status(404).json({ message: "No books found with that title" });
  }

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters
  const book = books[isbn];     // Check if the book exists using the ISBN as the key

  if (book) {
    // If the book is found, check if there are reviews available
    if (Object.keys(book.reviews).length > 0) {
      res.status(200).json(book.reviews); // Return the reviews of the book
    } else {
      // If there are no reviews, return a message saying "No reviews available"
      res.status(404).json({ message: "No reviews available for this book" });
    }
  } else {
    // If the book is not found, return a 404 error with a "Book not found" message
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
