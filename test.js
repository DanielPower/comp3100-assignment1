import axios from 'axios';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { readDb } from './db.js';

import isEqual from 'lodash.isequal';

dotenv.config();

// The file to use for setting up test databases. This should be the same file the server is set to
// read and write to.
const storeFile = process.env.STOREFILE;
if (!storeFile) {
  console.error(
    `Please set the file to use for testing by setting the STOREFILE environment variable.``Be sure to have your server running using the same file.`
  );
  process.exit();
}

// The path to the server. Locally this will be http://localhost:3000, but could be different if you
// were to test the app running on a remote server.
const location = process.env.LOCATION;
if (!location) {
  console.error(
    `Please set the location of the server. This is likely 'http://localhost:3000'`
  );
  process.exit();
}

const expect = (name, value) => ({
  toBe: (expectation) => {
    if (!isEqual(value, expectation)) {
      throw `Incorrect value for ${name}. Expected ${expectation}, got ${value}`;
    }
  },
});

// Setup an axios instance so we don't have to repeat the url prefix on every request
// Set a timeout so requests don't wait forever if the server stalls
const { get, put, post } = axios.create({
  baseURL: location,
  timeout: 3000,
});

const testDatabase = {
  books: {
    5: {
      id: '5',
      name: '1984',
      authors: ['George Orwell'],
      year: 1949,
      publisher: 'Secker & Warburg',
    },
    12: {
      id: '12',
      name: 'Fahrenheit 451',
      authors: ['Ray Bradbury'],
      year: 1953,
      publisher: 'Ballantine Books',
    },
    42: {
      id: '42',
      name: 'Earth Abides',
      authors: ['George R. Stewart'],
      year: 1949,
      publisher: 'Penguin Random House LLC',
    },
  },
  loans: {
    0: {
      id: '0',
      bookId: '42',
      date: '2012-04-21',
      clientName: 'Sam Fellows',
      wasReturned: false,
      dateOfReturn: null,
    },
    1: {
      id: '1',
      bookId: '12',
      date: '2016-05-08',
      clientName: 'Sarah Peters',
      wasReturned: true,
      dateOfReturn: '2016-05-21',
    },
  },
};

// All unit tests
// name: Name to be displayed in console when running test
// test: Function to test server. Returns true if successful, false otherwise
const tests = [
  {
    name: 'Add a new book',
    test: async () => {
      const book = {
        id: '72',
        name: 'Animal Farm',
        authors: ['George Orwell'],
        year: 1945,
        publisher: 'Secker & Warburg',
      };

      // We post our new book to the server
      const { status } = await post('/books', book);
      expect('Status Code', status).toBe(200);

      // Check that the book was correctly written to the database
      const store = readDb();
      expect('Book', store.books['72']).toBe(book);
    },
  },
  {
    name: 'Get book by id',
    test: async () => {
      const { data } = await get('/books/5');

      // Ensure the book we got back matches what's in the database
      expect('Response', data).toBe({
        id: '5',
        name: '1984',
        authors: ['George Orwell'],
        year: 1949,
        publisher: 'Secker & Warburg',
      });
    },
  },
  {
    name: 'Get books',
    test: async () => {
      const { data } = await get('/books');

      // Ensure what we received from the server matches what's in the database
      expect('Books', data).toBe([
        { id: '5', name: '1984' },
        { id: '12', name: 'Fahrenheit 451' },
        { id: '42', name: 'Earth Abides' },
      ]);
    },
  },
  {
    name: 'Get books by year',
    test: async () => {
      const { data } = await get('/books', { params: { year: 1949 } });

      // Ensure we only get the books for the specified year
      expect('Resposne', data).toBe([
        {
          id: '5',
          name: '1984',
          authors: ['George Orwell'],
          year: 1949,
          publisher: 'Secker & Warburg',
        },
        {
          id: '42',
          name: 'Earth Abides',
          authors: ['George R. Stewart'],
          year: 1949,
          publisher: 'Penguin Random House LLC',
        },
      ]);
    },
  },
  {
    name: 'Get if book is available',
    test: async () => {
      // Book 42 is on loan, so ensure it is not available
      const {
        data: { isAvailable: book42Availability },
      } = await get('books/available/42');
      expect('Book 42 availability', book42Availability).toBe(false);

      // Book 5 has never been loaned, so ensure it is available
      const {
        data: { isAvailable: book5Availability },
      } = await get('books/available/5');
      expect('Book 5 availability', book5Availability).toBe(true);

      // Book 12 has been loaned and returned, so ensure it is available
      const {
        data: { isAvailable: book12Availability },
      } = await get('books/available/12');
      expect('Book 12 availability', book12Availability).toBe(true);
    },
  },
  {
    name: 'Add a loan',
    test: async () => {
      const loan = {
        id: '34',
        bookId: '5',
        date: '2011-08-21',
        clientName: 'Jeremy Andrews',
        wasReturned: false,
        dateOfReturn: null,
      };

      // Post loan to the server
      const { status } = await post('/loans', loan);
      expect('Status code', status).toBe(200);

      // Ensure loan was correctly written to the database
      const store = readDb();
      expect('Loan', store.loans['34']).toBe(loan);
    },
  },
  {
    name: 'List all loans that were finished',
    test: async () => {
      // Request loans that have been returned
      const { status, data } = await get('/loans', { params: { wasReturned: true } });
      expect('Status code', status).toBe(200);

      // Ensure loans match those in the test database
      expect('Finished loans', data).toBe([
        {
          id: '1',
          bookId: '12',
          date: '2016-05-08',
          clientName: 'Sarah Peters',
          wasReturned: true,
          dateOfReturn: '2016-05-21',
        },
      ]);
    },
  },
  {
    name: 'List all loans that are open',
    test: async () => {
      // Request loans that have not been returned
      const { status, data } = await get('/loans', { params: { wasReturned: false } });
      expect('Status code', status).toBe(200);

      // Ensure loans match those in the test database
      expect('Finished loans', data).toBe([
        {
          id: '0',
          bookId: '42',
          date: '2012-04-21',
          clientName: 'Sam Fellows',
          wasReturned: false,
          dateOfReturn: null,
        },
      ]);
    },
  },
  {
    name: 'Update a loan',
    test: async () => {
      // Update loan with id 0 to mark that it has been returned
      const { status } = await put('/loans', {
        id: '0',
        wasReturned: true,
      });
      expect('Status code', status).toBe(200);

      // Ensure the loan is the same, but with the wasReturned field being updated
      const store = readDb();
      expect('loan', store.loans['0']).toBe({
        id: '0',
        bookId: '42',
        date: '2012-04-21',
        clientName: 'Sam Fellows',
        wasReturned: true,
        dateOfReturn: null,
      });
    },
  },
];

// Runs all tests, and provides output based on results
for (const [index, { name, test }] of tests.entries()) {
  process.stdout.write(`Running test ${index + 1} of ${tests.length}: ${name}. `);
  writeFileSync(storeFile, JSON.stringify(testDatabase));
  let result = true;
  let error;
  try {
    await test();
  } catch (_error) {
    error = _error;
    result = false;
  }
  process.stdout.write(`${result ? 'Passed' : 'Failed'}\n`);
  if (error) {
    console.error(`Error: ${error}`);
  }
}
