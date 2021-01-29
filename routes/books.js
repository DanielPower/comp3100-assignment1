import { Router } from 'express';

import { readDb, writeDb } from '../db.js';

const bookRouter = Router();

// Get books
bookRouter.get('/', (req, res) => {
  let books = Object.values(readDb().books);

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
  const book = readDb().books[req.params.id];

  // Handle book not found case
  if (!book) {
    res.status(404).send();
    return;
  }

  res.json(book);
});

bookRouter.get('/available/:id', (req, res) => {
  const cache = readDb();
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

  // Insert new book into cache
  writeDb({
    books: {
      [book.id]: book,
    },
  });
  res.send();
});

export default bookRouter;
