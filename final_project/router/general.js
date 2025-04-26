const express = require('express');
let books = require("./booksdb.js");
const public_users = express.Router();

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
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
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const matchingBooks = [];

  for (let key in books) {
    if (books[key].title.toLowerCase() === title) {
      matchingBooks.push(books[key]);
    }
  }

  if (matchingBooks.length > 0) {
    res.status(200).json(matchingBooks);
  } else {
    res.status(404).json({ message: "No books found with that title" });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    if (Object.keys(book.reviews).length > 0) {
      res.status(200).json(book.reviews);
    } else {
      res.status(404).json({ message: "No reviews available for this book" });
    }
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Add review to a book
public_users.post('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const username = req.body.username;
  const review = req.body.review;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!username || !review) {
    return res.status(400).json({ message: "Username and review are required" });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added successfully" });
});

// Delete review from a book
public_users.delete('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const username = req.body.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this book by the user" });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});

// Export the public routes
module.exports.general = public_users;
