import { Router } from 'express';
import { db } from '../app.js';
import { isMatch, LoanSchema } from '../schemas.js';

const loanRouter = Router();

// Get loans
loanRouter.get('/', (req, res) => {
  let loans = Object.values(db.getCache().loans);

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
  if (db.getCache().loans[loan.id]) {
    res.status(409).send();
    return;
  }

  // Write new loan data to cache
  db.writeCache({
    loans: {
      [loan.id]: loan,
    },
  });
  res.send();
});

// Update a loan
loanRouter.put('/', (req, res) => {
  const loan = req.body;
  const existingLoan = db.getCache().loans[loan.id];

  // Handle loan not found case
  if (!existingLoan) {
    res.status(404).send();
    return;
  }

  // Modify existingLoan with new data
  db.writeCache({
    loans: {
      [loan.id]: { ...existingLoan, ...loan },
    },
  });
});

export default loanRouter;
