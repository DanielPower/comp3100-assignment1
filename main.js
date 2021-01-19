import { app } from './app.js';
import bookRouter from './routes/books.js';
import loanRouter from './routes/loans.js';

app.use('/books', bookRouter);
app.use('/loans', loanRouter);
