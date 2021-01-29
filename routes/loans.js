import { Router } from 'express';

import { readDb, writeDb } from '../db.js';
import LoanSchema from '../schemas/loan.js';
import { isMatch } from '../validation.js';

const loanRouter = Router();

// Get loans
loanRouter.get('/', (req, res) => {
  let loans = Object.values(readDb().loans);

  // Filter by finished status
  if (req.query.finished === 'true') {
    loans = loans.filter((loan) => loan.finished);
  } else if (req.query.finished === 'false') {
    loans = loans.filter((loan) => !loan.finished);
  }

  res.json(loans);
});

// Insert a loan
loanRouter.post('/', (req, res) => {
  const loan = req.body;

  // Validate inserted data
  if (!isMatch(loan, LoanSchema)) {
    res.status(400).send();
  }

  // Prevent overwrite on post
  if (readDb().loans[loan.id]) {
    res.status(409).send();
    return;
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
    res.status(404).send();
    return;
  }

  // Modify existingLoan with new data
  writeDb({
    loans: {
      [loan.id]: { ...existingLoan, ...loan },
    },
  });
});

export default loanRouter;
