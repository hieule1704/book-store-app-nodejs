# Book Store Application

## Overview

This is a simple Book Store application built using Node.js and Express. The application allows users to view a list of books, see details for each book, and manage book-related operations.

## Project Structure

```
bookly/
├── models/                    # Mongoose models
│   ├── Author.js
│   ├── Blog.js
│   ├── Cart.js
│   ├── Message.js
│   ├── Order.js
│   ├── Product.js
│   ├── Publisher.js
│   ├── User.js
├── routes/                    # Express routes
│   ├── books.js
│   ├── cart.js
│   ├── orders.js
│   ├── auth.js
│   ├── blogs.js
│   ├── admin.js
├── public/                    # Static assets
│   ├── css/
│   │   ├── style.css         # Copy your PHP style.css here
│   ├── js/
│   │   └── custom.js         # Optional custom JS
│   ├── images/
│   │   ├── uploaded_img/     # Copy your PHP uploaded_img folder here
│   │   ├── other_resource/   # Copy your PHP other_resource folder here
│   │   └── about-img.jpg     # Copy your PHP about-img.jpg here
├── views/                     # EJS templates
│   ├── layouts/
│   │   ├── main.ejs
│   ├── partials/
│   │   ├── header.ejs
│   │   ├── footer.ejs
│   ├── pages/
│   │   ├── home.ejs
│   │   ├── shop.ejs
│   │   ├── detail.ejs
│   │   ├── cart.ejs
│   │   ├── checkout.ejs
│   │   ├── orders.ejs
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   ├── blog.ejs
│   │   ├── blog_detail.ejs
│   │   ├── search.ejs
│   ├── admin/
│   │   ├── index.ejs
│   │   ├── products.ejs
├── .env                       # Environment variables
├── app.js                     # Main application file
├── seedData.js                # Script to seed sample data
```

## Features

- View a list of books
- View detailed information about each book
- Responsive design with a clean user interface

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd book-store-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run:

```
npm start
```

The application will be available at `http://localhost:3000`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License.
