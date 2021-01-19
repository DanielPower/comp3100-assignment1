import { Router } from 'express';
import { db } from '../app.js';
import { isMatch, BookSchema } from '../schemas.js';

const bookRouter = Router();

// Get books
bookRouter.get('/', (req, res) => {
  let books = Object.values(db.getCache().books);

  // Filter query params
  const { year } = req.query;
  if (year) {
    res.json(books.filter((book) => book.year === parseInt(year, 10)));
  } else {
    res.json(books.map(({ id, name }) => ({ id, name })));
  }
});

// Get book by id
bookRouter.get('/:id', (req, res) => {
  const book = db.getCache().books[req.params.id];

  // Handle book not found case
  if (!book) {
    res.status(404).send();
    return;
  }

  res.json(book);
});

bookRouter.get('/available/:id', (req, res) => {
  const cache = db.getCache();
  const book = cache.books[req.params.id];

  // Handle book not found case
  if (!book) {
    res.status(404).send();
    return;
  }

  // Check if book is borrowed
  const isBorrowed = !Object.values(cache.loans)
    .filter((loan) => loan.bookId === book.id)
    .every((loan) => loan.wasReturned);

  res.json({ isAvailable: !isBorrowed });
});

// Insert a book
bookRouter.post('/', (req, res) => {
  const book = req.body;

  // Validate inserted data
  if (!isMatch(book, BookSchema)) {
    res.status(400).send();
  }

  // Insert new book into cache
  db.writeCache({
    books: {
      [id]: book,
    },
  });
  res.send();
});

export default bookRouter;
