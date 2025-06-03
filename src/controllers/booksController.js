class BooksController {
    constructor(bookModel) {
        this.bookModel = bookModel;
    }

    async getAllBooks(req, res) {
        try {
            const books = await this.bookModel.find();
            res.render('index', { books });
        } catch (error) {
            res.status(500).send('Error retrieving books');
        }
    }

    async getBookById(req, res) {
        const { id } = req.params;
        try {
            const book = await this.bookModel.findById(id);
            if (!book) {
                return res.status(404).send('Book not found');
            }
            res.render('book-detail', { book });
        } catch (error) {
            res.status(500).send('Error retrieving book');
        }
    }

    async createBook(req, res) {
        const { title, author, genre, price } = req.body;
        try {
            const newBook = new this.bookModel({ title, author, genre, price });
            await newBook.save();
            res.redirect('/');
        } catch (error) {
            res.status(400).send('Error creating book');
        }
    }
}

module.exports = BooksController;