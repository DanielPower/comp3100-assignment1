import { isString, isArray, isNumber, isNot } from '../validation.js';

const BookSchema = {
  id: [isString, isNot('')],
  name: [isString, isNot('')],
  authors: [isArray([isString, isNot('')], true)],
  year: [isNumber],
  publisher: [isString],
};

export default BookSchema;
