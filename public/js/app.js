// This file contains JavaScript code for client-side functionality for the book store application.

document.addEventListener('DOMContentLoaded', function() {
    const bookList = document.getElementById('book-list');

    if (bookList) {
        fetch('/api/books')
            .then(response => response.json())
            .then(data => {
                data.forEach(book => {
                    const bookItem = document.createElement('div');
                    bookItem.className = 'book-item';
                    bookItem.innerHTML = `
                        <h3>${book.title}</h3>
                        <p>Author: ${book.author}</p>
                        <p>Genre: ${book.genre}</p>
                        <p>Price: $${book.price.toFixed(2)}</p>
                        <a href="/books/${book.id}" class="btn btn-primary">View Details</a>
                    `;
                    bookList.appendChild(bookItem);
                });
            })
            .catch(error => console.error('Error fetching books:', error));
    }
});