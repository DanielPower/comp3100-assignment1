import axios from 'axios';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';

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

// Setup an axios instance so we don't have to repeat the url prefix on every request
// Set a timeout so requests don't wait forever if the server stalls
const { get, put, post } = axios.create({
  baseURL: location,
  timeout: 1000,
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
  loans: {},
};

// All unit tests
// name: Name to be displayed in console when running test
// test: Function to test server. Returns true if successful, false otherwise
const tests = [
  {
    name: 'Get books',
    test: async () => {
      const { data } = await get('/books');
      return isEqual(data, [
        { id: '5', name: '1984' },
        { id: '12', name: 'Fahrenheit 451' },
        { id: '42', name: 'Earth Abides' },
      ]);
    },
  },
  {
    name: 'Get book by id',
    test: async () => {
      const { data } = await get('/books/5');
      return isEqual(data, {
        id: '5',
        name: '1984',
        authors: ['George Orwell'],
        year: 1949,
        publisher: 'Secker & Warburg',
      });
    },
  },
  {
    name: 'Get books by year',
    test: async () => {
      const { data } = await get('/books', { params: { year: 1949 } });
      return isEqual(data, [
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
];

// Runs all tests, and provides output based on results
for (const [index, { name, test }] of tests.entries()) {
  process.stdout.write(`Running test ${index + 1} of ${tests.length}: ${name}. `);
  writeFileSync(storeFile, JSON.stringify(testDatabase));
  let result;
  try {
    result = await test();
  } catch (e) {
    result = false;
  }
  process.stdout.write(`${result ? 'Passed' : 'Failed'}\n`);
}
