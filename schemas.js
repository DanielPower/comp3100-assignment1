// Validators
export const isString = (value) => typeof value === 'string';
export const isNot = (badValue) => (value) => value !== badValue;
export const isArray = (validator, notEmpty) => (value) => {
  try {
    const array = JSON.parse(value);
    return (
      Array.isArray(array) &&
      array.every((subvalue) => validator(subvalue)) &&
      (!notEmpty || array.length)
    );
  } catch {
    return false;
  }
};
export const isBoolean = (value) => typeof value === 'boolean';
export const isNumber = (value) => typeof value === 'number';

// Schemas
export const BookSchema = {
  id: [isString, isNot('')],
  name: [isString, isNot('')],
  authors: [isArray([isString, isNot('')], true)],
  year: [isNumber],
  publisher: [isString],
};

export const LoanSchema = {
  id: [isString, isNot('')],
  bookId: [isString, isNot('')],
  date: [isNumber, isNot('')],
  clientName: [isString, isNot('')],
  wasReturned: [isBoolean],
  dateOfReturn: [isNumber, isNot('')],
};

// Matching
export const isMatch = (object, schema, { allowSubset = false } = {}) =>
  Object.keys(schema).every((key) => {
    // If we allow subsets, we'll return true, accepting that this key is missing.
    // Otherwise, we'll return false, rejecting the validation.
    if (typeof object[key] === 'undefined') {
      console.error(`Key [${key}] missing in schema validation`);
      return allowSubset;
    }
    return schema[key].every((validator) => {
      const result = validator(object[key]);
      if (!result) {
        console.error(
          `Key [${key}] failed in schema validation. Received ${object[key]}`
        );
      }
      return result;
    });
  });
