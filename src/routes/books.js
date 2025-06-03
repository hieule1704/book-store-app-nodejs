// filepath: /book-store-app/book-store-app/src/routes/books.js
const express = require('express');
const BooksController = require('../controllers/booksController');

const router = express.Router();
const booksController = new BooksController();

function setRoutes(app) {
    router.get('/books', booksController.getAllBooks.bind(booksController));
    router.get('/books/:id', booksController.getBookById.bind(booksController));
    router.post('/books', booksController.createBook.bind(booksController));

    app.use('/api', router);
}

module.exports = setRoutes;