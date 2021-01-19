import { isString, isBoolean, isNumber, isNot } from '../validation.js';

const LoanSchema = {
  id: [isString, isNot('')],
  bookId: [isString, isNot('')],
  date: [isNumber, isNot('')],
  clientName: [isString, isNot('')],
  wasReturned: [isBoolean],
  dateOfReturn: [isNumber, isNot('')],
};

export default LoanSchema;
