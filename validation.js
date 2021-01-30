// Field validation functions
export const isString = (value) => typeof value === 'string';
export const isNot = (badValue) => (value) => value !== badValue;
export const isArray = (validators, notEmpty) => (value) => {
  try {
    return (
      Array.isArray(value) &&
      value.every((subvalue) => validators.every((validator) => validator(subvalue))) &&
      (!notEmpty || value.length)
    );
  } catch {
    return false;
  }
};
export const isBoolean = (value) => typeof value === 'boolean';
export const isNumber = (value) => typeof value === 'number';
export const isEqualTo = (expectation) => (value) => value === expectation;
export const isOneOf = (validators) => (value) =>
  validators.some((validator) => validator(value));

// Schema validation function
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
