// This file sets up the express application, middleware, and routes for the bookstore application.

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const booksRoutes = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3000;

const uri = "mongodb+srv://admin:admin123@cluster0.9zueo.mongodb.net/trangtin";
mongoose.connect(uri).catch((err) => console.log(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/books', booksRoutes);

// Home route
app.get('/', (req, res) => {
    res.render('index');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});