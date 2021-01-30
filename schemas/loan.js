import { isString, isBoolean, isNot, isOneOf, isEqualTo } from '../validation.js';

const LoanSchema = {
  id: [isString, isNot('')],
  bookId: [isString, isNot('')],
  date: [isString, isNot('')],
  clientName: [isString, isNot('')],
  wasReturned: [isBoolean],
  // Return date can be null if the book has not been returned
  dateOfReturn: [isOneOf([isString, isEqualTo(null)]), isNot('')],
};

export default LoanSchema;
