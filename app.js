import dotenv from 'dotenv';
import express from 'express';

import bookRouter from './routes/books.js';
import loanRouter from './routes/loans.js';

dotenv.config();
export const app = express();
const port = 3000;

app.use(express.json());
app.use('/books', bookRouter);
app.use('/loans', loanRouter);
app.listen(port, () => {
  console.log('listening at http://localhost:%d', port);
});
