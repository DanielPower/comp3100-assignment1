import { Router } from 'express';

import { readDb, writeDb } from '../db.js';
import LoanSchema from '../schemas/loan.js';
import { isMatch } from '../validation.js';

const loanRouter = Router();

// Get loans
loanRouter.get('/', (req, res) => {
  let loans = Object.values(readDb().loans);

  // Filter by finished status
  if (req.query.wasReturned === 'true') {
    loans = loans.filter((loan) => loan.wasReturned);
  } else if (req.query.wasReturned === 'false') {
    loans = loans.filter((loan) => !loan.wasReturned);
  }

  res.json(loans);
});

// Insert a loan
loanRouter.post('/', (req, res) => {
  const loan = req.body;

  // Prevent overwrite on post
  if (readDb().loans[loan.id]) {
    return res.status(409).send();
  }

  // Validate data before inserting data
  if (!isMatch(loan, LoanSchema)) {
    return res.status(400).send();
  }

  // Write new loan data to cache
  writeDb({
    loans: {
      [loan.id]: loan,
    },
  });
  res.send();
});

// Update a loan
loanRouter.put('/', (req, res) => {
  const loan = req.body;
  const existingLoan = readDb().loans[loan.id];

  // Handle loan not found case
  if (!existingLoan) {
    return res.status(404).send();
  }

  // Validate data before inserting
  // In this case we allow a subset, because we only need to pass the id, and the data
  // that needs to change
  if (!isMatch(loan, LoanSchema, { allowSubset: true })) {
    return res.status(400).send();
  }

  // Modify existingLoan with new data
  writeDb({
    loans: {
      [loan.id]: { ...existingLoan, ...loan },
    },
  });
  res.send();
});

export default loanRouter;
